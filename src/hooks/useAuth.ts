import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';

/**
 * Custom hook that bridges Clerk authentication state for the application.
 * Provides the current user, session, loading state, token getter, and sign-out function.
 */
export function useAuth() {
  const { isLoaded: authLoaded, isSignedIn, userId, getToken, signOut } = useClerkAuth();
  const { isLoaded: userLoaded, user: clerkUser } = useUser();

  const loading = !authLoaded || (isSignedIn && !userLoaded);

  const user = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
        user_metadata: {
          full_name: clerkUser.fullName || clerkUser.firstName || '',
        },
      }
    : null;

  const session = isSignedIn && user ? { user } : null;

  return {
    isLoaded: !loading,
    loading,
    isSignedIn: !!isSignedIn,
    session,
    user,
    userId: userId ?? clerkUser?.id ?? null,
    getToken,
    signOut,
    isRecoveryMode: false,
    setIsRecoveryMode: () => {},
  };
}
