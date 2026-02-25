import React from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../../lib/utils'; // Adjust path based on location

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

interface AreaChartProps {
  className?: string;
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (number: number) => string;
  yAxisWidth?: number;
  showAnimation?: boolean;
}

const AreaChart = ({
  className,
  data,
  index,
  categories,
  colors = [],
  valueFormatter = (value: number) => `${value}`,
  yAxisWidth = 56,
  showAnimation = true,
}: AreaChartProps) => {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--bc) / 0.1)" />
          <XAxis 
            dataKey={index} 
            stroke="hsl(var(--bc) / 0.4)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            width={yAxisWidth} 
            stroke="hsl(var(--bc) / 0.4)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={valueFormatter} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--b1))', borderColor: 'hsl(var(--bc) / 0.1)', color: 'hsl(var(--bc))', borderRadius: '0.5rem' }}
            itemStyle={{ color: 'hsl(var(--bc))' }}
            formatter={(value: any) => [valueFormatter(value)]}
            labelStyle={{ color: 'hsl(var(--bc) / 0.6)', marginBottom: '0.25rem' }}
          />
          {categories.map((category, i) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stackId="1"
              stroke={colors[i] ? colorMap[colors[i]] || colors[i] : `hsl(var(--p))` }
              fill={colors[i] ? colorMap[colors[i]] || colors[i] : `hsl(var(--p))` }
              fillOpacity={0.2}
              isAnimationActive={showAnimation}
              animationDuration={1500}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export { AreaChart };
