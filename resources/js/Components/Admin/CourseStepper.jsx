import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Horizontal step indicator for the course wizard.
 *
 * steps: [{ id: number, label: string }]
 * current: id of the active step
 * completedUntil: highest step id considered "reachable" (e.g. course not yet
 *   created => only step 1 is reachable)
 * onStepClick(id): optional, omit to make steps non-clickable
 * bare: no card wrapper (used inside modals). Also hides the text label
 *   (circles + connectors only) since bare usage always shows the active
 *   step's title separately right below - keeps 5+ steps from overflowing
 *   a modal's width.
 */
export default function CourseStepper({ steps, current, completedUntil, onStepClick, bare = false }) {
    return (
        <div className={bare ? "mb-5" : "mb-6 rounded-xl border bg-card px-4 py-4 sm:px-6"}>
            <div className="flex items-center">
                {steps.map((step, idx) => {
                    const isLast = idx === steps.length - 1;
                    const done = step.id < current;
                    const active = step.id === current;
                    const reachable = onStepClick && step.id <= completedUntil;
                    const circleSize = bare ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

                    return (
                        <div key={step.id} className={cn("flex items-center", !isLast && "flex-1")}>
                            <button
                                type="button"
                                disabled={!reachable}
                                title={step.label}
                                onClick={() => reachable && onStepClick(step.id)}
                                className={cn(
                                    "flex items-center gap-3",
                                    bare ? "flex-col gap-1.5 sm:flex-col" : "flex-col sm:flex-row",
                                    reachable ? "cursor-pointer" : "cursor-default"
                                )}
                            >
                                <span
                                    className={cn(
                                        "box-border flex shrink-0 items-center justify-center rounded-full font-bold leading-none ring-4 transition-colors",
                                        circleSize,
                                        done
                                            ? "bg-[#00ADEE] text-white ring-[#00ADEE]/15"
                                            : active
                                            ? "bg-[#024A7D] text-white ring-[#024A7D]/15"
                                            : "border-2 border-slate-300 bg-slate-100 text-slate-500 ring-transparent"
                                    )}
                                >
                                    {done ? <Check className={bare ? "h-4 w-4" : "h-5 w-5"} strokeWidth={3} /> : <span>{step.id}</span>}
                                </span>
                                {!bare && (
                                    <span
                                        className={cn(
                                            "max-w-[7rem] text-center text-xs font-semibold leading-tight sm:max-w-none sm:text-left sm:text-sm",
                                            active
                                                ? "text-foreground"
                                                : done
                                                ? "text-foreground/80"
                                                : "text-slate-500"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                )}
                            </button>

                            {!isLast && (
                                <div
                                    className={cn(
                                        "rounded-full transition-colors",
                                        bare ? "mx-1.5 h-0.5 flex-1" : "mx-2 mt-5 h-1 flex-1 sm:mx-3",
                                        step.id < current ? "bg-[#00ADEE]" : "bg-slate-200"
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
