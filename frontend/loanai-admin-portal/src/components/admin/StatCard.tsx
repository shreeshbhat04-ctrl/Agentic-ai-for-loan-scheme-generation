import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  className?: string;
}

const variantStyles = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
};

export const StatCard = ({ 
  title, 
  value, 
  icon,
  trend,
  trendValue,
  variant = 'primary',
  className 
}: StatCardProps) => {
  return (
    <div className={cn('stat-card', className)}>
      {icon && (
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      )}
      <p className="text-muted-foreground text-sm">{title}</p>
      <p className={cn('text-3xl font-bold mt-1 font-mono', variantStyles[variant])}>
        {value}
      </p>
      {trendValue && (
        <p className={cn(
          'text-xs mt-2',
          trend === 'up' && 'text-success',
          trend === 'down' && 'text-destructive',
          trend === 'neutral' && 'text-muted-foreground'
        )}>
          {trend === 'up' && '↑ '}
          {trend === 'down' && '↓ '}
          {trendValue}
        </p>
      )}
    </div>
  );
};
