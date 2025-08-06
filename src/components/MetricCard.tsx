import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface MetricCardProps {
  value: string | number;
  label: string;
  unit?: string;
  className?: string;
  trend?: "up" | "down" | "neutral";
  previousValue?: string | number;
  icon?: React.ReactNode;
  animated?: boolean;
  precision?: number;
}

export const MetricCard = ({
  value,
  label,
  unit,
  className,
  trend,
  previousValue,
  icon,
  animated = true,
  precision = 0,
}: MetricCardProps) => {
  const [displayValue, setDisplayValue] = useState<string | number>(value);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate value changes
  useEffect(() => {
    if (
      !animated ||
      typeof value !== "number" ||
      typeof displayValue !== "number"
    ) {
      setDisplayValue(value);
      return;
    }

    if (value !== displayValue) {
      setIsAnimating(true);
      const startTime = Date.now();
      const duration = 600;
      const startValue = displayValue;
      const valueDiff = value - startValue;

      const updateValue = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Nothing-style easing
        const easeOut = 1 - Math.pow(1 - progress, 2);
        const currentValue = startValue + valueDiff * easeOut;

        if (precision > 0) {
          setDisplayValue(Number(currentValue.toFixed(precision)));
        } else {
          setDisplayValue(Math.round(currentValue));
        }

        if (progress < 1) {
          requestAnimationFrame(updateValue);
        } else {
          setDisplayValue(value);
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(updateValue);
    }
  }, [value, displayValue, animated, precision]);

  // Calculate trend indicator
  const getTrendDirection = () => {
    if (
      !previousValue ||
      typeof value !== "number" ||
      typeof previousValue !== "number"
    ) {
      return null;
    }

    if (value > previousValue) return "up";
    if (value < previousValue) return "down";
    return "neutral";
  };

  const trendDirection = trend || getTrendDirection();

  // Format display value
  const formatDisplayValue = () => {
    if (typeof displayValue === "number") {
      if (precision > 0) {
        return displayValue.toFixed(precision);
      }
      return displayValue.toLocaleString();
    }
    return displayValue;
  };

  return (
    <div
      className={cn(
        "metric-card group cursor-pointer",
        isAnimating && "animate-pulse-subtle",
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div className="flex justify-center mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
          {icon}
        </div>
      )}

      {/* Value with unit */}
      <div className="relative">
        <div
          className={cn(
            "font-display text-2xl md:text-3xl font-light tabular-nums transition-all duration-300",
            isAnimating && "scale-105"
          )}
        >
          {formatDisplayValue()}
          {unit && (
            <span className="text-muted-foreground text-lg ml-1 font-technical">
              {unit}
            </span>
          )}
        </div>

        {/* Trend indicator */}
        {trendDirection && trendDirection !== "neutral" && previousValue && (
          <div
            className={cn(
              "absolute -top-1 -right-1 w-2 h-2 rounded-full transition-all duration-300",
              trendDirection === "up" && "bg-success animate-pulse",
              trendDirection === "down" && "bg-destructive animate-pulse"
            )}
          />
        )}
      </div>

      {/* Label */}
      <div className="tech-label mt-1 group-hover:text-accent transition-colors">
        {label}
      </div>

      {/* Comparison with previous value */}
      {previousValue &&
        typeof value === "number" &&
        typeof previousValue === "number" && (
          <div className="mt-1">
            <div
              className={cn(
                "text-xs font-mono transition-colors",
                value > previousValue && "text-success",
                value < previousValue && "text-destructive",
                value === previousValue && "text-muted-foreground"
              )}
            >
              {value > previousValue && "↗ "}
              {value < previousValue && "↘ "}
              {value === previousValue && "→ "}
              {Math.abs(value - previousValue).toLocaleString()}
            </div>
          </div>
        )}

      {/* Nothing-style subtle glow on hover */}
      <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-accent pointer-events-none" />
    </div>
  );
};
