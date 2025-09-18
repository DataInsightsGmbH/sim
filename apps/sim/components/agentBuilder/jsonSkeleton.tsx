import { Skeleton } from "@/components/ui/skeleton";

export default function JsonSkeleton() {
  const lineCount = Math.floor(Math.random() * 8) + 12;
  const lines = Array.from({ length: lineCount });

  return (
    <div className="p-4 space-y-2">
      {lines.map((_, idx) => {
        const width = Math.floor(Math.random() * 140) + 60;
        return (
          <Skeleton
            key={idx}
            className="h-4 rounded-full animate-pulse"
            style={{ width: `${width}px` }}
          />
        );
      })}
    </div>
  );
}