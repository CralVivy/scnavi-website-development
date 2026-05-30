import React from "react";

export function Card({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl p-5 shadow-card ${className}`} {...props}>
      {children}
    </div>
  );
}
