import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useToastActions } from './ToastContext.tsx';
import { useStore } from './StoreContext.tsx';
import { usePersistedState } from '../hooks/usePersistedState.ts';
import { loginAdmin } from '../services/storeApi.ts';
import {
  AuthUnavailableError,
  STORAGE_KEYS,
  generateId,
  hashPassword,
  normalizeUsername,
  readAdminSession,
  validatePassword,
  verifyPassword,
  writeAdminSession,
} from '../services/authService.ts';
import { AdminAccess, canAccessTab, getAccessibleTabs, isStaffSection } from '../utils/permissions.ts';
import { AdminSession, AdminTab, AuthResult, StaffAccount, StaffSection } from '../types/index.ts';

export interface StaffInput {
  fullName: string;
  username: string;
  sections: StaffSection[];
  isActive: boolean;
}

interface AdminAuthContextValue {
  isAdminAuthenticated: boolean;
  isMainAdmin: boolean;
  currentStaff: StaffAccount | null;
  access: AdminAccess | null;
  accessibleTabs: AdminTab[];
  canAccess: (tab: AdminTab) => boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  staffLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;

  // Staff Management (Main Admin only)
  staffAccounts: StaffAccount[];
  createStaff: (input: StaffInput, password: string) => Promise<AuthResult>;
  updateStaff: (id: string, input: StaffInput) => AuthResult;
  changeStaffPassword: (id: string, password: string) => Promise<AuthResult>;
  setStaffActive: (id: string, isActive: boolean) => void;
  deleteStaff: (id: string) => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;

const validateStaffInput = (input: StaffInput, others: StaffAccount[]): AuthResult => {
  if (!input.fullName.trim()) return { ok: false, field: 'fullName', message: 'Enter the staff member’s full name.' };
  const username = normalizeUsername(input.username);
  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      field: 'username',
      message: 'Use 3–32 characters: letters, numbers, dots, dashes or underscores.',
    };
  }
  if (others.some((staff) => staff.username === username)) {
    return { ok: false, field: 'username', message: 'This username is already taken.' };
  }
  if (input.sections.filter(isStaffSection).length === 0) {
    return { ok: false, field: 'sections', message: 'Assign at least one section.' };
  }
  return { ok: true };
};

const sanitizeSections = (sections: StaffSection[]) => [...new Set(sections.filter(isStaffSection))];

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToastActions();
  const { setCurrentView } = useStore();

  const [session, setSessionState] = useState<AdminSession | null>(readAdminSession);
  const [staffAccounts, setStaffAccounts] = usePersistedState<StaffAccount[]>(STORAGE_KEYS.staffAccounts, [], () =>
    showToast('error', 'Browser storage is full. Staff changes could not be saved.')
  );

  const setSession = useCallback((next: AdminSession | null) => {
    setSessionState(next);
    writeAdminSession(next);
  }, []);

  // A staff session is only valid while that account exists and is active
  const currentStaff =
    session?.role === 'staff'
      ? staffAccounts.find((staff) => staff.id === session.staffId && staff.isActive) ?? null
      : null;
  const isStaleStaffSession = session?.role === 'staff' && !currentStaff;

  useEffect(() => {
    if (!isStaleStaffSession) return;
    setSession(null);
    showToast('warning', 'Your staff access has been changed. Please sign in again.');
  }, [isStaleStaffSession, setSession, showToast]);

  const access = useMemo<AdminAccess | null>(() => {
    if (session?.role === 'admin') return { role: 'admin' };
    if (currentStaff) return { role: 'staff', sections: currentStaff.sections };
    return null;
  }, [session, currentStaff]);

  const canAccess = useCallback((tab: AdminTab) => canAccessTab(access, tab), [access]);
  const accessibleTabs = useMemo(() => getAccessibleTabs(access), [access]);
  const isMainAdmin = access?.role === 'admin';

  const reportAuthError = (error: unknown) => {
    console.error('Sign-in failed', error);
    showToast(
      'error',
      error instanceof AuthUnavailableError ? error.message : 'Sign-in failed. Please try again.'
    );
  };

  const adminLogin = async (email: string, password: string) => {
    const isValid = await loginAdmin(email, password);
    if (!isValid) {
      showToast('error', 'Incorrect email or password.');
      return false;
    }
    setSession({ role: 'admin' });
    showToast('success', 'Welcome back, Administrator.');
    return true;
  };

  const staffLogin = async (username: string, password: string) => {
    try {
      const staff = staffAccounts.find((account) => account.username === normalizeUsername(username));
      const isValid = staff ? await verifyPassword(password, staff.password) : false;
      if (!staff || !isValid) {
        showToast('error', 'Incorrect username or password.');
        return false;
      }
      if (!staff.isActive) {
        showToast('error', 'This staff account is disabled. Please contact the store administrator.');
        return false;
      }
      const now = new Date().toISOString();
      setStaffAccounts((prev) => prev.map((s) => (s.id === staff.id ? { ...s, lastLoginAt: now } : s)));
      setSession({ role: 'staff', staffId: staff.id });
      showToast('success', `Welcome, ${staff.fullName.split(' ')[0]}.`);
      return true;
    } catch (error) {
      reportAuthError(error);
      return false;
    }
  };

  const adminLogout = () => {
    setSession(null);
    setCurrentView('home');
    showToast('info', 'Signed out of the admin portal.');
  };

  // Every Staff Management action re-checks the role, not just the hidden sidebar link
  const denied: AuthResult = { ok: false, message: 'Only the Main Admin can manage staff accounts.' };

  const createStaff = async (input: StaffInput, password: string): Promise<AuthResult> => {
    if (!isMainAdmin) return denied;
    const validation = validateStaffInput(input, staffAccounts);
    if (!validation.ok) return validation;
    const passwordError = validatePassword(password);
    if (passwordError) return { ok: false, field: 'password', message: passwordError };

    try {
      const now = new Date().toISOString();
      const staff: StaffAccount = {
        id: generateId('staff'),
        fullName: input.fullName.trim(),
        username: normalizeUsername(input.username),
        password: await hashPassword(password),
        sections: sanitizeSections(input.sections),
        isActive: input.isActive,
        createdAt: now,
        updatedAt: now,
      };
      setStaffAccounts((prev) => [...prev, staff]);
      showToast('success', `Staff account created for ${staff.fullName}.`);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof AuthUnavailableError ? error.message : 'The account could not be created. Please try again.',
      };
    }
  };

  const updateStaff = (id: string, input: StaffInput): AuthResult => {
    if (!isMainAdmin) return denied;
    const validation = validateStaffInput(
      input,
      staffAccounts.filter((staff) => staff.id !== id)
    );
    if (!validation.ok) return validation;

    setStaffAccounts((prev) =>
      prev.map((staff) =>
        staff.id === id
          ? {
              ...staff,
              fullName: input.fullName.trim(),
              username: normalizeUsername(input.username),
              sections: sanitizeSections(input.sections),
              isActive: input.isActive,
              updatedAt: new Date().toISOString(),
            }
          : staff
      )
    );
    showToast('success', 'Staff account updated.');
    return { ok: true };
  };

  const changeStaffPassword = async (id: string, password: string): Promise<AuthResult> => {
    if (!isMainAdmin) return denied;
    const passwordError = validatePassword(password);
    if (passwordError) return { ok: false, field: 'password', message: passwordError };
    try {
      const hashed = await hashPassword(password);
      setStaffAccounts((prev) =>
        prev.map((staff) =>
          staff.id === id ? { ...staff, password: hashed, updatedAt: new Date().toISOString() } : staff
        )
      );
      showToast('success', 'Password changed.');
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof AuthUnavailableError ? error.message : 'The password could not be changed. Please try again.',
      };
    }
  };

  const setStaffActive = (id: string, isActive: boolean) => {
    if (!isMainAdmin) return;
    setStaffAccounts((prev) =>
      prev.map((staff) => (staff.id === id ? { ...staff, isActive, updatedAt: new Date().toISOString() } : staff))
    );
    showToast('success', isActive ? 'Staff account enabled.' : 'Staff account disabled.');
  };

  const deleteStaff = (id: string) => {
    if (!isMainAdmin) return;
    setStaffAccounts((prev) => prev.filter((staff) => staff.id !== id));
    showToast('info', 'Staff account deleted.');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated: access !== null,
        isMainAdmin,
        currentStaff,
        access,
        accessibleTabs,
        canAccess,
        adminLogin,
        staffLogin,
        adminLogout,
        staffAccounts,
        createStaff,
        updateStaff,
        changeStaffPassword,
        setStaffActive,
        deleteStaff,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
