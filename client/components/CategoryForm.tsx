import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category } from '@/lib/types';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  type: z.enum(['income', 'expense']),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  icon: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  open: boolean;
  category?: Category;
  onSubmit: (data: Category) => void;
  onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
];

export default function CategoryForm({
  open,
  category,
  onSubmit,
  onOpenChange,
}: CategoryFormProps) {
  const [selectedColor, setSelectedColor] = useState(category?.color || '#3b82f6');

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      type: category?.type || 'expense',
      color: category?.color || '#3b82f6',
      icon: category?.icon || '',
    },
  });

  useEffect(() => {
    if (category) {
      setSelectedColor(category.color);
      form.reset({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon || '',
      });
    } else {
      form.reset({
        name: '',
        type: 'expense',
        color: '#3b82f6',
        icon: '',
      });
      setSelectedColor('#3b82f6');
    }
  }, [open, category, form]);

  const handleFormSubmit = (data: CategoryFormData) => {
    const newCategory: Category = {
      id: category?.id || `cat_${Date.now()}`,
      name: data.name,
      type: data.type,
      color: selectedColor,
      icon: data.icon || undefined,
      createdAt: category?.createdAt || new Date().toISOString(),
    };

    onSubmit(newCategory);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] animate-in fade-in slide-in-from-bottom-4">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogDescription>
            {category
              ? 'Update category details below'
              : 'Create a new category for organizing transactions'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Groceries, Salary, Entertainment"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
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

            {/* Color */}
            <FormField
              control={form.control}
              name="color"
              render={() => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setSelectedColor(color);
                            form.setValue('color', color);
                          }}
                          className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                          style={{
                            backgroundColor: color,
                            borderColor: selectedColor === color ? '#000' : '#ccc',
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded border border-slate-300 dark:border-slate-600"
                        style={{ backgroundColor: selectedColor }}
                      />
                      <Input
                        type="text"
                        value={selectedColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#[0-9A-F]{6}$/i.test(val)) {
                            setSelectedColor(val);
                            form.setValue('color', val);
                          }
                        }}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Icon (Optional) */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., ShoppingCart, DollarSign, etc."
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
                {category ? 'Update' : 'Create'} Category
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
