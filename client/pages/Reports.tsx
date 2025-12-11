import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import {
  getAllTransactions,
  getAllCategories,
  getAllBudgets,
} from "@/lib/storage";
import { Transaction, Category, Budget } from "@/lib/types";
import { toast } from "sonner";

interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  categoryBreakdown: Array<{
    category: string;
    income: number;
    expenses: number;
    net: number;
    transactionCount: number;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
  budgetComparison: Array<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentage: number;
  }>;
}

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Report filters
  const [reportType, setReportType] = useState<"summary" | "category" | "monthly" | "budget">("summary");
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [txns, cats, buds] = await Promise.all([
          getAllTransactions(),
          getAllCategories(),
          getAllBudgets(),
        ]);
        setTransactions(txns);
        setCategories(cats);
        setBudgets(buds);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const txnDate = new Date(txn.date);
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);

      const dateInRange = txnDate >= fromDate && txnDate <= toDate;
      const categoryMatch = selectedCategory === "all" || txn.categoryId === selectedCategory;

      return dateInRange && categoryMatch;
    });
  }, [transactions, dateFrom, dateTo, selectedCategory]);

  const reportData: ReportData = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;

    // Category breakdown
    const categoryMap = new Map<string, {
      income: number;
      expenses: number;
      transactionCount: number;
    }>();

    filteredTransactions.forEach(txn => {
      const catId = txn.categoryId;
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, { income: 0, expenses: 0, transactionCount: 0 });
      }
      const cat = categoryMap.get(catId)!;
      if (txn.type === "income") {
        cat.income += txn.amount;
      } else {
        cat.expenses += txn.amount;
      }
      cat.transactionCount += 1;
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([catId, data]) => ({
      category: categories.find(c => c.id === catId)?.name || "Unknown",
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
      transactionCount: data.transactionCount,
    }));

    // Monthly breakdown
    const monthlyMap = new Map<string, { income: number; expenses: number }>();

    filteredTransactions.forEach(txn => {
      const date = new Date(txn.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expenses: 0 });
      }

      const month = monthlyMap.get(monthKey)!;
      if (txn.type === "income") {
        month.income += txn.amount;
      } else {
        month.expenses += txn.amount;
      }
    });

    const monthlyBreakdown = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      }));

    // Budget comparison
    const budgetComparison = budgets.map(budget => {
      const categoryTxns = filteredTransactions.filter(
        t => t.categoryId === budget.categoryId && t.type === "expense"
      );
      const spent = categoryTxns.reduce((sum, t) => sum + t.amount, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        category: categories.find(c => c.id === budget.categoryId)?.name || "Unknown",
        budgeted: budget.amount,
        spent,
        remaining: budget.amount - spent,
        percentage: parseFloat(percentage.toFixed(1)),
      };
    });

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      transactionCount: filteredTransactions.length,
      categoryBreakdown,
      monthlyBreakdown,
      budgetComparison,
    };
  }, [filteredTransactions, categories, budgets]);

  const exportToCSV = () => {
    let csvContent = "";

    switch (reportType) {
      case "summary":
        csvContent = `Report Summary\nDate Range: ${dateFrom} to ${dateTo}\n\n`;
        csvContent += "Metric,Value\n";
        csvContent += `Total Income,₹${reportData.totalIncome.toLocaleString("en-IN", { maximumFractionDigits: 2 })}\n`;
        csvContent += `Total Expenses,₹${reportData.totalExpenses.toLocaleString("en-IN", { maximumFractionDigits: 2 })}\n`;
        csvContent += `Net Income,₹${reportData.netIncome.toLocaleString("en-IN", { maximumFractionDigits: 2 })}\n`;
        csvContent += `Transaction Count,${reportData.transactionCount}\n`;
        break;

      case "category":
        csvContent = `Category Report\nDate Range: ${dateFrom} to ${dateTo}\n\n`;
        csvContent += "Category,Income,Expenses,Net,Transactions\n";
        reportData.categoryBreakdown.forEach(cat => {
          csvContent += `${cat.category},₹${cat.income.toLocaleString("en-IN", { maximumFractionDigits: 2 })},₹${cat.expenses.toLocaleString("en-IN", { maximumFractionDigits: 2 })},₹${cat.net.toLocaleString("en-IN", { maximumFractionDigits: 2 })},${cat.transactionCount}\n`;
        });
        break;

      case "monthly":
        csvContent = `Monthly Report\nDate Range: ${dateFrom} to ${dateTo}\n\n`;
        csvContent += "Month,Income,Expenses,Net\n";
        reportData.monthlyBreakdown.forEach(month => {
          csvContent += `${month.month},₹${month.income.toLocaleString("en-IN", { maximumFractionDigits: 2 })},₹${month.expenses.toLocaleString("en-IN", { maximumFractionDigits: 2 })},₹${month.net.toLocaleString("en-IN", { maximumFractionDigits: 2 })}\n`;
        });
        break;

      case "budget":
        csvContent = `Budget Report\nDate Range: ${dateFrom} to ${dateTo}\n\n`;
        csvContent += "Category,Budgeted,Spent,Remaining,Percentage\n";
        reportData.budgetComparison.forEach(budget => {
          csvContent += `${budget.category},₹${budget.budgeted.toLocaleString("en-IN", { maximumFractionDigits: 2 })},₹${budget.spent.toLocaleString("en-IN", { maximumFractionDigits: 2 })},₹${budget.remaining.toLocaleString("en-IN", { maximumFractionDigits: 2 })},${budget.percentage}%\n`;
        });
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fintrack_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Report exported successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-400">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Reports
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Generate detailed financial reports and insights
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Report Type
            </label>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary Report</SelectItem>
                <SelectItem value="category">Category Report</SelectItem>
                <SelectItem value="monthly">Monthly Report</SelectItem>
                <SelectItem value="budget">Budget Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              From Date
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              To Date
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Category Filter
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Report Content */}
      {reportType === "summary" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Income</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₹{reportData.totalIncome.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ₹{reportData.totalExpenses.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className={`w-8 h-8 ${reportData.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Net Income</p>
                <p className={`text-2xl font-bold ${reportData.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ₹{reportData.netIncome.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Transactions</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {reportData.transactionCount}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {reportType === "category" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            Category Breakdown
          </h3>
          <div className="space-y-4">
            {reportData.categoryBreakdown.map((cat, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">{cat.category}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {cat.transactionCount} transactions
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    +₹{cat.income.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    -₹{cat.expenses.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                  <p className={`font-semibold ${cat.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ₹{cat.net.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {reportType === "monthly" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            Monthly Breakdown
          </h3>
          <div className="space-y-4">
            {reportData.monthlyBreakdown.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">{month.month}</h4>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    +₹{month.income.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    -₹{month.expenses.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                  <p className={`font-semibold ${month.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ₹{month.net.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {reportType === "budget" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            Budget vs Actual Spending
          </h3>
          <div className="space-y-4">
            {reportData.budgetComparison.map((budget, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900 dark:text-white">{budget.category}</h4>
                  <Badge variant={budget.percentage > 100 ? "destructive" : budget.percentage > 80 ? "secondary" : "default"}>
                    {budget.percentage}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Budgeted</p>
                    <p className="font-semibold">₹{budget.budgeted.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Spent</p>
                    <p className="font-semibold">₹{budget.spent.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className={`text-slate-600 dark:text-slate-400 ${budget.remaining < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>Remaining</p>
                    <p className={`font-semibold ${budget.remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      ₹{budget.remaining.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}