interface KPICardProps {
  label: string;
  value: string | number;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  icon: React.ReactNode;
}

export function KPICard({ label, value, color = '#1A1A1A', bgColor = '#EAF3DE', borderColor, icon }: KPICardProps) {
  return (
    <div
      className="bg-white rounded-card shadow-card p-5 flex items-center gap-4 border border-[#E8E8E8]"
      style={borderColor ? { borderBottom: `4px solid ${borderColor}` } : {}}
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bgColor }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold leading-tight" style={{ color }}>{value}</p>
        <p className="text-sm text-[#555555] mt-0.5">{label}</p>
      </div>
    </div>
  );
}
