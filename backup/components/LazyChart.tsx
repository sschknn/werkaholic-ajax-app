import React, { Suspense, lazy } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';
import { BarChart3, PieChart } from 'lucide-react';

interface LazyChartProps {
  type: 'pie' | 'bar';
  data: any[];
  dataKey?: string;
  nameKey?: string;
  className?: string;
}

// Mobile-optimized chart components
const LazyPieChart = lazy(() =>
  Promise.resolve({
    default: ({ data, dataKey, nameKey, className }: any) => (
      <div className={className}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <RechartsPieChart
              data={data}
              cx="50%"
              cy="50%"
              outerRadius="60%"
              innerRadius="20%"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </RechartsPieChart>
            <Tooltip
              contentStyle={{
                fontSize: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    )
  })
);

const LazyBarChart = lazy(() =>
  Promise.resolve({
    default: ({ data, dataKey, nameKey, className }: any) => (
      <div className={className}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis
              dataKey={nameKey}
              className="text-xs"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis
              className="text-xs"
              tick={{ fontSize: 10 }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                fontSize: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar
              dataKey={dataKey}
              radius={[2, 2, 0, 0]}
              strokeWidth={1}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  })
);

const LazyChart: React.FC<LazyChartProps> = ({ type, data, dataKey = 'value', nameKey = 'name', className = '' }) => {
  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-48 sm:h-56 lg:h-64 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
      <div className="text-center space-y-2">
        {type === 'pie' ? (
          <PieChart className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 mx-auto animate-pulse" />
        ) : (
          <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 mx-auto animate-pulse" />
        )}
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Lade Diagramm...</p>
        <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      {type === 'pie' ? (
        <LazyPieChart data={data} dataKey={dataKey} nameKey={nameKey} className={className} />
      ) : (
        <LazyBarChart data={data} dataKey={dataKey} nameKey={nameKey} className={className} />
      )}
    </Suspense>
  );
};

export default LazyChart;