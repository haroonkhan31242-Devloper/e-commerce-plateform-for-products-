// Integration point for "Continue with Google".
//
// Google sign-in is NOT connected yet. When an auth provider is added (Google Identity
// Services, Firebase Auth, Auth0, Supabase, or a backend OAuth flow), implement
// `startGoogleSignIn` to run that flow and resolve with the verified Google profile, then set
// `GOOGLE_SIGN_IN_ENABLED` to true. The button and the store's customer session already
// accept the result; nothing else in the UI needs to change.

export interface GoogleProfile {
  email: string;
  name: string;
  avatar?: string;
}

export const GOOGLE_SIGN_IN_ENABLED = false;

export class GoogleSignInUnavailableError extends Error {
  constructor() {
    super('Google sign-in is not available yet. Please use your email and password for now.');
  }
}

export const startGoogleSignIn = async (): Promise<GoogleProfile> => {
  throw new GoogleSignInUnavailableError();
};
