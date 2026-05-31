import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  autoComplete?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs text-outline uppercase font-bold tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full h-12 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface placeholder:text-outline/60 transition-all text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 ${
            error ? "border-room-red focus:border-room-red focus:ring-room-red/15" : ""
          } ${className}`}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && <span id={`${inputId}-error`} className="text-sm text-room-red font-medium" role="alert">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
