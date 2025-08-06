import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export const ProgressRing = ({ 
  progress, 
  size = 200, 
  strokeWidth = 8,
  className,
  children 
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        className="progress-ring"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="hsl(var(--progress-bg))"
          strokeWidth={strokeWidth}
          className="opacity-20"
        />
        
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={progress >= 1 ? "hsl(var(--success))" : "hsl(var(--accent))"}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-slow nothing"
          style={{
            filter: `drop-shadow(0 0 12px ${progress >= 1 ? 'hsl(var(--success) / 0.4)' : 'hsl(var(--accent) / 0.3)'})`
          }}
        />
        
        {/* Goal achievement pulse ring */}
        {progress >= 1 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="hsl(var(--success))"
            strokeWidth={strokeWidth / 2}
            className="animate-pulse-ring opacity-30"
          />
        )}
      </svg>
      
      {/* Center content */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};