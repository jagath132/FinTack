import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RecurringTransactionTemplate, Category } from "@/lib/types";

const recurringSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  categoryId: z.string().min(1, "Please select a category"),
  type: z.enum(["income", "expense"]),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

type RecurringFormData = z.infer<typeof recurringSchema>;

interface RecurringFormProps {
  open: boolean;
  template?: RecurringTransactionTemplate;
  categories: Category[];
  onSubmit: (template: RecurringTransactionTemplate) => void;
  onOpenChange: (open: boolean) => void;
}

export default function RecurringForm({
  open,
  template,
  categories,
  onSubmit,
  onOpenChange,
}: RecurringFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      name: "",
      amount: 0,
      categoryId: "",
      type: "expense",
      frequency: "monthly",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      description: "",
      notes: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        amount: template.amount,
        categoryId: template.categoryId,
        type: template.type,
        frequency: template.frequency,
        startDate: template.startDate.split('T')[0],
        endDate: template.endDate ? template.endDate.split('T')[0] : "",
        description: template.description,
        notes: template.notes || "",
        isActive: template.isActive,
      });
    } else {
      form.reset({
        name: "",
        amount: 0,
        categoryId: "",
        type: "expense",
        frequency: "monthly",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        description: "",
        notes: "",
        isActive: true,
      });
    }
  }, [template, form]);

  const handleSubmit = async (data: RecurringFormData) => {
    setIsSubmitting(true);
    try {
      const templateData: RecurringTransactionTemplate = {
        id: template?.id || crypto.randomUUID(),
        name: data.name,
        amount: data.amount,
        categoryId: data.categoryId,
        type: data.type,
        frequency: data.frequency,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        description: data.description,
        notes: data.notes || undefined,
        isActive: data.isActive,
        createdAt: template?.createdAt || new Date().toISOString(),
        lastGenerated: template?.lastGenerated,
      };

      await onSubmit(templateData);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === form.watch("type"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Recurring Transaction" : "Create Recurring Transaction"}
          </DialogTitle>
          <DialogDescription>
            {template
              ? "Update your recurring transaction template."
              : "Set up automatic recurring income or expenses."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Monthly Salary, Rent Payment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the transaction" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or details"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this recurring transaction
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : template ? "Update Template" : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}