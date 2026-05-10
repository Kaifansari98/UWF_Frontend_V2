import { Skeleton } from "@/components/ui/skeleton";

const ROW_COUNT = 20;

export default function SkeletonTable5() {
  return (
    <div className="w-full">
      <div className="w-full overflow-hidden">
        <div className="grid w-full grid-cols-9 gap-4 border-b pb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="flex w-full flex-col">
          {Array.from({ length: ROW_COUNT }).map((_, i) => (
            <div
              key={i}
              className="grid w-full grid-cols-9 gap-4 border-b py-4 last:border-b-0"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-[85%]" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[75%]" />
              <Skeleton className="h-4 w-[70%]" />
              <Skeleton className="h-4 w-[65%]" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-16 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
