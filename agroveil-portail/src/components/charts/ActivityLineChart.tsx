import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { WeeklyActivity } from '../../types';

interface ActivityLineChartProps {
  data: WeeklyActivity[];
}

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-lg shadow-card p-3 text-sm">
      <p className="font-semibold text-[#1A1A1A] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'healthy' ? 'Sains' : 'Sous surveillance'} : {p.value}
        </p>
      ))}
    </div>
  );
}

export function ActivityLineChart({ data }: ActivityLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#888888' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-[#555555]">
              {value === 'healthy' ? 'Sains' : 'Sous surveillance'}
            </span>
          )}
        />
        <Line
          type="monotone"
          dataKey="healthy"
          stroke="#1E6B2E"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="monitored"
          stroke="#EF9F27"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
