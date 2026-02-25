import React from 'react';
import { cn } from '../../../lib/utils';


interface TrackerProps {
  data: { color?: string; tooltip?: string }[];
  className?: string;
}

const Tracker = ({
  data,
  className,
}: TrackerProps) => {
  return (
    <div className={cn("flex items-center gap-0.5 sm:gap-1 w-full", className)}>
      {data.map((item, index) => (
        <div
          key={index}
          className={cn(
            "h-6 sm:h-8 flex-1 rounded-sm transition-all hover:scale-110",
            item.color === 'emerald' ? 'bg-emerald-500/50 hover:bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.3)]' :
            item.color === 'yellow' ? 'bg-yellow-500/50 hover:bg-yellow-400' :
            item.color === 'red' ? 'bg-red-500/50 hover:bg-red-400' :
            'bg-[hsl(var(--bc)/0.1)] hover:bg-[hsl(var(--bc)/0.2)]'
          )}
          title={item.tooltip} 
        />
      ))}
    </div>
  );
};

export { Tracker };
