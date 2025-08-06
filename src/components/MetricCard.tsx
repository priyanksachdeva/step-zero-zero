import { cn } from "@/lib/utils";

interface MetricCardProps {
  value: string | number;
  label: string;
  unit?: string;
  className?: string;
}

export const MetricCard = ({ value, label, unit, className }: MetricCardProps) => {
  return (
    <div className={cn("metric-card", className)}>
      <div className="font-display text-2xl md:text-3xl font-light tabular-nums">
        {value}
        {unit && <span className="text-muted-foreground text-lg ml-1">{unit}</span>}
      </div>
      <div className="tech-label mt-1">
        {label}
      </div>
    </div>
  );
};