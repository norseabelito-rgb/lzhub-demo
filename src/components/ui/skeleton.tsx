import { cn } from "@/lib/utils"

/**
 * Skeleton - Loading placeholder with pulse animation
 * Used for content loading states across the application
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
