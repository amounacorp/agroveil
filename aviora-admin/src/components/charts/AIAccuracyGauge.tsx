import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface Props {
  value: number;
}

export default function AIAccuracyGauge({ value }: Props) {
  const data = [
    { name: 'background', value: 100, fill: '#E8E8E8' },
    { name: 'score', value, fill: '#1E6B2E' },
  ];

  return (
    <div className="relative flex flex-col items-center">
      <ResponsiveContainer width={160} height={160}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={52}
          outerRadius={72}
          startAngle={225}
          endAngle={-45}
          data={data}
          barSize={16}
        >
          <RadialBar background dataKey="value" data={[{ value: 100, fill: '#F0F0F0' }]} />
          <RadialBar dataKey="value" data={[{ value, fill: '#1E6B2E' }]} cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-2xl font-bold text-[#1A1A1A]">{value.toFixed(1)}%</p>
        <p className="text-[10px] text-[#888888] uppercase font-bold">Confiance</p>
      </div>
    </div>
  );
}
