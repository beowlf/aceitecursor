import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    percentage: number;
    type: 'positive' | 'negative';
    label?: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({ 
  title, 
  value, 
  change, 
  icon,
  className 
}: StatCardProps) {
  return (
    <div className={cn("card", className)}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      
      {change && (
        <div className={cn(
          "flex items-center gap-1 text-sm",
          change.type === 'positive' ? "text-green-600" : "text-red-600"
        )}>
          {change.type === 'positive' ? (
            <ArrowUp size={16} />
          ) : (
            <ArrowDown size={16} />
          )}
          <span>
            {change.type === 'positive' ? '↑' : '↓'}{Math.abs(change.percentage)}%
            {change.label && ` ${change.label}`}
          </span>
        </div>
      )}
    </div>
  );
}






