import React, { useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { Modal } from '../common/Overlay.tsx';
import { PasswordInput } from '../common/PasswordInput.tsx';
import { useAdminAuth } from '../../context/AdminAuthContext.tsx';
import { MIN_PASSWORD_LENGTH } from '../../services/authService.ts';
import { STAFF_SECTIONS } from '../../utils/permissions.ts';
import { StaffAccount, StaffSection } from '../../types/index.ts';

export type StaffFormMode = 'create' | 'edit' | 'password';

interface StaffFormModalProps {
  isOpen: boolean;
  mode: StaffFormMode;
  staff: StaffAccount | null;
  onClose: () => void;
}

type FieldErrors = Partial<Record<'fullName' | 'username' | 'password' | 'confirmPassword' | 'sections' | 'form', string>>;

const inputClasses =
  'w-full min-h-11 px-3 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 bg-white aria-[invalid=true]:border-rose-500';
const labelClasses = 'block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1';

const FieldError: React.FC<{ id: string; message?: string }> = ({ id, message }) =>
  message ? (
    <p id={id} role="alert" className="text-xs text-rose-700 mt-1">
      {message}
    </p>
  ) : null;

const TITLES: Record<StaffFormMode, string> = {
  create: 'Add Staff Member',
  edit: 'Edit Staff Member',
  password: 'Change Password',
};

export const StaffFormModal: React.FC<StaffFormModalProps> = ({ isOpen, mode, staff, onClose }) => {
  const { createStaff, updateStaff, changeStaffPassword } = useAdminAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sections, setSections] = useState<StaffSection[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFullName(staff?.fullName ?? '');
    setUsername(staff?.username ?? '');
    setSections(staff?.sections ?? []);
    setIsActive(staff?.isActive ?? true);
    setPassword('');
    setConfirmPassword('');
    setErrors({});
  }, [isOpen, staff]);

  const showsDetails = mode !== 'password';
  const showsPassword = mode !== 'edit';
  const allSelected = sections.length === STAFF_SECTIONS.length;

  const toggleSection = (tab: StaffSection) =>
    setSections((prev) => (prev.includes(tab) ? prev.filter((s) => s !== tab) : [...prev, tab]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: FieldErrors = {};
    if (showsDetails) {
      if (!fullName.trim()) nextErrors.fullName = 'Enter the staff member’s full name.';
      if (!username.trim()) nextErrors.username = 'Choose a username.';
      if (sections.length === 0) nextErrors.sections = 'Assign at least one section.';
    }
    if (showsPassword) {
      if (!password) nextErrors.password = 'Enter a password.';
      else if (password !== confirmPassword) nextErrors.confirmPassword = 'The passwords don’t match.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    const input = { fullName, username, sections, isActive };
    const result =
      mode === 'create'
        ? await createStaff(input, password)
        : mode === 'edit' && staff
          ? updateStaff(staff.id, input)
          : staff
            ? await changeStaffPassword(staff.id, password)
            : { ok: false as const, message: 'Staff account not found.' };
    setIsSaving(false);

    if (result.ok) {
      onClose();
      return;
    }
    const field = (['fullName', 'username', 'password', 'sections'] as const).find((f) => f === result.field) ?? 'form';
    setErrors({ [field]: result.message });
  };

  const describedBy = (field: keyof FieldErrors) => (errors[field] ? `staff-${field}-error` : undefined);

  return (
    <Modal isOpen={isOpen} onClose={onClose} label={TITLES[mode]} className="max-w-xl max-h-[92dvh] overflow-y-auto">
      <div className="p-5 sm:p-6 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-serif text-lg font-bold text-neutral-900">{TITLES[mode]}</h2>
          {staff && mode !== 'create' && (
            <p className="text-xs text-neutral-500 truncate">
              {staff.fullName} · <span className="font-mono">@{staff.username}</span>
            </p>
          )}
        </div>
        <button onClick={onClose} aria-label="Close" className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg">
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6 space-y-5">
        {showsDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="staff-full-name" className={labelClasses}>
                Full name *
              </label>
              <input
                id="staff-full-name"
                type="text"
                autoComplete="off"
                value={fullName}
                aria-invalid={!!errors.fullName}
                aria-describedby={describedBy('fullName')}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClasses}
              />
              <FieldError id="staff-fullName-error" message={errors.fullName} />
            </div>
            <div>
              <label htmlFor="staff-username" className={labelClasses}>
                Username *
              </label>
              <input
                id="staff-username"
                type="text"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                aria-invalid={!!errors.username}
                aria-describedby={describedBy('username') ?? 'staff-username-hint'}
                onChange={(e) => setUsername(e.target.value)}
                className={`${inputClasses} font-mono`}
              />
              {errors.username ? (
                <FieldError id="staff-username-error" message={errors.username} />
              ) : (
                <p id="staff-username-hint" className="text-xs text-neutral-500 mt-1">
                  Used to sign in. Letters, numbers, dots, dashes, underscores.
                </p>
              )}
            </div>
          </div>
        )}

        {showsPassword && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="staff-password" className={labelClasses}>
                {mode === 'password' ? 'New password *' : 'Password *'}
              </label>
              <PasswordInput
                id="staff-password"
                autoComplete="new-password"
                value={password}
                aria-invalid={!!errors.password}
                aria-describedby={describedBy('password') ?? 'staff-password-hint'}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
              />
              {errors.password ? (
                <FieldError id="staff-password-error" message={errors.password} />
              ) : (
                <p id="staff-password-hint" className="text-xs text-neutral-500 mt-1">
                  At least {MIN_PASSWORD_LENGTH} characters, with a letter and a number.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="staff-confirm-password" className={labelClasses}>
                Confirm password *
              </label>
              <PasswordInput
                id="staff-confirm-password"
                autoComplete="new-password"
                value={confirmPassword}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={describedBy('confirmPassword')}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses}
              />
              <FieldError id="staff-confirmPassword-error" message={errors.confirmPassword} />
            </div>
          </div>
        )}

        {showsDetails && (
          <fieldset aria-describedby={describedBy('sections')}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <legend className={labelClasses}>Section access *</legend>
              <button
                type="button"
                onClick={() => setSections(allSelected ? [] : STAFF_SECTIONS.map((s) => s.tab))}
                className="text-xs font-semibold text-amber-900 hover:underline"
              >
                {allSelected ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-3">
              Each section comes with full access: view, add, edit and delete everything inside it.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STAFF_SECTIONS.map((section) => {
                const isChecked = sections.includes(section.tab);
                return (
                  <label
                    key={section.tab}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      isChecked ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSection(section.tab)}
                      className="sr-only peer"
                    />
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400 ${
                        isChecked ? 'bg-neutral-900 border-neutral-900 text-amber-400' : 'border-neutral-400 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-neutral-900">{section.label}</span>
                      <span className="block text-[11px] text-neutral-500">{section.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <FieldError id="staff-sections-error" message={errors.sections} />
          </fieldset>
        )}

        {showsDetails && (
          <label className="flex items-center justify-between gap-4 p-3 rounded-xl border border-neutral-200 cursor-pointer">
            <span>
              <span className="block text-xs font-bold text-neutral-900">Account active</span>
              <span className="block text-[11px] text-neutral-500">Disabled accounts cannot sign in.</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-10 h-6 shrink-0 appearance-none rounded-full bg-neutral-300 checked:bg-emerald-600 relative cursor-pointer transition-colors before:content-[''] before:absolute before:top-1 before:left-1 before:w-4 before:h-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            />
          </label>
        )}

        {errors.form && (
          <p role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {errors.form}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
            <span>
              {isSaving
                ? 'Saving...'
                : mode === 'create'
                  ? 'Create Account'
                  : mode === 'edit'
                    ? 'Save Changes'
                    : 'Change Password'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
