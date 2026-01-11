import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  BarChart3,
  Wallet,
  Target,
  Repeat,
  FileText,
  Tag,
  TrendingUp,
  Shield,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  PieChart,
  CreditCard,
  Calendar,
  Download,
  Upload,
  Zap,
  Lock,
  Eye,
} from "lucide-react";
import Logo from "@/components/Logo";

export default function Landing() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    if (!isLoading && user && user.emailVerified) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const features = [
    {
      icon: BarChart3,
      title: "Dashboard Analytics",
      description:
        "Get a comprehensive overview of your financial health with real-time metrics, interactive charts, and visual insights.",
      color: "emerald",
    },
    {
      icon: Wallet,
      title: "Transaction Management",
      description:
        "Track all your income and expenses with full CRUD operations. Advanced filtering by date, category, and type.",
      color: "teal",
    },
    {
      icon: Target,
      title: "Budget Tracking",
      description:
        "Set monthly budgets for different categories and monitor your spending with visual progress indicators and alerts.",
      color: "cyan",
    },
    {
      icon: Tag,
      title: "Category Management",
      description:
        "Organize transactions with customizable income and expense categories. Color-coded for easy identification.",
      color: "emerald",
    },
    {
      icon: Repeat,
      title: "Recurring Transactions",
      description:
        "Automate regular income and expenses with templates. Set daily, weekly, monthly, or yearly recurring patterns.",
      color: "teal",
    },
    {
      icon: FileText,
      title: "Reports & Analytics",
      description:
        "Generate detailed financial reports and export to CSV. Multiple report types with flexible date filtering.",
      color: "cyan",
    },
    {
      icon: Download,
      title: "Data Import/Export",
      description:
        "Import transactions from CSV files or export your data for external analysis. Full data management capabilities.",
      color: "emerald",
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description:
        "Multiple authentication options including email/password and Google OAuth. Secure sessions and protected routes.",
      color: "teal",
    },
  ];

  const benefits = [
    "Real-time financial insights",
    "Mobile-responsive design",
    "Dark mode support",
    "Offline functionality",
    "Secure data storage",
    "Easy data migration",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-hidden">
      {/* Animated background shapes - Abstract art */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/5 rounded-3xl transform rotate-45"></div>
        <div className="absolute top-40 left-20 w-80 h-80 bg-purple-500/5 rounded-full"></div>
        <div className="absolute bottom-40 right-40 w-96 h-96 bg-indigo-500/5 rounded-full transform -rotate-45"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 relative z-10">
              <Logo size="md" />
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
                FinTrack
              </span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/50 transition-all">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6"
              >
                <Zap className="w-4 h-4" />
                Smart Financial Control
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-slate-900 dark:text-white leading-tight"
              >
                Master Your
                <span className="block bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Money Flow
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl leading-relaxed"
              >
                Track income, manage expenses, build budgets, and achieve your financial dreams with our intuitive and powerful platform.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 h-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
                  >
                    Start Free Now
                    <Zap className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 h-auto border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-all transform hover:scale-105"
                  >
                    Sign In
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-8 mt-12 pt-8 border-t border-slate-200 dark:border-slate-700"
              >
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">10K+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹1B+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Managed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">99.9%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Uptime</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual with floating cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-full min-h-96 lg:min-h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-300/10 via-blue-300/10 to-transparent rounded-3xl"></div>
              
              <div className="relative space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-6 hover:border-purple-400 dark:hover:border-purple-500 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 dark:bg-purple-900/40 rounded-lg p-3">
                      <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">+12.5%</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm">Total Balance</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2">₹45,230</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ y: -5 }}
                  className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/40 rounded-lg p-3">
                      <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Monthly</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm">Income</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2">₹12,500</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ y: -5 }}
                  className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-700 rounded-2xl p-6 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/40 rounded-lg p-3">
                      <PieChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">Organized</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm">Categories</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2">8</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
              Everything You Need to
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                Thrive Financially
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive tools and features designed to simplify your financial life
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colors = {
                emerald: {
                  bg: "bg-purple-50 dark:bg-purple-900/15",
                  border: "border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500",
                  icon: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
                },
                teal: {
                  bg: "bg-blue-50 dark:bg-blue-900/15",
                  border: "border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500",
                  icon: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
                },
                cyan: {
                  bg: "bg-indigo-50 dark:bg-indigo-900/15",
                  border: "border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-500",
                  icon: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
                },
              };

              const colorSet = colors[feature.color as keyof typeof colors] || colors.emerald;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className={`${colorSet.bg} border-2 ${colorSet.border} rounded-2xl p-6 transition-all group cursor-pointer`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${colorSet.icon} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6"
              >
                <Eye className="w-4 h-4" />
                Why Choose FinTrack
              </motion.div>

              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
                Financial Control,
                <span className="block text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text">
                  Simplified
                </span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed">
                Experience the perfect balance of powerful features and intuitive design. Manage your finances with complete confidence and ease.
              </p>
              
              <div className="space-y-4 mb-10">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 group"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{benefit}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
                  >
                    Get Started Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            {/* Transaction Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-200/10 via-blue-200/10 to-transparent rounded-3xl"></div>
              
              <div className="relative space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                  className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-5 hover:border-purple-400 dark:hover:border-purple-500 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-purple-100 dark:bg-purple-900/40 rounded-xl p-3 group-hover:scale-110 transition-transform">
                        <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          Grocery Shopping
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Food & Dining
                        </div>
                      </div>
                    </div>
                    <div className="text-red-600 dark:text-red-400 font-semibold">
                      -₹1,250
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                  className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-5 hover:border-blue-400 dark:hover:border-blue-500 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-blue-100 dark:bg-blue-900/40 rounded-xl p-3 group-hover:scale-110 transition-transform">
                        <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          Salary
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Income
                        </div>
                      </div>
                    </div>
                    <div className="text-green-600 dark:text-green-400 font-semibold">
                      +₹50,000
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                  className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-700 rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-indigo-100 dark:bg-indigo-900/40 rounded-xl p-3 group-hover:scale-110 transition-transform">
                        <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          Entertainment Budget
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          75% Used
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 font-semibold text-sm">
                      ₹7,500 / ₹10k
                    </div>
                  </div>
                  <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "75%" }}
                      transition={{ duration: 1, delay: 0.8 }}
                      viewport={{ once: true }}
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full h-full"
                    ></motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium mb-8 border border-white/25 hover:border-white/50 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Join thousands of users mastering their finances
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 text-white leading-tight"
          >
            Start Your Financial
            <span className="block bg-gradient-to-r from-purple-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent">
              Journey Today
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Take control of your finances with powerful analytics, automated budgets, and intelligent insights. Completely free to get started.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-12 text-white/85 text-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-200" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-200" />
              <span>2-minute setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-200" />
              <span>Forever free</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
          >
            <Link to="/signup">
              <Button
                size="lg"
                className="text-lg px-10 py-7 h-auto bg-white text-purple-600 hover:bg-slate-100 shadow-2xl hover:shadow-white/50 transition-all transform hover:scale-105 font-semibold rounded-full border-2 border-white"
              >
                Create Free Account
                <Zap className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                className="text-lg px-10 py-7 h-auto border-2 border-white/60 bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 hover:border-white shadow-lg hover:shadow-white/20 transition-all transform hover:scale-105 font-semibold rounded-full"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-sm text-white/70"
          >
            By signing up, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </div>
      </section>


    </div>
  );
}
