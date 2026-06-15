import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  sub?: string;
  icon: ReactNode;
  iconBg?: string;
  valueColor?: string;
}

export default function KPICard({ label, value, trend, trendUp, sub, icon, iconBg = 'bg-[#EAF3DE]', valueColor = 'text-[#1A1A1A]' }: Props) {
  return (
    <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold ${trendUp !== false ? 'text-[#27500A]' : 'text-[#A32D2D]'}`}>
            {trendUp !== false ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-[#888888] font-medium mb-1">{label}</p>
        <h3 className={`text-2xl font-bold ${valueColor}`}>{value}</h3>
        {sub && <p className="text-xs text-[#888888] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
