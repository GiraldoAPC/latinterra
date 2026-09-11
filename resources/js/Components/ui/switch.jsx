import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal dependency-free toggle switch (no @radix-ui/react-switch installed).
 * API mirrors shadcn's Switch: checked, onCheckedChange.
 */
const Switch = React.forwardRef(
    ({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => (
        <button
            type="button"
            id={id}
            ref={ref}
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange?.(!checked)}
            className={cn(
                "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00ADEE]/20 disabled:cursor-not-allowed disabled:opacity-50",
                checked ? "bg-[#00ADEE]" : "bg-input hover:bg-muted-foreground/30",
                className
            )}
            {...props}
        >
            <span
                className={cn(
                    "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                    checked ? "translate-x-4" : "translate-x-0"
                )}
            />
        </button>
    )
);
Switch.displayName = "Switch";

export { Switch };
