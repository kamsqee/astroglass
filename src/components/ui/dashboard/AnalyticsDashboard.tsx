import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { cn } from '../../../lib/utils';

// Sample Data
// Sample Data
const websiteTraffic = [
  { date: 'Jan 23', Visitors: 2890, Pageviews: 4500 },
  { date: 'Feb 23', Visitors: 3200, Pageviews: 5100 },
  { date: 'Mar 23', Visitors: 3500, Pageviews: 5800 },
  { date: 'Apr 23', Visitors: 3100, Pageviews: 4900 },
  { date: 'May 23', Visitors: 4200, Pageviews: 6500 },
  { date: 'Jun 23', Visitors: 4800, Pageviews: 7200 },
];

const salesData = [
  { name: 'Templates', sales: 4500, color: 'hsl(var(--a))' },
  { name: 'Components', sales: 2100, color: 'hsl(var(--a) / 0.7)' },
  { name: 'Consulting', sales: 1200, color: 'hsl(var(--a) / 0.4)' },
  { name: 'SaaS Subs', sales: 3800, color: 'hsl(var(--a) / 0.2)' },
];

const kpiData = [
  {
    title: 'Total Revenue',
    metric: '$124,592',
    delta: '+12.3%',
    deltaType: 'success',
    progress: 78,
  },
  {
    title: 'Active Users',
    metric: '45,231',
    delta: '+8.1%',
    deltaType: 'success',
    progress: 65,
  },
  {
    title: 'Bounce Rate',
    metric: '42.3%',
    delta: '-2.1%',
    deltaType: 'success', // Good for bounce rate
    progress: 42,
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[hsl(var(--bc)/0.1)] bg-[hsl(var(--b1)/0.8)] backdrop-blur-md p-3 shadow-xl">
        <p className="mb-2 text-sm font-medium text-[hsl(var(--bc))]">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs text-[hsl(var(--bc)/0.7)]">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}:</span>
            <span className="font-mono font-bold text-[hsl(var(--bc))]">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsDashboard = () => {
  return (
    <div className="space-y-8 w-full">
      <div>
        <h3 className="text-2xl font-bold text-[hsl(var(--bc))] tracking-tight">Executive Overview</h3>
        <p className="text-[hsl(var(--bc)/0.5)]">Real-time performance metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {kpiData.map((item) => (
          <Card key={item.title} variant="glass" className="border-[hsl(var(--bc)/0.05)] bg-[hsl(var(--b1)/0.4)] hover:bg-[hsl(var(--b1)/0.6)] transition-colors shadow-none">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--bc)/0.5)]">{item.title}</p>
                  <p className="text-2xl sm:text-3xl font-black text-[hsl(var(--bc))] mt-1 tracking-tight">{item.metric}</p>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 backdrop-blur-md">
                  {item.delta}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[hsl(var(--bc)/0.4)]">
                  <span>Progress</span>
                  <span>{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-1.5 bg-[hsl(var(--bc)/0.05)] [&>div]:bg-gradient-to-r [&>div]:from-[hsl(var(--a))] [&>div]:to-[hsl(var(--a)/0.5)]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts area */}
      <Tabs defaultValue="traffic" className="space-y-6 w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto bg-[hsl(var(--bc)/0.05)] border border-[hsl(var(--bc)/0.05)] p-1 rounded-xl">
          <TabsTrigger value="traffic" className="rounded-lg data-[state=active]:bg-[hsl(var(--b1))] data-[state=active]:text-[hsl(var(--bc))] data-[state=active]:shadow-sm text-[hsl(var(--bc)/0.6)]">Traffic Analysis</TabsTrigger>
          <TabsTrigger value="revenue" className="rounded-lg data-[state=active]:bg-[hsl(var(--b1))] data-[state=active]:text-[hsl(var(--bc))] data-[state=active]:shadow-sm text-[hsl(var(--bc)/0.6)]">Revenue Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="w-full">
          <Card variant="glass" className="border-[hsl(var(--bc)/0.05)] bg-[hsl(var(--b1)/0.4)]">
            <CardHeader>
              <CardTitle className="text-[hsl(var(--bc))]">Traffic Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px] sm:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={websiteTraffic} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--a))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--a))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--bc))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--bc))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc)/0.05)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--bc)/0.2)" 
                    tick={{ fill: 'hsl(var(--bc)/0.4)', fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--bc)/0.2)" 
                    tick={{ fill: 'hsl(var(--bc)/0.4)', fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Area 
                    type="monotone" 
                    dataKey="Visitors" 
                    stroke="hsl(var(--a))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorVisitors)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Pageviews" 
                    stroke="hsl(var(--bc))" 
                    strokeOpacity={0.3}
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPv)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="w-full">
          <Card variant="glass" className="border-[hsl(var(--bc)/0.05)] bg-[hsl(var(--b1)/0.4)]">
             <CardHeader>
               <CardTitle className="text-[hsl(var(--bc))]">Revenue Mix</CardTitle>
             </CardHeader>
             <CardContent className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-8 min-h-[220px] sm:min-h-[350px] p-3 sm:p-6">
                <div className="relative w-full h-[220px] sm:h-[300px] md:w-1/2 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesData}
                        cx="50%"
                        cy="50%"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={5}
                        dataKey="sales"
                        stroke="none"
                      >
                        {salesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend - relative flex layout */}
                <div className="w-full md:w-auto flex flex-wrap md:flex-col gap-4 justify-center">
                   {salesData.map(item => (
                     <div key={item.name} className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} />
                       <div className="flex flex-col">
                         <span className="text-sm font-medium text-[hsl(var(--bc))]">{item.name}</span>
                         <span className="text-xs text-[hsl(var(--bc)/0.4)]">${item.sales.toLocaleString()}</span>
                       </div>
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
