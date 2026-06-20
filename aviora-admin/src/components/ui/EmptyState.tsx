import type { ReactNode } from 'react';

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {icon && <div className="text-[#888888] opacity-50">{icon}</div>}
      <div>
        <h3 className="text-base font-bold text-[#1A1A1A]">{title}</h3>
        {description && <p className="text-sm text-[#888888] mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
