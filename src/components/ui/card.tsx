import type * as React from 'react'
import { cn } from '@/lib/utils'

// Add a size variant prop
interface CardProps extends React.ComponentProps<'div'> {
  size?: 'default' | 'compact' | 'tight'
}

function Card({ className, size = 'default', ...props }: CardProps) {
  const sizeClasses = {
    default: 'gap-6 py-6',
    compact: 'gap-3 py-3',
    tight: 'gap-2 py-2',
  }

  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

interface CardHeaderProps extends React.ComponentProps<'div'> {
  size?: 'default' | 'compact' | 'tight'
}

function CardHeader({ className, size = 'default', ...props }: CardHeaderProps) {
  const sizeClasses = {
    default: 'gap-2 px-6 [.border-b]:pb-6',
    compact: 'gap-1 px-3 [.border-b]:pb-3',
    tight: 'gap-0.5 px-2 [.border-b]:pb-2',
  }

  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

interface CardContentProps extends React.ComponentProps<'div'> {
  size?: 'default' | 'compact' | 'tight'
}

function CardContent({ className, size = 'default', ...props }: CardContentProps) {
  const sizeClasses = {
    default: 'px-6',
    compact: 'px-3',
    tight: 'px-2',
  }

  return <div data-slot="card-content" className={cn(sizeClasses[size], className)} {...props} />
}

interface CardFooterProps extends React.ComponentProps<'div'> {
  size?: 'default' | 'compact' | 'tight'
}

function CardFooter({ className, size = 'default', ...props }: CardFooterProps) {
  const sizeClasses = {
    default: 'px-6 [.border-t]:pt-6',
    compact: 'px-3 [.border-t]:pt-3',
    tight: 'px-2 [.border-t]:pt-2',
  }

  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center', sizeClasses[size], className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps }
