import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const progressVariants = cva(
  "relative h-3 w-full overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        default: "h-3",
        sm: "h-2",
        lg: "h-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const indicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
  {
    variants: {
      severity: {
        healthy: "bg-severity-healthy",
        mild: "bg-severity-mild",
        moderate: "bg-severity-moderate",
        severe: "bg-severity-severe",
        default: "bg-primary",
      },
    },
    defaultVariants: {
      severity: "default",
    },
  }
);

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof indicatorVariants> {
  showLabel?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, size, severity, showLabel = false, ...props }, ref) => (
  <div className="relative">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(progressVariants({ size, className }))}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(indicatorVariants({ severity }))}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
    {showLabel && (
      <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+8px)] text-sm font-medium text-foreground">
        {value}%
      </span>
    )}
  </div>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
