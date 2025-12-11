import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Upload, Trash2 } from "lucide-react";
import CSVImportDialog from "@/components/CSVImportDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";
import {
  getAllTransactions,
  getAllCategories,
  importData,
  resetAllData,
  saveCategory,
  saveTransaction,
  getUserSettings,
  saveUserSettings,
  UserSettings,
} from "@/lib/storage";
import { Transaction, Category } from "@/lib/types";
import { csvToTransactions } from "@/lib/csv";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // User settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

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

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const settings = await getUserSettings();
        if (settings) {
          setEmailNotifications(settings.emailNotifications ?? true);
          setBudgetAlerts(settings.budgetAlerts ?? true);
          setDarkMode(settings.darkMode ?? false);
        }
      } catch (error) {
        console.error("Error loading user settings:", error);
      } finally {
        setSettingsLoading(false);
      }
    };
    loadUserSettings();
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

  const handleSaveSettings = async () => {
    try {
      await saveUserSettings({
        emailNotifications,
        budgetAlerts,
        darkMode,
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    }
  };

  const handleThemeToggle = async (checked: boolean) => {
    setDarkMode(checked);

    // Apply theme to document immediately
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Save to Firebase
    try {
      await saveUserSettings({
        emailNotifications,
        budgetAlerts,
        darkMode: checked,
      });
    } catch (error) {
      console.error("Error saving theme setting:", error);
      // Revert on error
      setDarkMode(!checked);
      if (!checked) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  // Apply theme on component mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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
      <div className="space-y-6">
        {/* Preferences */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400">⚙️</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Preferences
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Customize your app experience and notifications
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Appearance */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                Appearance
              </h3>
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {darkMode ? "🌙" : "☀️"}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Dark Mode
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Switch between light and dark themes
                    </p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={handleThemeToggle}
                />
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      📧
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Email Notifications
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Receive email updates about your account activity
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                      💰
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Budget Alerts
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Get notified when approaching or exceeding budget limits
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="budget-alerts"
                    checked={budgetAlerts}
                    onCheckedChange={setBudgetAlerts}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Management */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400">🔐</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Account Management
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your account security and data
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  🔑
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Change Password
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Update your account password for better security
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChangePasswordOpen(true)}
              >
                Change
              </Button>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="gap-2 px-8">
            Save All Changes
          </Button>
        </div>
      </div>

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

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </div>
  );
}
