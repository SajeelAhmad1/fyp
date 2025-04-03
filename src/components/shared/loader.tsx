import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string; // Hex or Tailwind color (e.g., "#579FE1" or "[#F19B12]")
  withText?: boolean; // Show "Loading..." text
  className?: string; // Additional Tailwind classes
}

const Loader = ({
  size = "md",
  color = "#579FE1",
  withText = false,
  className = "",
}: LoaderProps) => {
  // Size mappings
  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const innerSizeClasses = {
    sm: "w-4 h-4",
    md: "w-7 h-7",
    lg: "w-10 h-10",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ripple (ping) */}
        <div
          className="absolute inset-0 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full"
          style={{ backgroundColor: color, opacity: 0.4 }}
        ></div>
        {/* Middle ripple (pulse) */}
        <div
          className="absolute inset-0 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-full"
          style={{ backgroundColor: color, opacity: 0.3 }}
        ></div>
        {/* Inner solid circle */}
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full ${innerSizeClasses[size]}`}
          style={{ backgroundColor: color }}
        ></div>
      </div>
      {/* Optional loading text */}
      {withText && (
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading products...
        </p>
      )}
    </div>
  );
};

export { Loader };