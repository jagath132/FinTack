import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  applyActionCode,
  ActionCodeSettings,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

interface User {
  id: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerified: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || undefined,
            emailVerified: firebaseUser.emailVerified,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error processing auth state:", error);
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    const oobCode = urlParams.get("oobCode");

    if (mode === "verifyEmail" && oobCode) {
      applyActionCode(auth, oobCode)
        .then(async () => {
          // Reload user to update emailVerified status
          if (auth.currentUser) {
            await auth.currentUser.reload();
            setUser((prev) => {
              if (prev) {
                return { ...prev, emailVerified: true };
              }
              return prev;
            });
          }
          // Clear the URL parameters
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        })
        .catch((error) => {
          console.error("Error applying action code:", error);
        });
    }
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<void> => {
    try {
      // Check if storage is available before setting persistence
      const testStorage = () => {
        try {
          const test = "__storage_test__";
          if (rememberMe) {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
          } else {
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
          }
          return true;
        } catch (e) {
          return false;
        }
      };

      if (testStorage()) {
        // Set persistence based on remember me option
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence,
        );
      } else {
        // Fallback: don't set persistence if storage is not available
        console.warn(
          "Browser storage not available, using default persistence",
        );
      }
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // If persistence setting fails, try without it
      if (error.code === "auth/invalid-persistence-type") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        throw error;
      }
    }
  };

  const signup = async (email: string, password: string): Promise<void> => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser) {
      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        // Note: To prevent emails from going to spam, configure the email template in Firebase Console:
        // Authentication > Templates > Email address verification > Customize
        // Set a custom 'From' email address and improve the subject/content to avoid spam filters.
      };
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      // Try popup first, but handle storage issues
      const testStorage = () => {
        try {
          const test = "__storage_test__";
          sessionStorage.setItem(test, test);
          sessionStorage.removeItem(test);
          return true;
        } catch (e) {
          return false;
        }
      };

      if (!testStorage()) {
        // If sessionStorage is not available, show a warning but continue
        console.warn(
          "Browser storage not available, authentication may not persist across sessions",
        );
      }

      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      // If popup fails due to storage or other issues, we could potentially fall back to redirect
      // but for now, re-throw the error
      throw error;
    }
  };

  const checkEmailVerified = async (): Promise<void> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setUser((prev) => {
          if (prev) {
            return { ...prev, emailVerified: true };
          }
          return prev;
        });
      }
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    loginWithGoogle,
    logout,
    resetPassword,
    sendVerificationEmail,
    checkEmailVerified,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
