interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  currency?: string;
  className?: string;
}

export default function ProgressCard({ 
  title, 
  current, 
  total, 
  currency = "R$",
  className 
}: ProgressCardProps) {
  const percentage = (current / total) * 100;
  
  return (
    <div className={`card ${className || ''}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-4">{title}</h3>
      
      <div className="mb-2">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900">
            {currency} {current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-sm text-gray-500">
            de {currency} {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}






