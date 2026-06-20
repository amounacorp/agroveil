import { formatRelative } from '../../utils/formatters';

interface SyncBadgeProps {
  lastSyncAt: string | null | undefined;
}

export function SyncBadge({ lastSyncAt }: SyncBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white/60 text-agro-green rounded-pill border border-agro-green/20 w-fit text-sm font-medium">
      <span className="w-2 h-2 bg-agro-green rounded-full animate-pulse" />
      Sync {formatRelative(lastSyncAt)}
    </div>
  );
}
