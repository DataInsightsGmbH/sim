import { Skeleton } from '@/components/ui/skeleton'

export default function JsonSkeleton() {
  const lineCount = Math.floor(Math.random() * 8) + 12
  const lines = Array.from({ length: lineCount })

  return (
    <div className='space-y-2 p-4'>
      {lines.map((_, idx) => {
        const width = Math.floor(Math.random() * 140) + 60
        return (
          <Skeleton
            key={idx}
            className='h-4 animate-pulse rounded-full'
            style={{ width: `${width}px` }}
          />
        )
      })}
    </div>
  )
}
