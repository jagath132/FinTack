import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DashboardCard from "@/components/DashboardCard";
import { getAllTransactions, getAllCategories } from "@/lib/storage";
import { Transaction, Category } from "@/lib/types";

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
