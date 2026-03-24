import { Skeleton } from "@/components/ui/skeleton";
export function ProfileSkeleton() {
  return <div className="max-w-4xl mx-auto">
      <Skeleton className="w-full h-48 md:h-64 rounded-none" />
      <div className="px-4 md:px-8 -mt-16 relative">
        <Skeleton className="w-32 h-32 rounded-full border-4 border-background" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full max-w-md" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 px-4 mt-8">
        {Array.from({
        length: 6
      }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
      </div>
    </div>;
}
export function PostGridSkeleton() {
  return <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
      {Array.from({
      length: 6
    }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
    </div>;
}