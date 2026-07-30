import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex cursor-pointer items-center gap-2 text-sm text-fg select-none",
          props.disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="size-4 shrink-0 rounded border border-border-strong accent-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          {...props}
        />
        {label ? <span>{label}</span> : null}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";
