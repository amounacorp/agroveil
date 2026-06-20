import { formatSeverity } from '../../utils/formatters';

interface Props {
  severity: 'critical' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

const styles = {
  critical: 'bg-[#FCEBEB] text-[#A32D2D] border border-[#E24B4A]',
  warning: 'bg-[#FAEEDA] text-[#854F0B] border border-[#EF9F27]',
  info: 'bg-[#E6F1FB] text-[#0C447C] border border-[#378ADD]',
};

export default function AlertBadge({ severity, size = 'sm' }: Props) {
  return (
    <span
      className={`inline-block font-bold tracking-wide rounded-pill ${styles[severity]} ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'
      }`}
    >
      {formatSeverity(severity)}
    </span>
  );
}
