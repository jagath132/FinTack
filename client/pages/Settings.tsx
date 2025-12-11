import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Upload, Trash2 } from "lucide-react";
import CSVImportDialog from "@/components/CSVImportDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  getAllTransactions,
  getAllCategories,
  importData,
  resetAllData,
  saveCategory,
  saveTransaction,
} from "@/lib/storage";
import { Transaction, Category } from "@/lib/types";
import { csvToTransactions } from "@/lib/csv";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
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

  const handleImport = async (mapping: any, csvData: any) => {
    const {
      transactions: importedTxns,
      errors,
      missingCategories,
    } = csvToTransactions(csvData, mapping, categories);

    if (importedTxns.length === 0) {
      throw new Error("No valid transactions found to import");
    }

    try {
      // Create missing categories
      const newCategoryIds: { [key: string]: string } = {};
      for (const catName of missingCategories) {
        try {
          const catId = await saveCategory({
            name: catName,
            type: "expense",
            color: "#6b7280",
            icon: "Tag",
            createdAt: new Date().toISOString(),
          });
          newCategoryIds[catName.toLowerCase()] = catId;
        } catch (error) {
          console.error(`Failed to create category ${catName}:`, error);
          throw new Error(`Failed to save category "${catName}"`);
        }
      }

      // Update categoryId in imported transactions
      importedTxns.forEach((txn) => {
        if (newCategoryIds[txn.categoryId]) {
          txn.categoryId = newCategoryIds[txn.categoryId];
        }
      });

      // Add imported transactions individually
      const addPromises = importedTxns.map(async (txn) => {
        try {
          return await saveTransaction(txn);
        } catch (error) {
          console.error("Failed to save transaction:", error);
          throw new Error("Failed to save transaction");
        }
      });
      await Promise.all(addPromises);

      // Refresh data
      const [updatedTxns, updatedCats] = await Promise.all([
        getAllTransactions(),
        getAllCategories(),
      ]);
      setTransactions(updatedTxns);
      setCategories(updatedCats);

      toast.success(
        `Imported ${importedTxns.length} transaction(s)${errors.length > 0 ? ` (${errors.length} skipped due to errors)` : ""}${missingCategories.length > 0 ? ` (${missingCategories.length} categories created)` : ""}`,
      );
      setImportDialogOpen(false);

      // Redirect to transactions page to view imported data
      setTimeout(() => {
        navigate("/transactions");
      }, 500);
    } catch (error) {
      console.error("Import error:", error);
      // Re-throw the error so the dialog can catch it
      throw error;
    }
  };

  const handleResetConfirm = async () => {
    try {
      await resetAllData();

      // Refresh data after reset
      const [updatedTxns, updatedCats] = await Promise.all([
        getAllTransactions(),
        getAllCategories(),
      ]);
      setTransactions(updatedTxns);
      setCategories(updatedCats);

      toast.success("All data has been reset to default state");
      setResetConfirmOpen(false);
    } catch (error) {
      toast.error("Failed to reset data");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your account settings, import data, and reset your account
        </p>
      </div>

      {/* Import Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Import Transactions
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Import transactions from a CSV file. The file should contain columns
          for Date, Amount, Category, Type, and Description.
        </p>
        <Button onClick={() => setImportDialogOpen(true)} className="gap-2">
          <Upload className="w-4 h-4" />
          Import CSV File
        </Button>
      </Card>

      {/* User Settings Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">U</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            User Settings
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your account preferences and personal information.
        </p>

        <div className="space-y-4">
          {/* Profile Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Display Name
              </label>
              <Input
                type="text"
                placeholder="Your display name"
                defaultValue="User"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                defaultValue="user@example.com"
                className="w-full"
                disabled
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              Preferences
            </h3>

            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Email Notifications
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Receive email updates about your account
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="email-notifications"
                  className="w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                  defaultChecked
                />
                <label htmlFor="email-notifications" className="sr-only">
                  Email Notifications
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Budget Alerts
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get notified when approaching budget limits
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="budget-alerts"
                  className="w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                  defaultChecked
                />
                <label htmlFor="budget-alerts" className="sr-only">
                  Budget Alerts
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Dark Mode
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Toggle between light and dark themes
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="dark-mode"
                  className="w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                />
                <label htmlFor="dark-mode" className="sr-only">
                  Dark Mode
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="gap-2">Save Changes</Button>
          </div>
        </div>
      </Card>

      {/* Reset Section */}
      <Card className="p-6 space-y-4 border-red-200 dark:border-red-900">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Danger Zone
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Reset all your data and restore default categories. This action is
          irreversible.
        </p>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This will permanently delete all your
            transactions and custom categories. Default categories will be
            restored.
          </AlertDescription>
        </Alert>

        <Button
          variant="destructive"
          onClick={() => setResetConfirmOpen(true)}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Reset All Data
        </Button>
      </Card>

      {/* Import Dialog */}
      <CSVImportDialog
        open={importDialogOpen}
        categories={categories}
        onImport={handleImport}
        onOpenChange={setImportDialogOpen}
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmationDialog
        open={resetConfirmOpen}
        title="Reset All Data?"
        description="Are you sure you want to delete ALL your transactions and custom categories? This cannot be undone. Default categories will be restored."
        confirmText="Yes, Reset Everything"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleResetConfirm}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
}
