import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Download, Upload, Trash2 } from "lucide-react";
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
import {
  transactionsToCSV,
  categoriesToCSV,
  downloadCSV,
  csvToTransactions,
} from "@/lib/csv";
import { Transaction, Category } from "@/lib/types";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [exportOption, setExportOption] = useState("transactions");
  const [exportDateFrom, setExportDateFrom] = useState("");
  const [exportDateTo, setExportDateTo] = useState("");
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

  const handleExport = () => {
    let data = transactions;

    if (exportDateFrom) {
      const fromDate = new Date(exportDateFrom);
      data = data.filter((txn) => new Date(txn.date) >= fromDate);
    }

    if (exportDateTo) {
      const toDate = new Date(exportDateTo);
      data = data.filter((txn) => new Date(txn.date) <= toDate);
    }

    if (data.length === 0) {
      toast.error("No transactions found for export");
      return;
    }

    let csv = "";
    let filename = "";

    if (exportOption === "transactions" || exportOption === "both") {
      csv += transactionsToCSV(data, categories);
      filename = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    }

    if (exportOption === "categories" || exportOption === "both") {
      if (csv) csv += "\n\n---CATEGORIES---\n";
      csv += categoriesToCSV(categories);
      if (filename.includes("transactions")) {
        filename = `fintrack_export_${new Date().toISOString().split("T")[0]}.csv`;
      } else {
        filename = `categories_${new Date().toISOString().split("T")[0]}.csv`;
      }
    }

    downloadCSV(filename, csv);
    toast.success(`Exported ${data.length} record(s)`);
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
          Manage your data, import/export, and reset your account
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

      {/* Export Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Export Data
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Export your financial data to a CSV file for backup or analysis.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export Option */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              What to export:
            </label>
            <Select value={exportOption} onValueChange={setExportOption}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transactions">Transactions Only</SelectItem>
                <SelectItem value="categories">Categories Only</SelectItem>
                <SelectItem value="both">
                  Both Transactions & Categories
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Empty state for now */}
          <div />

          {exportOption !== "categories" && (
            <>
              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  From Date (Optional):
                </label>
                <Input
                  type="date"
                  value={exportDateFrom}
                  onChange={(e) => setExportDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  To Date (Optional):
                </label>
                <Input
                  type="date"
                  value={exportDateTo}
                  onChange={(e) => setExportDateTo(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            className="gap-2"
            disabled={
              transactions.length === 0 && exportOption === "transactions"
            }
          >
            <Download className="w-4 h-4" />
            Export as CSV
          </Button>
          {exportDateFrom || exportDateTo ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setExportDateFrom("");
                setExportDateTo("");
              }}
            >
              Clear Dates
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {transactions.length > 0
            ? `Total transactions: ${transactions.length}`
            : "No transactions to export"}
        </p>
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
