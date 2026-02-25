import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '../../../lib/utils';

const colorMap: Record<string, string> = {
  indigo: '#6366f1',
  cyan: '#06b6d4',
  blue: '#3b82f6',
  violet: '#8b5cf6',
  fuchsia: '#d946ef',
  emerald: '#10b981',
  yellow: '#eab308',
  red: '#ef4444',
  orange: '#f97316',
  slate: '#64748b',
};

interface DonutChartProps {
  className?: string;
  data: any[];
  category: string;
  index: string;
  colors?: string[];
  valueFormatter?: (number: number) => string;
  showLabel?: boolean;
  showAnimation?: boolean;
  animationDuration?: number;
}

const DonutChart = ({
  className,
  data,
  category,
  index,
  colors = [],
  valueFormatter = (value: number) => `${value}`,
  showLabel = true,
  showAnimation = true,
  animationDuration = 1000,
}: DonutChartProps) => {

  const parseData = data.map((item) => ({
    name: item[index],
    value: item[category],
  }));

  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={parseData}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="100%"
            paddingAngle={2}
            dataKey="value"
            isAnimationActive={showAnimation}
            animationDuration={animationDuration}
            stroke="none"
          >
            {parseData.map((entry, i) => (
              <Cell 
                key={`cell-${i}`} 
                fill={colors[i % colors.length] ? colorMap[colors[i % colors.length]] || colors[i % colors.length] : `hsl(var(--p))` } 
              />
            ))}
          </Pie>
          <Tooltip 
             formatter={(value: any) => [valueFormatter(value)]}
             contentStyle={{ backgroundColor: 'hsl(var(--b1))', borderColor: 'hsl(var(--bc) / 0.1)', color: 'hsl(var(--bc))', borderRadius: '0.5rem' }}
             itemStyle={{ color: 'hsl(var(--bc))' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export { DonutChart };
