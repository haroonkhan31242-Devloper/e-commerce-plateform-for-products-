import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { PasswordInput } from '../../components/common/PasswordInput.tsx';
import { GoogleSignInButton } from '../../components/customer/GoogleSignInButton.tsx';
import { MIN_PASSWORD_LENGTH, requestPasswordReset, validatePassword } from '../../services/authService.ts';
import { isValidEmail } from '../../utils/validation.ts';

export type CustomerAuthMode = 'login' | 'signup';
type FormMode = CustomerAuthMode | 'forgot';
type Field = 'name' | 'email' | 'password' | 'confirmPassword';
type FieldErrors = Partial<Record<Field, string>>;

interface CustomerAuthPageProps {
  mode: CustomerAuthMode;
  // Shown inside another page (the account page) instead of on its own route
  embedded?: boolean;
  onModeChange?: (mode: CustomerAuthMode) => void;
}

const inputClasses =
  'w-full min-h-11 px-3.5 py-2.5 text-base sm:text-sm border border-neutral-300 rounded-xl bg-white focus:outline-none focus:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/10 transition-colors aria-[invalid=true]:border-rose-500';
const labelClasses = 'block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5';

const COPY: Record<FormMode, { title: string; subtitle: string }> = {
  login: { title: 'Welcome back', subtitle: 'Sign in to track orders, save addresses and check out faster.' },
  signup: { title: 'Create your account', subtitle: 'Join STEROSE to manage orders and save your details.' },
  forgot: { title: 'Reset your password', subtitle: 'Enter the email address you used to create your account.' },
};

export const CustomerAuthPage: React.FC<CustomerAuthPageProps> = ({ mode, embedded = false, onModeChange }) => {
  const { customerUser, registerCustomer, customerLogin, setCurrentView, showToast } = useStore();

  const [formMode, setFormMode] = useState<FormMode>(mode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => setFormMode(mode), [mode]);

  // Signed-in customers who open /login or /signup go to their account instead
  useEffect(() => {
    if (customerUser && !embedded) setCurrentView('account');
  }, [customerUser, embedded, setCurrentView]);

  const switchMode = (next: FormMode) => {
    setErrors({});
    setPassword('');
    setConfirmPassword('');
    if (next !== 'forgot' && onModeChange) onModeChange(next);
    else if (next !== 'forgot' && !embedded) setCurrentView(next);
    setFormMode(next);
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (formMode === 'signup' && name.trim().length < 2) next.name = 'Enter your full name.';
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address, for example name@example.com.';
    if (formMode === 'login' && !password) next.password = 'Enter your password.';
    if (formMode === 'signup') {
      const passwordError = validatePassword(password);
      if (passwordError) next.password = passwordError;
      if (!confirmPassword) next.confirmPassword = 'Confirm your password.';
      else if (confirmPassword !== password) next.confirmPassword = 'The passwords don’t match.';
    }
    return next;
  };

  const focusFirstError = (fieldErrors: FieldErrors) => {
    const first = (['name', 'email', 'password', 'confirmPassword'] as Field[]).find((field) => fieldErrors[field]);
    if (first) formRef.current?.querySelector<HTMLInputElement>(`#auth-${first}`)?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      focusFirstError(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (formMode === 'forgot') {
        const { available } = await requestPasswordReset(email);
        showToast(
          'info',
          available
            ? 'If an account exists for this email, a reset link is on its way.'
            : 'Password reset by email isn’t available yet. Please contact customer support for help.'
        );
        return;
      }

      const result =
        formMode === 'signup'
          ? await registerCustomer(name, email, password)
          : await customerLogin(email, password);

      if (!result.ok) {
        if (result.field === 'email') {
          setErrors({ email: result.message });
          focusFirstError({ email: result.message });
        } else {
          showToast('error', result.message);
        }
        return;
      }
      // Embedded on the account page, the account simply appears; on its own route, shop on
      if (!embedded) setCurrentView('home');
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorProps = (field: Field, hintId?: string) => ({
    'aria-invalid': !!errors[field],
    'aria-describedby': errors[field] ? `auth-${field}-error` : hintId,
  });

  const fieldError = (field: Field) =>
    errors[field] ? (
      <p id={`auth-${field}-error`} role="alert" className="text-xs text-rose-700 mt-1.5">
        {errors[field]}
      </p>
    ) : null;

  const { title, subtitle } = COPY[formMode];
  const submitLabel = formMode === 'signup' ? 'Create Account' : formMode === 'login' ? 'Sign In' : 'Send Reset Link';
  const pendingLabel = formMode === 'signup' ? 'Creating account...' : formMode === 'login' ? 'Signing in...' : 'Sending...';

  if (customerUser && !embedded) return null;

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-800 mx-auto flex items-center justify-center border border-amber-200">
            <User className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-900">{title}</h1>
            <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>
          </div>
        </div>

        <form
          ref={formRef}
          key={formMode}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 animate-in fade-in duration-200"
        >
          {formMode === 'signup' && (
            <div>
              <label htmlFor="auth-name" className={labelClasses}>
                Full name *
              </label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClasses}
                {...errorProps('name')}
              />
              {fieldError('name')}
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className={labelClasses}>
              Email address *
            </label>
            <input
              id="auth-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              {...errorProps('email')}
            />
            {fieldError('email')}
          </div>

          {formMode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="auth-password" className={`${labelClasses} mb-0`}>
                  Password *
                </label>
                {formMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs font-semibold text-amber-900 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <PasswordInput
                id="auth-password"
                autoComplete={formMode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                {...errorProps('password', formMode === 'signup' ? 'auth-password-hint' : undefined)}
              />
              {errors.password
                ? fieldError('password')
                : formMode === 'signup' && (
                    <p id="auth-password-hint" className="text-xs text-neutral-500 mt-1.5">
                      At least {MIN_PASSWORD_LENGTH} characters, with a letter and a number.
                    </p>
                  )}
            </div>
          )}

          {formMode === 'signup' && (
            <div>
              <label htmlFor="auth-confirmPassword" className={labelClasses}>
                Confirm password *
              </label>
              <PasswordInput
                id="auth-confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses}
                {...errorProps('confirmPassword')}
              />
              {fieldError('confirmPassword')}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-11 py-3 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2 transition-[background-color,transform] duration-150"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            <span>{isSubmitting ? pendingLabel : submitLabel}</span>
          </button>
        </form>

        {formMode === 'forgot' ? (
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to sign in</span>
          </button>
        ) : (
          <>
            <div className="relative flex items-center justify-center" aria-hidden="true">
              <span className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-xs text-neutral-500 uppercase font-semibold shrink-0">Or</span>
              <span className="border-t border-neutral-200 w-full" />
            </div>

            <GoogleSignInButton />

            <p className="text-sm text-neutral-600 text-center">
              {formMode === 'login' ? 'New to STEROSE? ' : 'Already have an account? '}
              <button
                type="button"
                onClick={() => switchMode(formMode === 'login' ? 'signup' : 'login')}
                className="font-semibold text-neutral-900 underline underline-offset-2 hover:text-amber-900"
              >
                {formMode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </>
        )}

        <p className="text-[11px] text-neutral-500 text-center border-t border-neutral-100 pt-4">
          Demo store: accounts are saved only in this browser.
        </p>
      </div>
    </div>
  );
};
