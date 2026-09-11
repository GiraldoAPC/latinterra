import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <textarea
            ref={ref}
            className={cn(
                "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-all duration-150 placeholder:text-muted-foreground hover:border-[#00ADEE]/50 focus-visible:border-[#00ADEE] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00ADEE]/15 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
});
Textarea.displayName = "Textarea";

export { Textarea };
