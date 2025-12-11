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
  Plus,
  Trash2,
  Edit,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
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

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select
            value={filterType}
            onValueChange={(v: any) => setFilterType(v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue />
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

          {/* Date From */}
          <Input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            placeholder="From date"
          />

          {/* Date To */}
          <Input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            placeholder="To date"
          />
        </div>

        {/* Clear Filters */}
        {(searchQuery ||
          filterType !== "all" ||
          filterCategory !== "all" ||
          filterDateFrom ||
          filterDateTo) && (
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
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
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
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
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
                          {txn.type === "income" ? "+" : "-"}
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
                            onClick={() => handleEditClick(txn)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(txn.id)}
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
                className="p-4 hover:shadow-md transition-shadow"
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
                          className={`font-bold text-lg ${
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
                      onClick={() => handleEditClick(txn)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(txn.id)}
                      className="h-8 w-8 p-0 text-red-600 dark:text-red-400"
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
    </div>
  );
}
