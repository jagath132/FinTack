import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Edit, Target, AlertTriangle } from "lucide-react";
import BudgetForm from "@/components/BudgetForm";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  getAllBudgets,
  saveBudget,
  updateBudget,
  deleteBudget,
  getAllCategories,
  getAllTransactions,
} from "@/lib/storage";
import { Budget, Category, Transaction } from "@/lib/types";
import { toast } from "sonner";

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [buds, cats, txns] = await Promise.all([
          getAllBudgets(),
          getAllCategories(),
          getAllTransactions(),
        ]);
        setBudgets(buds);
        setCategories(cats);
        setTransactions(txns);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || "#6b7280";
  };

  const getBudgetProgress = (budget: Budget) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const categoryTransactions = transactions.filter((txn) => {
      if (txn.categoryId !== budget.categoryId || txn.type !== "expense") return false;

      const txnDate = new Date(txn.date);
      const txnMonth = txnDate.getMonth();
      const txnYear = txnDate.getFullYear();

      return txnMonth === currentMonth && txnYear === currentYear;
    });

    const spent = categoryTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    const percentage = (spent / budget.amount) * 100;

    return {
      spent: parseFloat(spent.toFixed(2)),
      budget: budget.amount,
      percentage: parseFloat(percentage.toFixed(1)),
      remaining: parseFloat((budget.amount - spent).toFixed(2)),
    };
  };

  const handleAddBudget = async (budget: Budget) => {
    try {
      if (selectedBudget) {
        await updateBudget(budget.id, budget);
        toast.success("Budget updated");
      } else {
        const { id, ...budgetWithoutId } = budget;
        await saveBudget(budgetWithoutId);
        toast.success("Budget created");
      }
      const updatedBudgets = await getAllBudgets();
      setBudgets(updatedBudgets);
      setSelectedBudget(undefined);
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.error("Failed to save budget");
    }
  };

  const handleEditClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setBudgetToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (budgetToDelete) {
      try {
        await deleteBudget(budgetToDelete);
        const updatedBudgets = await getAllBudgets();
        setBudgets(updatedBudgets);
        toast.success("Budget deleted");
        setBudgetToDelete(null);
      } catch (error) {
        console.error("Error deleting budget:", error);
        toast.error("Failed to delete budget");
      }
    }
    setDeleteConfirmOpen(false);
  };

  const totalBudget = useMemo(() => {
    return budgets.reduce((sum, budget) => sum + budget.amount, 0);
  }, [budgets]);

  const totalSpent = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter((txn) => {
        if (txn.type !== "expense") return false;
        const txnDate = new Date(txn.date);
        return txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear;
      })
      .reduce((sum, txn) => sum + txn.amount, 0);
  }, [transactions]);

  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Budgets
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Set and track your spending limits
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedBudget(undefined);
            setFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Budget
        </Button>
      </div>

      {/* Overall Budget Summary */}
      {budgets.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Monthly Budget Overview
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Budget</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹{totalBudget.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Spent</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹{totalSpent.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Remaining</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹{(totalBudget - totalSpent).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Progress</span>
              <span className="font-medium">{overallProgress.toFixed(1)}%</span>
            </div>
            <Progress
              value={Math.min(overallProgress, 100)}
              className="h-3"
            />
          </div>
        </Card>
      )}

      {/* Budgets List */}
      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const progress = getBudgetProgress(budget);
            const isOverBudget = progress.spent > progress.budget;

            return (
              <Card key={budget.id} className="p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(budget.categoryId) }}
                      />
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {getCategoryName(budget.categoryId)}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {budget.period === 'monthly' ? 'Monthly' : 'Yearly'} Budget
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(budget)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(budget.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Spent</span>
                    <span className="font-medium">
                      ₹{progress.spent.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Budget</span>
                    <span className="font-medium">
                      ₹{progress.budget.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Progress</span>
                      <span className={`font-medium ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {progress.percentage}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(progress.percentage, 100)}
                      className={`h-2 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Remaining</span>
                    <span className={`font-medium ${progress.remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      ₹{progress.remaining.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {isOverBudget && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-700 dark:text-red-300">
                        Over budget by ₹{(progress.spent - progress.budget).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No budgets set yet. Create your first budget to start tracking your spending!
          </p>
          <Button
            onClick={() => {
              setSelectedBudget(undefined);
              setFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create First Budget
          </Button>
        </Card>
      )}

      {/* Budget Form Dialog */}
      <BudgetForm
        open={formOpen}
        budget={selectedBudget}
        categories={categories.filter(c => c.type === 'expense')}
        onSubmit={handleAddBudget}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelectedBudget(undefined);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Delete Budget"
        description="Are you sure you want to delete this budget? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}