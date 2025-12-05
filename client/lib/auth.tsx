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
    // Set persistence based on remember me option
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence,
    );
    await signInWithEmailAndPassword(auth, email, password);
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
    await signInWithPopup(auth, googleProvider);
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
