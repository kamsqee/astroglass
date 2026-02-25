import React from 'react';
import { cn } from '../../../lib/utils';

interface BarListProps {
  data: { name: string; value: number }[];
  className?: string;
  color?: string; // e.g. 'indigo'
  valueFormatter?: (number: number) => string;
}

const BarList = ({
  data,
  className,
  valueFormatter = (value: number) => `${value}`,
}: BarListProps) => {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className={cn("w-full space-y-3", className)}>
      {data.map((item) => (
        <div key={item.name} className="group relative">
           <div className="flex items-center justify-between text-xs mb-1 px-1 min-w-0">
             <span className="font-medium text-[hsl(var(--bc)/0.7)] group-hover:text-[hsl(var(--bc))] transition-colors truncate mr-2 min-w-0 overflow-hidden">
               {item.name}
             </span>
             <span className="text-[hsl(var(--bc)/0.5)] tabular-nums whitespace-nowrap flex-shrink-0">
               {valueFormatter(item.value)}
             </span>
           </div>
           
           <div className="h-2 w-full rounded-full bg-[hsl(var(--bc)/0.05)] overflow-hidden">
             <div 
               className="h-full rounded-full bg-[hsl(var(--a))] opacity-60 group-hover:opacity-100 shadow-[0_0_10px_hsl(var(--a)/0.5)] transition-all duration-700 ease-out"
               style={{ width: `${(item.value / maxValue) * 100}%` }}
             />
           </div>
        </div>
      ))}
    </div>
  );
};

export { BarList };
