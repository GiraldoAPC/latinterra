import * as React from "react";
import { cn } from "@/lib/utils";

const ALERT_VARIANTS = {
    default: "border-input bg-background text-foreground",
    destructive: "border-red-200 bg-red-50 text-red-800 [&_svg]:text-red-600",
    warning: "border-amber-200 bg-amber-50 text-amber-800 [&_svg]:text-amber-600",
};

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(
            "relative flex items-start gap-3 rounded-lg border p-3.5 shadow-sm",
            ALERT_VARIANTS[variant],
            className
        )}
        {...props}
    />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("text-sm font-semibold leading-tight", className)} {...props} />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-0.5 text-xs leading-snug opacity-90", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
