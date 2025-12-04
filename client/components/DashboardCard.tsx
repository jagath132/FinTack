import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'amber';
  description?: string;
  trend?: number; // percentage change
  children?: ReactNode;
  className?: string;
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  description,
  trend,
  children,
  className,
}: DashboardCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20',
    green: 'from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20',
    red: 'from-red-500 to-red-600 bg-red-50 dark:bg-red-900/20',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20',
    amber: 'from-amber-500 to-amber-600 bg-amber-50 dark:bg-amber-900/20',
  };

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
    amber: 'text-amber-600 dark:text-amber-400',
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </h3>
            {trend !== undefined && (
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-1 rounded-full',
                  trend >= 0
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}
              >
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{description}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'p-3 rounded-lg bg-gradient-to-br',
              colorClasses[color]
            )}
          >
            <Icon className={cn('w-6 h-6 text-white')} />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
