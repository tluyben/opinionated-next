"use client"

import { Suspense } from 'react'
import { LoadingSkeleton } from './loading-skeleton'

interface SuspenseSkeletonProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  variant?: 'default' | 'card' | 'table' | 'form' | 'dashboard' | 'chat' | 'list'
  rows?: number
  className?: string
}

export function SuspenseSkeleton({
  children,
  fallback,
  variant = 'default',
  rows = 3,
  className
}: SuspenseSkeletonProps) {
  const skeletonFallback = fallback || (
    <LoadingSkeleton 
      variant={variant}
      rows={rows}
      className={className}
    />
  )

  return (
    <Suspense fallback={skeletonFallback}>
      {children}
    </Suspense>
  )
}

// Convenience components for common patterns
export function SuspenseCard({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <SuspenseSkeleton variant="card" className={className}>
      {children}
    </SuspenseSkeleton>
  )
}

export function SuspenseTable({
  children,
  rows = 5,
  className
}: {
  children: React.ReactNode
  rows?: number
  className?: string
}) {
  return (
    <SuspenseSkeleton variant="table" rows={rows} className={className}>
      {children}
    </SuspenseSkeleton>
  )
}

export function SuspenseForm({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <SuspenseSkeleton variant="form" className={className}>
      {children}
    </SuspenseSkeleton>
  )
}

export function SuspenseDashboard({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <SuspenseSkeleton variant="dashboard" className={className}>
      {children}
    </SuspenseSkeleton>
  )
}

export function SuspenseChat({
  children,
  rows = 3,
  className
}: {
  children: React.ReactNode
  rows?: number
  className?: string
}) {
  return (
    <SuspenseSkeleton variant="chat" rows={rows} className={className}>
      {children}
    </SuspenseSkeleton>
  )
}