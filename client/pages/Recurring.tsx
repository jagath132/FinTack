import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, RefreshCw, Calendar } from "lucide-react";
import RecurringForm from "@/components/RecurringForm";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  getAllRecurringTemplates,
  saveRecurringTemplate,
  updateRecurringTemplate,
  deleteRecurringTemplate,
  getAllCategories,
  generateAllRecurringTransactions,
} from "@/lib/storage";
import { RecurringTransactionTemplate, Category } from "@/lib/types";
import { toast } from "sonner";

export default function Recurring() {
  const [templates, setTemplates] = useState<RecurringTransactionTemplate[]>(
    [],
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    RecurringTransactionTemplate | undefined
  >();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [temps, cats] = await Promise.all([
          getAllRecurringTemplates(),
          getAllCategories(),
        ]);
        setTemplates(temps);
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

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || "#6b7280";
  };

  const getNextOccurrence = (template: RecurringTransactionTemplate) => {
    const startDate = new Date(template.startDate);
    const lastGenerated = template.lastGenerated
      ? new Date(template.lastGenerated)
      : startDate;
    const now = new Date();

    if (lastGenerated >= now) return lastGenerated;

    let nextDate = new Date(lastGenerated);

    // Calculate next occurrence
    switch (template.frequency) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  };

  const handleAddTemplate = async (template: RecurringTransactionTemplate) => {
    try {
      if (selectedTemplate) {
        await updateRecurringTemplate(template.id, template);
        toast.success("Recurring template updated");
      } else {
        const { id, ...templateWithoutId } = template;
        await saveRecurringTemplate(templateWithoutId);
        toast.success("Recurring template created");
      }
      const updatedTemplates = await getAllRecurringTemplates();
      setTemplates(updatedTemplates);
      setSelectedTemplate(undefined);
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  };

  const handleEditClick = (template: RecurringTransactionTemplate) => {
    setSelectedTemplate(template);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (templateToDelete) {
      try {
        await deleteRecurringTemplate(templateToDelete);
        const updatedTemplates = await getAllRecurringTemplates();
        setTemplates(updatedTemplates);
        toast.success("Recurring template deleted");
        setTemplateToDelete(null);
      } catch (error) {
        console.error("Error deleting template:", error);
        toast.error("Failed to delete template");
      }
    }
    setDeleteConfirmOpen(false);
  };

  const handleGenerateAll = async () => {
    setGenerating(true);
    try {
      await generateAllRecurringTransactions();
      toast.success("Recurring transactions generated successfully");
    } catch (error) {
      console.error("Error generating transactions:", error);
      toast.error("Failed to generate transactions");
    } finally {
      setGenerating(false);
    }
  };

  const activeTemplates = templates.filter((t) => t.isActive);
  const inactiveTemplates = templates.filter((t) => !t.isActive);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Recurring Transactions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Set up automatic recurring income and expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateAll}
            disabled={generating || activeTemplates.length === 0}
            className="gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${generating ? "animate-spin" : ""}`}
            />
            Generate Transactions
          </Button>
          <Button
            onClick={() => {
              setSelectedTemplate(undefined);
              setFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Recurring
          </Button>
        </div>
      </div>

      {/* Active Templates */}
      {activeTemplates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Active Recurring Transactions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTemplates.map((template) => {
              const nextOccurrence = getNextOccurrence(template);
              return (
                <Card
                  key={template.id}
                  className="p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getCategoryColor(
                              template.categoryId,
                            ),
                          }}
                        />
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {template.name}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {getCategoryName(template.categoryId)}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            template.type === "income" ? "default" : "secondary"
                          }
                        >
                          {template.type}
                        </Badge>
                        <Badge variant="outline">{template.frequency}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(template.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Amount
                      </span>
                      <span
                        className={`font-semibold ${template.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {template.type === "income" ? "+" : "-"}₹
                        {template.amount.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Next Occurrence
                      </span>
                      <span className="font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {nextOccurrence.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Description
                      </span>
                      <span className="font-medium text-right">
                        {template.description}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Inactive Templates */}
      {inactiveTemplates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Inactive Templates
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inactiveTemplates.map((template) => (
              <Card
                key={template.id}
                className="p-6 opacity-75 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getCategoryColor(
                            template.categoryId,
                          ),
                        }}
                      />
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {template.name}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {getCategoryName(template.categoryId)}
                    </p>
                    <Badge variant="outline">Inactive</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(template.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {templates.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No recurring transactions set up yet. Create your first recurring
            income or expense!
          </p>
          <Button
            onClick={() => {
              setSelectedTemplate(undefined);
              setFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create First Recurring Transaction
          </Button>
        </Card>
      )}

      {/* Recurring Form Dialog */}
      <RecurringForm
        open={formOpen}
        template={selectedTemplate}
        categories={categories}
        onSubmit={handleAddTemplate}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelectedTemplate(undefined);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Delete Recurring Template"
        description="Are you sure you want to delete this recurring template? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
