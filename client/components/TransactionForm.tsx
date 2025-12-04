import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Transaction, Category } from "@/lib/types";

const transactionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  amount: z.string().min(1, "Amount is required"),
  categoryId: z.string().min(1, "Category is required"),
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Description is required"),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  transaction?: Transaction;
  categories: Category[];
  onSubmit: (data: Omit<Transaction, "id">) => void;
  onOpenChange: (open: boolean) => void;
}

export default function TransactionForm({
  open,
  transaction,
  categories,
  onSubmit,
  onOpenChange,
}: TransactionFormProps) {
  const [selectedType, setSelectedType] = useState<"income" | "expense">(
    transaction?.type || "expense",
  );

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: transaction
        ? transaction.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      amount: transaction ? transaction.amount.toString() : "",
      categoryId: transaction?.categoryId || "",
      type: transaction?.type || "expense",
      description: transaction?.description || "",
      notes: transaction?.notes || "",
      tags: transaction?.tags?.join(", ") || "",
    },
  });

  useEffect(() => {
    if (transaction) {
      setSelectedType(transaction.type);
      form.reset({
        date: transaction.date.split("T")[0],
        amount: transaction.amount.toString(),
        categoryId: transaction.categoryId,
        type: transaction.type,
        description: transaction.description,
        notes: transaction.notes || "",
        tags: transaction.tags?.join(", ") || "",
      });
    } else {
      form.reset({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        categoryId: "",
        type: "expense",
        description: "",
        notes: "",
        tags: "",
      });
    }
  }, [open, transaction, form]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type as "income" | "expense");
    form.setValue("type", type as "income" | "expense");
    form.setValue("categoryId", "");
  };

  const handleFormSubmit = (data: TransactionFormData) => {
    const tagsArray = data.tags
      ? data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    const transactionData: Omit<Transaction, "id"> = {
      date: new Date(data.date).toISOString(),
      amount: parseFloat(data.amount),
      categoryId: data.categoryId,
      type: data.type,
      description: data.description,
      notes: data.notes || undefined,
      tags: tagsArray,
      createdAt: transaction?.createdAt || new Date().toISOString(),
    };

    onSubmit(transactionData);
    form.reset();
    onOpenChange(false);
  };

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Edit Transaction" : "Add New Transaction"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? "Update transaction details below"
              : "Enter the details for your new transaction"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            {/* Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={handleTypeChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filteredCategories.length === 0 && (
                    <p className="text-xs text-red-600">
                      No categories available for {selectedType}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Weekly groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., food, weekly, important (comma-separated)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                {transaction ? "Update" : "Add"} Transaction
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
