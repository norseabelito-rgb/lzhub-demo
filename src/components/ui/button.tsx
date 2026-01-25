import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button component with LaserZone design system integration.
 *
 * Variants:
 * - default: Primary neon pink with subtle hover glow
 * - glow: Permanent neon glow effect for prominent CTAs
 * - outline-glow: Outline with glow on hover
 * - destructive, secondary, ghost, outline, link: Standard variants
 *
 * Sizes:
 * - sm, default, lg: Standard sizes
 * - xl: Large CTA buttons (48px height)
 * - icon, icon-sm, icon-lg: Square icon buttons
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_oklch(0.65_0.29_336_/_0.4)]",
        glow:
          "bg-primary text-primary-foreground shadow-[0_0_15px_oklch(0.65_0.29_336_/_0.4),0_0_30px_oklch(0.65_0.29_336_/_0.2)] hover:shadow-[0_0_20px_oklch(0.65_0.29_336_/_0.5),0_0_40px_oklch(0.65_0.29_336_/_0.3)]",
        "outline-glow":
          "border border-primary bg-transparent text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_oklch(0.65_0.29_336_/_0.4),0_0_30px_oklch(0.65_0.29_336_/_0.2)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-success text-success-foreground hover:bg-success/90",
        warning:
          "bg-warning text-warning-foreground hover:bg-warning/90",
        touch:
          "bg-primary text-primary-foreground shadow-[0_0_15px_oklch(0.65_0.29_336_/_0.4),0_0_30px_oklch(0.65_0.29_336_/_0.2)] hover:shadow-[0_0_20px_oklch(0.65_0.29_336_/_0.5),0_0_40px_oklch(0.65_0.29_336_/_0.3)] active:scale-[0.98]",
      },
      size: {
        default: "h-10 min-h-11 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 min-h-11 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-14 rounded-lg px-8 text-base font-semibold has-[>svg]:px-6",
        icon: "size-11 min-w-11 min-h-11",
        "icon-sm": "size-10 min-w-11 min-h-11",
        "icon-lg": "size-12",
        touch: "h-14 min-h-14 px-8 text-base font-semibold rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
