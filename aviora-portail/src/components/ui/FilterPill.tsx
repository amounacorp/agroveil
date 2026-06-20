interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className="h-10 px-4 rounded-pill text-sm font-medium whitespace-nowrap transition-colors"
      style={
        active
          ? { backgroundColor: '#1E6B2E', color: '#FFFFFF' }
          : { backgroundColor: '#F4F4F4', color: '#555555' }
      }
    >
      {label}
    </button>
  );
}
