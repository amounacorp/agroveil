interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon = '🎉', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{title}</h3>
      <p className="text-sm text-[#888888] max-w-xs mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="h-11 px-6 bg-[#1E6B2E] text-white rounded-btn font-semibold hover:bg-[#0F3D1A] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
