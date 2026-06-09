import { Skeleton } from '@/app/components/ds/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gm-bg pt-36 pb-24">
      <div className="gm-container space-y-8">
        <Skeleton className="h-12 w-1/2 mx-auto" />
        <Skeleton className="h-6 w-2/3 mx-auto" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-gm-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
