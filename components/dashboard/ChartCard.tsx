'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: {
    labels: string[];
    profit: number[];
    loss: number[];
  };
}

export default function ChartCard({ title, subtitle, data }: ChartCardProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    Profit: data.profit[index],
    Loss: data.loss[index],
  }));

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary-500 rounded"></div>
          <span className="text-sm text-gray-600">Lucro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-900 rounded"></div>
          <span className="text-sm text-gray-600">Perda</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="Profit" fill="#f97316" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Loss" fill="#111827" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}






