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
import { Button } from "@/components/ui/button";
import { Budget, Category } from "@/lib/types";

const budgetSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  period: z.enum(["monthly", "yearly"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  open: boolean;
  budget?: Budget;
  categories: Category[];
  onSubmit: (budget: Budget) => void;
  onOpenChange: (open: boolean) => void;
}

export default function BudgetForm({
  open,
  budget,
  categories,
  onSubmit,
  onOpenChange,
}: BudgetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: "",
      amount: 0,
      period: "monthly",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    },
  });

  useEffect(() => {
    if (budget) {
      form.reset({
        categoryId: budget.categoryId,
        amount: budget.amount,
        period: budget.period,
        startDate: budget.startDate.split("T")[0],
        endDate: budget.endDate ? budget.endDate.split("T")[0] : "",
      });
    } else {
      form.reset({
        categoryId: "",
        amount: 0,
        period: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
      });
    }
  }, [budget, form]);

  const handleSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true);
    try {
      const budgetData: Budget = {
        id: budget?.id || crypto.randomUUID(),
        categoryId: data.categoryId,
        amount: data.amount,
        period: data.period,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate
          ? new Date(data.endDate).toISOString()
          : undefined,
        createdAt: budget?.createdAt || new Date().toISOString(),
      };

      await onSubmit(budgetData);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting budget:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? "Edit Budget" : "Create Budget"}</DialogTitle>
          <DialogDescription>
            {budget
              ? "Update your budget settings."
              : "Set a spending limit for a category."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
                      {categories.map((category) => (
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : budget
                    ? "Update Budget"
                    : "Create Budget"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
