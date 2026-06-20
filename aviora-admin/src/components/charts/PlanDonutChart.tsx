import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { PlanDistribution } from '../../types';

interface Props {
  data: PlanDistribution[];
}

export default function PlanDonutChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              dataKey="count"
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #E8E8E8',
                borderRadius: '8px',
                fontSize: 12,
              }}
              formatter={(value: number, _name: string, props: { payload?: PlanDistribution }) => [value, props.payload?.plan]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xl font-bold text-[#1A1A1A]">{total}</p>
          <p className="text-[10px] text-[#888888] uppercase font-bold">Total</p>
        </div>
      </div>

      <div className="w-full space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-[#555555]">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
              {d.plan}
            </span>
            <span className="font-bold text-[#1A1A1A]">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
