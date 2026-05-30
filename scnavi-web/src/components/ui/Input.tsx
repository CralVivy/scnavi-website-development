import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs text-outline uppercase font-bold tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full h-12 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface placeholder:text-outline/60 transition-all text-[14px] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 ${
            error ? "border-room-red focus:border-room-red focus:ring-room-red/15" : ""
          } ${className}`}
          {...props}
        />
        {error && <span className="text-sm text-room-red font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
