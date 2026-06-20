interface Props {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function LoadingSpinner({ size = 'md', label }: Props) {
  const sizeClass = size === 'sm' ? 'w-5 h-5 border-2' : size === 'lg' ? 'w-12 h-12 border-4' : 'w-8 h-8 border-3';
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClass} border-[#E8E8E8] border-t-[#1E6B2E] rounded-full animate-spin`} />
      {label && <p className="text-sm text-[#888888]">{label}</p>}
    </div>
  );
}
