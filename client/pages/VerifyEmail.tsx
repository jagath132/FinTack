import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Mail, RefreshCw, LogOut, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { user, sendVerificationEmail, logout, checkEmailVerified } = useAuth();
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      await sendVerificationEmail();
      toast.success("Verification email sent! Please check your inbox and spam folder.");
    } catch (error: any) {
      console.error("Resend verification error:", error);

      // Provide specific error messages
      if (error.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else if (error.code === "auth/user-not-found") {
        toast.error("User not found. Please sign up again.");
      } else if (error.code === "auth/operation-not-allowed") {
        toast.error("Email verification is not enabled. Please contact support.");
      } else {
        toast.error("Failed to send verification email. Please try again or contact support.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  useEffect(() => {
    if (user.emailVerified) {
      navigate("/", { replace: true });
    }
  }, [user.emailVerified, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkEmailVerified();
    }, 3000);

    return () => clearInterval(interval);
  }, [checkEmailVerified]);

  const handleCheckVerification = async () => {
    setIsChecking(true);
    await checkEmailVerified();
    setIsChecking(false);
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We've sent a verification link to your email address"
    >
      <div className="space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800"
        >
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">
            {user.email}
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Verification pending</span>
          </div>
        </motion.div>

        <div className="space-y-4">
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
            Click the link in the email we sent you to verify your account. If
            you can't find it, check your spam folder.
          </p>

          <Button
            onClick={handleCheckVerification}
            variant="outline"
            className="w-full h-12 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            disabled={isChecking}
          >
            {isChecking ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Checking...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                I've verified my email
              </div>
            )}
          </Button>

          <Button
            onClick={handleResendVerification}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Resend Verification Email
              </div>
            )}
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-12 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </div>
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
