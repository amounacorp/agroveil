import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { FarmerGrowthPoint } from '../../types';

interface Props {
  data: FarmerGrowthPoint[];
}

export default function FarmerGrowthChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#888888', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#888888', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #E8E8E8',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            fontSize: 12,
          }}
          formatter={(value: number) => [value, 'Éleveurs']}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#1E6B2E"
          strokeWidth={2.5}
          dot={{ fill: '#1E6B2E', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#1E6B2E' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
