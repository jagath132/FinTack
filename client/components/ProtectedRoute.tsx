import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, sendVerificationEmail, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.emailVerified) {
    const handleResendVerification = async () => {
      try {
        await sendVerificationEmail();
        toast.success("Verification email sent! Please check your inbox.");
      } catch (error: any) {
        toast.error("Failed to send verification email. Please try again.");
      }
    };

    const handleLogout = async () => {
      await logout();
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-semibold text-slate-900 dark:text-white mb-4"
            >
              Verify Your Email
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-slate-600 dark:text-slate-400 mb-6"
            >
              We've sent a verification email to <strong>{user.email}</strong>.
              Please check your inbox and click the verification link to
              activate your account.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <Button
                onClick={handleResendVerification}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Verification Email
              </Button>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-sm text-slate-500 dark:text-slate-400 mt-6"
            >
              Didn't receive the email? Check your spam folder or click resend
              above.
            </motion.p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
