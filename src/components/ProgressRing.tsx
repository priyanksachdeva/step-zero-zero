import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  animated?: boolean;
  showPercentage?: boolean;
  adaptive?: boolean; // new flag
}

export const ProgressRing = ({
  progress,
  size = 200,
  strokeWidth = 8,
  className,
  children,
  animated = true,
  showPercentage = false,
  adaptive = false,
}: ProgressRingProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Animation effect
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  // Goal completion detection
  useEffect(() => {
    if (progress >= 1 && !isComplete) {
      setIsComplete(true);
      // Haptic feedback would go here if available
    } else if (progress < 1 && isComplete) {
      setIsComplete(false);
    }
  }, [progress, isComplete]);

  const dimension = adaptive ? undefined : size;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center transition-nothing",
        adaptive && "w-[clamp(200px,70vw,320px)] h-[clamp(200px,70vw,320px)]",
        className
      )}
      style={!adaptive ? { width: dimension, height: dimension } : undefined}
    >
      {/* Main SVG Ring */}
      <svg
        className={cn(
          "progress-ring transition-nothing",
          isComplete && "animate"
        )}
        width={adaptive ? undefined : size}
        height={adaptive ? undefined : size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Progress ${Math.round(progress * 100)}%`}
      >
        {/* Outer glow ring for achievement */}
        {isComplete && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + strokeWidth / 2}
            fill="transparent"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            className="opacity-30 animate-pulse"
            style={{
              filter: "blur(2px)",
            }}
          />
        )}

        {/* Background ring - segmented for Nothing aesthetic */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="hsl(var(--progress-bg))"
          strokeWidth={strokeWidth}
          strokeDasharray={`${(circumference / 60) * 0.8} ${
            (circumference / 60) * 0.2
          }`}
          className="opacity-25"
        />

        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={isComplete ? "hsl(var(--success))" : "hsl(var(--accent))"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-slow"
          style={{
            filter: `drop-shadow(0 0 ${strokeWidth}px ${
              isComplete
                ? "hsl(var(--success) / 0.4)"
                : "hsl(var(--accent) / 0.3)"
            })`,
          }}
        />

        {/* Progress markers - Nothing style discrete indicators */}
        {Array.from({
          length: Math.min(Math.floor(animatedProgress * 60), 60),
        }).map((_, i) => {
          const angle = (i / 60) * 360 - 90; // Start from top
          const markerRadius = radius - strokeWidth / 4;
          const x = size / 2 + markerRadius * Math.cos((angle * Math.PI) / 180);
          const y = size / 2 + markerRadius * Math.sin((angle * Math.PI) / 180);

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={1}
              fill={isComplete ? "hsl(var(--success))" : "hsl(var(--accent))"}
              className="opacity-60"
            />
          );
        })}

        {/* Achievement celebration ring */}
        {isComplete && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="hsl(var(--success))"
            strokeWidth={strokeWidth / 3}
            className="animate-ping opacity-40"
            style={{
              animationDuration: "2s",
            }}
          />
        )}
      </svg>

      {/* Center content */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {children}
        </div>
      )}

      {/* Percentage indicator - Nothing style */}
      {showPercentage && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="tech-label text-center">
            {Math.round(progress * 100)}%
          </div>
        </div>
      )}

      {/* Goal achievement indicator */}
      {isComplete && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div className="tech-label text-success animate-pulse">COMPLETE</div>
        </div>
      )}
    </div>
  );
};
