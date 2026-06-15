interface Props {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const COLORS = [
  'bg-[#1E6B2E] text-white',
  'bg-[#0C447C] text-white',
  'bg-[#854F0B] text-white',
  'bg-[#A32D2D] text-white',
  'bg-[#4A1D96] text-white',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function colorFor(name: string): string {
  let hash = 0;
  for (const ch of name) hash += ch.charCodeAt(0);
  return COLORS[hash % COLORS.length];
}

export default function FarmerAvatar({ name, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sizeClass} ${colorFor(name)} rounded-xl flex items-center justify-center font-bold flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
}
