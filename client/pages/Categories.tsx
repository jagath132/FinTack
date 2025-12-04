import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import CategoryForm from "@/components/CategoryForm";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  getAllCategories,
  saveCategory,
  updateCategory,
  deleteCategory,
  getAllTransactions,
} from "@/lib/storage";
import { Category } from "@/lib/types";
import { toast } from "sonner";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, txns] = await Promise.all([
          getAllCategories(),
          getAllTransactions(),
        ]);
        setCategories(cats);
        setTransactions(txns);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getCategoryTransactionCount = (categoryId: string) => {
    return transactions.filter((txn) => txn.categoryId === categoryId).length;
  };

  const getTransactionsForCategory = (categoryId: string) => {
    return transactions.filter((txn) => txn.categoryId === categoryId);
  };

  const handleAddCategory = async (cat: Category) => {
    try {
      if (selectedCategory) {
        // Update existing category
        await updateCategory(cat.id, cat);
      } else {
        // Create new category
        const { id, ...catWithoutId } = cat;
        await saveCategory(catWithoutId);
      }
      const updatedCategories = await getAllCategories();
      setCategories(updatedCategories);
      toast.success(selectedCategory ? "Category updated" : "Category created");
      setSelectedCategory(undefined);
    } catch (error) {
      toast.error("Failed to save category");
    }
  };

  const handleEditClick = (cat: Category) => {
    setSelectedCategory(cat);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const count = getCategoryTransactionCount(id);
    if (count > 0) {
      toast.error(`Cannot delete category with ${count} transaction(s)`);
      return;
    }
    setCategoryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete);
        const updatedCategories = await getAllCategories();
        setCategories(updatedCategories);
        toast.success("Category deleted");
        setCategoryToDelete(null);
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
    setDeleteConfirmOpen(false);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (
        searchQuery &&
        !cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [categories, searchQuery]);

  const incomeCategories = filteredCategories.filter(
    (c) => c.type === "income",
  );
  const expenseCategories = filteredCategories.filter(
    (c) => c.type === "expense",
  );

  const CategoryCard = ({ category }: { category: Category }) => {
    const count = getCategoryTransactionCount(category.id);
    const totalAmount = getTransactionsForCategory(category.id).reduce(
      (sum, txn) => sum + txn.amount,
      0,
    );

    return (
      <Card className="p-4 sm:p-6 hover:shadow-md transition-all transform hover:-translate-y-1 animate-slide-in">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                {category.name}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {count} transaction{count !== 1 ? "s" : ""}
              {count > 0 && (
                <span className="ml-2 font-medium">
                  • ₹
                  {totalAmount.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </span>
              )}
            </p>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                category.type === "income"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {category.type}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditClick(category)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={count > 0}
              onClick={() => handleDeleteClick(category.id)}
              title={
                count > 0
                  ? "Delete all transactions in this category first"
                  : ""
              }
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Categories
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Organize and manage your transaction categories
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedCategory(undefined);
            setFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Income Categories */}
      {incomeCategories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Income Categories
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      )}

      {/* Expense Categories */}
      {expenseCategories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Expense Categories
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      )}

      {filteredCategories.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {categories.length === 0
              ? "No categories yet. Create your first category to get started!"
              : "No categories match your search."}
          </p>
          {categories.length === 0 && (
            <Button
              onClick={() => {
                setSelectedCategory(undefined);
                setFormOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Category
            </Button>
          )}
        </Card>
      )}

      {/* Category Form Dialog */}
      <CategoryForm
        open={formOpen}
        category={selectedCategory}
        onSubmit={handleAddCategory}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelectedCategory(undefined);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
