import { Skeleton } from "@/components/ui/skeleton";

export default function TableSkeleton() {
  const lineCount = Math.floor(Math.random() * 8) + 12;
  const columns = Array.from({ length: lineCount });

  return (
    <div className="p-4 space-y-2">
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-2">
          {Array.from({ length: columns.length }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-6 bg-accent rounded animate-pulse flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}