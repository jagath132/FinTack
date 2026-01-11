import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Edit,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Filter,
  X,
  Calendar,
  Download,
} from "lucide-react";
import TransactionForm from "@/components/TransactionForm";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  getAllTransactions,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  getAllCategories,
} from "@/lib/storage";
import { Transaction } from "@/lib/types";
import { toast } from "sonner";

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trans, cats] = await Promise.all([
          getAllTransactions(),
          getAllCategories(),
        ]);
        setTransactions(trans);
        setCategories(cats);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | undefined
  >();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null,
  );
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptTransaction, setReceiptTransaction] =
    useState<Transaction | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((txn) => {
        // Search filter
        if (
          searchQuery &&
          !txn.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Type filter
        if (filterType !== "all" && txn.type !== filterType) {
          return false;
        }

        // Category filter
        if (filterCategory !== "all" && txn.categoryId !== filterCategory) {
          return false;
        }

        // Date range filter
        const txnDate = new Date(txn.date);
        if (filterDateFrom) {
          const fromDate = new Date(filterDateFrom);
          if (txnDate < fromDate) return false;
        }
        if (filterDateTo) {
          const toDate = new Date(filterDateTo);
          if (txnDate > toDate) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    transactions,
    searchQuery,
    filterType,
    filterCategory,
    filterDateFrom,
    filterDateTo,
  ]);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  const handleAddTransaction = async (txn: Omit<Transaction, "id">) => {
    try {
      if (selectedTransaction) {
        await updateTransaction(selectedTransaction.id, txn);
        toast.success("Transaction updated");
      } else {
        await saveTransaction(txn);
        toast.success("Transaction added");
      }
      // Reload data
      const trans = await getAllTransactions();
      setTransactions(trans);
      setSelectedTransaction(undefined);
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Failed to save transaction");
    }
  };

  const handleEditClick = (txn: Transaction) => {
    setSelectedTransaction(txn);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      try {
        await deleteTransaction(transactionToDelete);
        const trans = await getAllTransactions();
        setTransactions(trans);
        toast.success("Transaction deleted");
        setTransactionToDelete(null);
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast.error("Failed to delete transaction");
      }
    }
    setDeleteConfirmOpen(false);
  };

  const exportFilteredTransactions = () => {
    const csvContent = [
      "Date,Description,Category,Type,Amount,Notes",
      ...filteredTransactions.map(
        (txn) =>
          `"${new Date(txn.date).toLocaleDateString()}","${txn.description}","${getCategoryName(txn.categoryId)}","${txn.type}","${txn.amount}","${txn.notes || ""}"`,
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `fintrack_transactions_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(
      `${filteredTransactions.length} transactions exported successfully`,
    );
  };

  const handleReceiptClick = (txn: Transaction) => {
    setReceiptTransaction(txn);
    setReceiptOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your income and expenses
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedTransaction(undefined);
            setFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 sm:p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search transactions by description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 text-base border-2 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            All
          </Button>
          <Button
            variant={filterType === "income" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("income")}
            className="gap-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
          >
            <ArrowUpRight className="w-4 h-4" />
            Income
          </Button>
          <Button
            variant={filterType === "expense" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("expense")}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Expense
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            Advanced Filters
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportFilteredTransactions}
            className="gap-2"
            disabled={filteredTransactions.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Active Filters */}
        {(filterType !== "all" ||
          filterCategory !== "all" ||
          filterDateFrom ||
          filterDateTo) && (
          <div className="flex flex-wrap gap-2">
            {filterType !== "all" && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Type: {filterType === "income" ? "Income" : "Expense"}
                <button
                  onClick={() => setFilterType("all")}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filterCategory !== "all" && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Category:{" "}
                {categories.find((c) => c.id === filterCategory)?.name}
                <button
                  onClick={() => setFilterCategory("all")}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filterDateFrom && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                From: {new Date(filterDateFrom).toLocaleDateString()}
                <button
                  onClick={() => setFilterDateFrom("")}
                  className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filterDateTo && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                To: {new Date(filterDateTo).toLocaleDateString()}
                <button
                  onClick={() => setFilterDateTo("")}
                  className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Category
                </label>
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  From Date
                </label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  To Date
                </label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Clear All Filters */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                  setFilterCategory("all");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                  setShowAdvancedFilters(false);
                }}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
          <div className="flex gap-2">
            {/* Clear Filters */}
            {(searchQuery ||
              filterType !== "all" ||
              filterCategory !== "all" ||
              filterDateFrom ||
              filterDateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                  setFilterCategory("all");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                }}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Transactions Table/List */}
      {filteredTransactions.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((txn) => (
                    <TableRow
                      key={txn.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                      onClick={() => handleReceiptClick(txn)}
                    >
                      <TableCell className="font-medium">
                        {new Date(txn.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{txn.description}</p>
                          {txn.notes && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {txn.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryName(txn.categoryId)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            txn.type === "income"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {txn.type === "income" ? "Income" : "Expense"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span
                          className={
                            txn.type === "income"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {txn.type === "income" ? "+" : "-"}₹
                          {txn.amount.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(txn);
                            }}
                            title="Edit transaction"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(txn.id);
                            }}
                            title="Delete transaction"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredTransactions.map((txn) => (
              <Card
                key={txn.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleReceiptClick(txn)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
                        txn.type === "income"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : "bg-red-100 dark:bg-red-900/20"
                      }`}
                    >
                      {txn.type === "income" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {txn.description}
                        </p>
                        <span
                          className={`font-bold text-base sm:text-lg whitespace-nowrap ${
                            txn.type === "income"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {txn.type === "income" ? "+" : "-"}₹
                          {txn.amount.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                        <span>{getCategoryName(txn.categoryId)}</span>
                        <span>•</span>
                        <span>{new Date(txn.date).toLocaleDateString()}</span>
                      </div>
                      {txn.notes && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {txn.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(txn);
                      }}
                      className="h-8 w-8 p-0"
                      title="Edit transaction"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(txn.id);
                      }}
                      className="h-8 w-8 p-0 text-red-600 dark:text-red-400"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No transactions found. Start by adding a new transaction!
          </p>
          <Button
            onClick={() => {
              setSelectedTransaction(undefined);
              setFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Your First Transaction
          </Button>
        </Card>
      )}

      {/* Transaction Form Dialog */}
      <TransactionForm
        open={formOpen}
        transaction={selectedTransaction}
        categories={categories}
        onSubmit={handleAddTransaction}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelectedTransaction(undefined);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      {/* Transaction Receipt Dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Transaction Receipt
            </DialogTitle>
          </DialogHeader>
          {receiptTransaction && (
            <div className="space-y-4">
              {/* Receipt Header */}
              <div className="text-center border-b-2 border-dashed border-slate-300 pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-lg">₹</span>
                </div>
                <h3 className="font-bold text-lg">FinTrack</h3>
                <p className="text-sm text-slate-500">Transaction Receipt</p>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Date:</span>
                  <span className="font-medium">
                    {new Date(receiptTransaction.date).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Type:</span>
                  <span
                    className={`font-medium px-2 py-1 rounded text-sm ${
                      receiptTransaction.type === "income"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {receiptTransaction.type === "income"
                      ? "Income"
                      : "Expense"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Category:</span>
                  <span className="font-medium">
                    {getCategoryName(receiptTransaction.categoryId)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Description:</span>
                  <span className="font-medium text-right max-w-32 truncate">
                    {receiptTransaction.description}
                  </span>
                </div>

                {receiptTransaction.notes && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-600 text-sm">Notes:</span>
                    <p className="text-sm mt-1">{receiptTransaction.notes}</p>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="border-t-2 border-dashed border-slate-300 pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total Amount:</span>
                  <span
                    className={
                      receiptTransaction.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {receiptTransaction.type === "income" ? "+" : "-"}₹
                    {receiptTransaction.amount.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setReceiptOpen(false);
                    handleEditClick(receiptTransaction);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Transaction
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setReceiptOpen(false);
                    handleDeleteClick(receiptTransaction.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Transaction
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
