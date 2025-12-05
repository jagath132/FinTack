import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950">
            {/* Left Side - Hero/Branding */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30 mix-blend-multiply" />

                <div className="relative z-10 text-center max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="flex justify-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/20">
                                <Wallet className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
                            Master Your Money
                        </h1>
                        <p className="text-xl text-slate-300 leading-relaxed">
                            Track expenses, set budgets, and achieve your financial goals with FinTrack's intelligent insights.
                        </p>
                    </motion.div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {title}
                        </h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </motion.div>
            </div>
        </div>
    );
}
