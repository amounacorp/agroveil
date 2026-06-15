import { PLAN_LABELS, PLAN_COLORS } from '../../utils/constants';

interface PlanBadgeProps {
  plan: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PlanBadge({ plan, size = 'md' }: PlanBadgeProps) {
  const { text, bg } = PLAN_COLORS[plan] ?? { text: '#888888', bg: '#F2F2F2' };
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : size === 'lg' ? 'text-sm px-4 py-1.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={`font-bold rounded-pill uppercase inline-block ${sizeClass}`}
      style={{ color: text, backgroundColor: bg }}
    >
      {PLAN_LABELS[plan] ?? plan.toUpperCase()}
    </span>
  );
}
