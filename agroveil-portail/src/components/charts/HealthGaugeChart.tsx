import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { getHealthColor } from '../../utils/formatters';

interface HealthGaugeChartProps {
  score: number;
  label: string;
}

export function HealthGaugeChart({ score, label }: HealthGaugeChartProps) {
  const color = getHealthColor(label);
  const data = [{ value: score, fill: color }];

  return (
    <div className="relative w-36 h-36 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          data={data}
          barSize={12}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            background={{ fill: '#F0F0F0' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}
