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

const USERS_KEY = "fintrack_users";
const SESSION_KEY = "fintrack_session";

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<void> => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];

    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (!foundUser) {
      throw new Error("Invalid email or password");
    }

    const sessionUser: User = {
      id: foundUser.id,
      email: foundUser.email,
      displayName: foundUser.displayName,
      emailVerified: true, // Auto-verify for local storage mock
    };

    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  };

  const signup = async (email: string, password: string): Promise<void> => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];

    if (users.find((u: any) => u.email === email)) {
      throw new Error("Email already in use");
    }

    const newUser = {
      id: Math.random().toString(36).substring(2, 11),
      email,
      password,
      displayName: email.split("@")[0],
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const sessionUser: User = {
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.displayName,
      emailVerified: true,
    };

    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const resetPassword = async (email: string): Promise<void> => {
    console.log("Password reset requested for:", email);
  };

  const sendVerificationEmail = async (): Promise<void> => {
    console.log("Verification email sent");
  };

  const loginWithGoogle = async (): Promise<void> => {
    const googleUser: User = {
      id: "google_" + Math.random().toString(36).substring(2, 11),
      email: "google-user@example.com",
      displayName: "Google User",
      emailVerified: true,
    };
    setUser(googleUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(googleUser));
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
