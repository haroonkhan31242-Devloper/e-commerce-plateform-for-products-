// Authentication helpers for the frontend-only prototype.
//
// IMPORTANT: everything here runs in the browser and is stored in localStorage. Passwords
// are salted and hashed (PBKDF2) so they are never kept in plain text, but anyone with
// access to the browser can still read or edit this data, and every permission check can
// be bypassed from the developer tools. This is NOT production-secure authentication.
// When a backend is added, replace these functions with API calls (registration, login,
// sessions and authorization must then be enforced on the server) and keep the callers.

import { AdminSession, CustomerAccount, CustomerProfile, PasswordHash } from '../types/index.ts';

export const STORAGE_KEYS = {
  adminSession: 'sterose_admin_session',
  staffAccounts: 'sterose_staff_accounts',
  customerAccounts: 'sterose_customer_accounts',
  // The signed-in customer's profile; kept under its original key so existing sessions survive
  customerSession: 'aura_customer',
  legacyAdminFlag: 'aura_admin_logged',
} as const;

export const MIN_PASSWORD_LENGTH = 8;
const PBKDF2_ITERATIONS = 120_000;

export class AuthUnavailableError extends Error {}

const toHex = (buffer: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');

const fromHex = (hex: string) => new Uint8Array(hex.match(/.{2}/g)?.map((byte) => parseInt(byte, 16)) ?? []);

const getSubtleCrypto = () => {
  if (!globalThis.crypto?.subtle) {
    // Web Crypto only exists on secure origins (HTTPS or localhost)
    throw new AuthUnavailableError('Secure sign-in needs HTTPS or localhost. Please open the store over a secure connection.');
  }
  return globalThis.crypto.subtle;
};

const derive = async (password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) => {
  const subtle = getSubtleCrypto();
  const key = await subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return toHex(bits);
};

export const hashPassword = async (password: string): Promise<PasswordHash> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    algorithm: 'PBKDF2-SHA256',
    iterations: PBKDF2_ITERATIONS,
    salt: toHex(salt),
    hash: await derive(password, salt, PBKDF2_ITERATIONS),
  };
};

export const verifyPassword = async (password: string, stored: PasswordHash | undefined): Promise<boolean> => {
  if (!stored) return false;
  const candidate = await derive(password, fromHex(stored.salt), stored.iterations);
  // Constant-time comparison of equal-length hex strings
  let diff = candidate.length ^ stored.hash.length;
  for (let i = 0; i < candidate.length; i++) diff |= candidate.charCodeAt(i) ^ stored.hash.charCodeAt(i);
  return diff === 0;
};

// Returns an error message, or null when the password is acceptable
export const validatePassword = (password: string): string | null => {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Include at least one letter and one number.';
  return null;
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const normalizeUsername = (username: string) => username.trim().toLowerCase();

export const generateId = (prefix: string) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`;

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ---------------------------------------------------------------------------
// Admin Panel session (Main Admin or staff)
// ---------------------------------------------------------------------------

export const readAdminSession = (): AdminSession | null => {
  const session = readJson<AdminSession | null>(STORAGE_KEYS.adminSession, null);
  if (session?.role === 'admin' || (session?.role === 'staff' && typeof session.staffId === 'string')) {
    return session;
  }
  // Sessions saved before staff accounts existed were a plain flag
  if (localStorage.getItem(STORAGE_KEYS.legacyAdminFlag) === 'true') return { role: 'admin' };
  return null;
};

export const writeAdminSession = (session: AdminSession | null) => {
  localStorage.removeItem(STORAGE_KEYS.legacyAdminFlag);
  if (session) writeJson(STORAGE_KEYS.adminSession, session);
  else localStorage.removeItem(STORAGE_KEYS.adminSession);
};

// ---------------------------------------------------------------------------
// Customer accounts
// ---------------------------------------------------------------------------

const readCustomerAccounts = () => readJson<CustomerAccount[]>(STORAGE_KEYS.customerAccounts, []);
const findCustomerAccount = (email: string) =>
  readCustomerAccounts().find((account) => account.email === normalizeEmail(email));

export const registerCustomerAccount = async (
  name: string,
  email: string,
  password: string
): Promise<{ ok: true; profile: CustomerProfile } | { ok: false; field: 'email'; message: string }> => {
  const normalizedEmail = normalizeEmail(email);
  if (findCustomerAccount(normalizedEmail)) {
    return { ok: false, field: 'email', message: 'An account with this email already exists. Try signing in instead.' };
  }

  const now = new Date();
  const profile: CustomerProfile = {
    id: generateId('cust'),
    name: name.trim(),
    email: normalizedEmail,
    phone: '',
    savedAddresses: [],
    totalOrders: 0,
    totalSpent: 0,
    createdAt: now.toISOString().split('T')[0],
  };
  const account: CustomerAccount = {
    id: profile.id,
    email: normalizedEmail,
    provider: 'password',
    password: await hashPassword(password),
    profile,
    createdAt: now.toISOString(),
  };

  writeJson(STORAGE_KEYS.customerAccounts, [...readCustomerAccounts(), account]);
  return { ok: true, profile };
};

export const verifyCustomerCredentials = async (email: string, password: string): Promise<CustomerProfile | null> => {
  const account = findCustomerAccount(email);
  // Hash even when the account is missing so both failures take similar time
  const isValid = await verifyPassword(password, account?.password ?? (await hashPassword('placeholder')));
  return account && isValid ? account.profile : null;
};

// Keeps the stored account in step when the signed-in customer edits their profile
export const syncCustomerProfile = (profile: CustomerProfile) => {
  const accounts = readCustomerAccounts();
  const index = accounts.findIndex((account) => account.email === normalizeEmail(profile.email));
  if (index === -1) return;
  accounts[index] = { ...accounts[index], profile };
  try {
    writeJson(STORAGE_KEYS.customerAccounts, accounts);
  } catch (error) {
    console.warn('Could not save customer account', error);
  }
};

// POST /api/auth/password-reset (not connected yet). Resolves `false` so the UI can say so
// honestly instead of pretending an email was sent.
export const requestPasswordReset = async (_email: string): Promise<{ available: boolean }> => ({ available: false });
