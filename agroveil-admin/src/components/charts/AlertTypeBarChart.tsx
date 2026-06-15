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
import type { AlertWeekData } from '../../types';
import { CHART_COLORS } from '../../utils/constants';

interface Props {
  data: AlertWeekData[];
}

export default function AlertTypeBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
        <XAxis dataKey="week" tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: '8px', fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        <Bar dataKey="mortality" name="Mortalité" stackId="a" fill={CHART_COLORS.mortality} radius={[0, 0, 0, 0]} />
        <Bar dataKey="heat_stress" name="Stress therm." stackId="a" fill={CHART_COLORS.heat_stress} />
        <Bar dataKey="inactivity" name="Inactivité" stackId="a" fill={CHART_COLORS.inactivity} />
        <Bar dataKey="cannibalism" name="Cannibalisme" stackId="a" fill={CHART_COLORS.cannibalism} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
