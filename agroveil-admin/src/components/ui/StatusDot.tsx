interface Props {
  active: boolean;
  label?: string;
}

export default function StatusDot({ active, label }: Props) {
  return (
    <span className={`flex items-center gap-1.5 font-semibold text-sm ${active ? 'text-[#27500A]' : 'text-[#888888]'}`}>
      <span
        className={`w-2 h-2 rounded-full ${active ? 'bg-[#1E6B2E] animate-pulse' : 'bg-[#888888]'}`}
      />
      {label ?? (active ? 'Actif' : 'Inactif')}
    </span>
  );
}
