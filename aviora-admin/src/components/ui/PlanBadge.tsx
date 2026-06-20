import { formatPlan } from '../../utils/formatters';

interface Props {
  plan: 'free' | 'eleveur' | 'pro' | 'cooperative';
}

const styles: Record<string, string> = {
  free: 'bg-[#F2F2F2] text-[#888888]',
  eleveur: 'bg-[#EAF3DE] text-[#27500A]',
  pro: 'bg-[#FAEEDA] text-[#633806]',
  cooperative: 'bg-[#E6F1FB] text-[#0C447C]',
};

export default function PlanBadge({ plan }: Props) {
  return (
    <span
      className={`inline-block text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-pill ${styles[plan] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {formatPlan(plan)}
    </span>
  );
}
