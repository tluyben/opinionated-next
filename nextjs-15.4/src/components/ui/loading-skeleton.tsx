import { Skeleton } from "@/components/ui/skeleton"

interface LoadingSkeletonProps {
  variant?: 'default' | 'card' | 'table' | 'form' | 'dashboard' | 'chat' | 'list'
  rows?: number
  className?: string
}

export function LoadingSkeleton({ 
  variant = 'default', 
  rows = 3,
  className 
}: LoadingSkeletonProps) {
  const baseClass = className || ""

  switch (variant) {
    case 'card':
      return (
        <div className={`p-4 border rounded-lg space-y-3 ${baseClass}`}>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      )

    case 'table':
      return (
        <div className={`space-y-2 ${baseClass}`}>
          {/* Header */}
          <div className="flex space-x-4 p-3 border-b">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          {/* Rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex space-x-4 p-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      )

    case 'form':
      return (
        <div className={`space-y-4 ${baseClass}`}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-24" />
        </div>
      )

    case 'dashboard':
      return (
        <div className={`space-y-6 ${baseClass}`}>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
          {/* Chart */}
          <Skeleton className="h-64 w-full border rounded-lg" />
        </div>
      )

    case 'chat':
      return (
        <div className={`space-y-4 ${baseClass}`}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-xs">
                <Skeleton className="h-12 w-48 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )

    case 'list':
      return (
        <div className={`space-y-3 ${baseClass}`}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      )

    default:
      return (
        <div className={`space-y-3 ${baseClass}`}>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      )
  }
}

// Export individual components for specific use cases
export { PageSkeleton, CardSkeleton, TableSkeleton, FormSkeleton, DashboardSkeleton, ChatSkeleton } from './page-skeleton'