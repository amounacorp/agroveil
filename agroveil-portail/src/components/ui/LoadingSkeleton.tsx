interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-[#E8E8E8] rounded ${className}`} />;
}

export function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-card shadow-card p-5 flex items-center gap-4 border border-[#E8E8E8]">
      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-7 w-16 mb-2" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
}

export function AlertCardSkeleton() {
  return (
    <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-4">
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-5 w-16 rounded-pill" />
        <Skeleton className="h-5 w-36" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-4/5 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-btn" />
        <Skeleton className="h-8 w-28 rounded-btn" />
      </div>
    </div>
  );
}

export function ReportCardSkeleton() {
  return (
    <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] overflow-hidden">
      <Skeleton className="h-16 rounded-none" />
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10 rounded-btn" />
          <Skeleton className="h-10 w-12 rounded-btn" />
        </div>
      </div>
    </div>
  );
}
