import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardCard from "@/components/DashboardCard";
import { getAllTransactions, getAllCategories } from "@/lib/storage";
import { Transaction, Category } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

export default function Index() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [txns, cats] = await Promise.all([
          getAllTransactions(),
          getAllCategories(),
        ]);
        setTransactions(txns);
        setCategories(cats);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    transactions.forEach((txn) => {
      const amount = txn.amount;

      if (txn.type === "income") {
        totalBalance += amount;
      } else {
        totalBalance -= amount;
      }

      const txnDate = new Date(txn.date);
      const txnMonth = txnDate.getMonth();
      const txnYear = txnDate.getFullYear();

      if (txnMonth === currentMonth && txnYear === currentYear) {
        if (txn.type === "income") {
          monthlyIncome += amount;
        } else {
          monthlyExpenses += amount;
        }
      }
    });

    return {
      totalBalance: parseFloat(totalBalance.toFixed(2)),
      monthlyIncome: parseFloat(monthlyIncome.toFixed(2)),
      monthlyExpenses: parseFloat(monthlyExpenses.toFixed(2)),
      netIncome: parseFloat((monthlyIncome - monthlyExpenses).toFixed(2)),
    };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const monthlyTrendData = useMemo(() => {
    const monthlyData: { [key: string]: { income: number; expenses: number } } =
      {};

    transactions.forEach((txn) => {
      const date = new Date(txn.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      if (txn.type === "income") {
        monthlyData[monthKey].income += txn.amount;
      } else {
        monthlyData[monthKey].expenses += txn.amount;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        income: parseFloat(data.income.toFixed(2)),
        expenses: parseFloat(data.expenses.toFixed(2)),
        net: parseFloat((data.income - data.expenses).toFixed(2)),
      }));
  }, [transactions]);

  const categoryBreakdownData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};

    transactions.forEach((txn) => {
      if (txn.type === "expense") {
        categoryTotals[txn.categoryId] =
          (categoryTotals[txn.categoryId] || 0) + txn.amount;
      }
    });

    return Object.entries(categoryTotals)
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          name: category?.name || "Unknown",
          value: parseFloat(amount.toFixed(2)),
          color: category?.color || "#6b7280",
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  }, [transactions, categories]);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Welcome to FinTrack
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track your finances, manage transactions, and achieve your financial
          goals.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard
          title="Total Balance"
          value={`₹${stats.totalBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
          icon={Wallet}
          color="blue"
          description="Overall account balance"
        />
        <DashboardCard
          title="This Month Income"
          value={`₹${stats.monthlyIncome.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="green"
          description="Total income this month"
        />
        <DashboardCard
          title="This Month Expenses"
          value={`₹${stats.monthlyExpenses.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
          icon={TrendingDown}
          color="red"
          description="Total expenses this month"
        />
        <DashboardCard
          title="Net Income"
          value={`₹${stats.netIncome.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
          icon={Wallet}
          color={stats.netIncome >= 0 ? "green" : "red"}
          description="Income minus expenses"
        />
      </div>

      {/* Analytics & Charts */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Analytics & Insights
          </h2>
        </div>

        <Tabs defaultValue="trend" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trend">Monthly Trend</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="comparison">Income vs Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="trend" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                Monthly Income & Expenses Trend
              </h3>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-slate-200 dark:stroke-slate-700"
                    />
                    <XAxis
                      dataKey="month"
                      className="text-slate-600 dark:text-slate-400"
                      fontSize={12}
                    />
                    <YAxis
                      className="text-slate-600 dark:text-slate-400"
                      fontSize={12}
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
                        name === "income"
                          ? "Income"
                          : name === "expenses"
                            ? "Expenses"
                            : "Net",
                      ]}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                Expense Categories Breakdown
              </h3>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {categoryBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                Monthly Income vs Expenses
              </h3>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-slate-200 dark:stroke-slate-700"
                    />
                    <XAxis
                      dataKey="month"
                      className="text-slate-600 dark:text-slate-400"
                      fontSize={12}
                    />
                    <YAxis
                      className="text-slate-600 dark:text-slate-400"
                      fontSize={12}
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
                        name === "income" ? "Income" : "Expenses",
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Bar
                      dataKey="income"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expenses"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Transactions
          </h2>
          <Link to="/transactions">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-2">
            {recentTransactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow animate-slide-in"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`p-3 rounded-lg ${
                      txn.type === "income"
                        ? "bg-green-100 dark:bg-green-900/20"
                        : "bg-red-100 dark:bg-red-900/20"
                    }`}
                  >
                    {txn.type === "income" ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {txn.description}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {getCategoryName(txn.categoryId)} •{" "}
                      {new Date(txn.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-right font-semibold text-lg ${
                    txn.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {txn.type === "income" ? "+" : "-"}₹
                  {txn.amount.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              No transactions yet. Start by adding your first transaction!
            </p>
            <Link to="/transactions">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Transaction
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
