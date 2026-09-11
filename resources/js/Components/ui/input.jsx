import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type = "text", autoComplete = "off", ...props }, ref) => {
    return (
        <input
            type={type}
            autoComplete={autoComplete}
            ref={ref}
            className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:border-[#00ADEE]/50 focus-visible:border-[#00ADEE] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00ADEE]/15 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
});
Input.displayName = "Input";

export { Input };
