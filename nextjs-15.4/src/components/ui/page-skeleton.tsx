import { Skeleton } from "@/components/ui/skeleton"

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      
      {/* Content blocks */}
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
        <Skeleton className="h-[100px] w-full" />
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-[120px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <Skeleton className="h-[60px] w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[60px]" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Table header */}
      <div className="flex space-x-4 p-4 border-b">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[120px]" />
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 p-4 border-b">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
      ))}
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[80px]" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-8 w-[60px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
        ))}
      </div>
      
      {/* Chart area */}
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-[300px] w-full" />
      </div>
      
      {/* Recent activity */}
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-[140px]" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
              <Skeleton className="h-3 w-[60px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[70%] space-y-2 ${i % 2 === 0 ? 'items-end' : 'items-start'} flex flex-col`}>
            <div className="flex items-center space-x-2">
              {i % 2 !== 0 && <Skeleton className="h-6 w-6 rounded-full" />}
              <Skeleton className="h-3 w-[60px]" />
              {i % 2 === 0 && <Skeleton className="h-6 w-6 rounded-full" />}
            </div>
            <Skeleton className={`h-16 w-full ${i % 2 === 0 ? 'rounded-l-lg rounded-tr-lg' : 'rounded-r-lg rounded-tl-lg'}`} />
          </div>
        </div>
      ))}
    </div>
  )
}