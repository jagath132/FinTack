import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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

const SESSION_KEY = "fintrack_session";
const TOKEN_KEY = "fintrack_token";

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const res = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const userData = await res.json();
            setUser({ ...userData, emailVerified: true });
          } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(SESSION_KEY);
          }
        } catch (e) {
          console.error("Auth check failed", e);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<void> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Invalid email or password");
    }

    const { user: userData, token } = await res.json();
    const sessionUser: User = {
      ...userData,
      emailVerified: true,
    };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const signup = async (email: string, password: string): Promise<void> => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Email already in use");
    }

    const { user: userData, token } = await res.json();
    const sessionUser: User = {
      ...userData,
      emailVerified: true,
    };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
  };

  const resetPassword = async (email: string): Promise<void> => {
    console.log("Password reset requested for:", email);
  };

  const sendVerificationEmail = async (): Promise<void> => {
    console.log("Verification email sent");
  };

  const loginWithGoogle = async (): Promise<void> => {
    console.log("Google login not implemented yet in backend");
  };

  const checkEmailVerified = async (): Promise<void> => {
    if (user) {
      setUser({ ...user, emailVerified: true });
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
