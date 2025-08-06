import { cn } from "@/lib/utils";
import { useState } from "react";

interface DayProgress {
  day: string;
  steps: number;
  goal: number;
  isToday?: boolean;
}

interface WeekProgressProps {
  weekData: DayProgress[];
  className?: string;
  showDetails?: boolean;
}

export const WeekProgress = ({
  weekData,
  className,
  showDetails = false,
}: WeekProgressProps) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Calculate week statistics
  const totalSteps = weekData.reduce((sum, day) => sum + day.steps, 0);
  const avgSteps = Math.round(totalSteps / weekData.length);
  const goalsAchieved = weekData.filter((day) => day.steps >= day.goal).length;
  const bestDay = weekData.reduce(
    (best, day) => (day.steps > best.steps ? day : best),
    weekData[0]
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="tech-label">WEEK PROGRESS</div>
        <div className="text-xs text-muted-foreground font-mono">
          {goalsAchieved}/7 GOALS • {avgSteps.toLocaleString()} AVG
        </div>
      </div>

      {/* Nothing-style week visualization */}
      <div className="space-y-4">
        {/* Day indicators with progress bars */}
        <div className="grid grid-cols-7 gap-2">
          {weekData.map((day, index) => {
            const progress = Math.min(day.steps / day.goal, 1);
            const isCompleted = progress >= 1;
            const isToday = day.isToday;
            const isSelected = selectedDay === index;

            return (
              <div
                key={index}
                className="flex flex-col items-center space-y-3 cursor-pointer group"
                onClick={() => setSelectedDay(isSelected ? null : index)}
              >
                {/* Day label */}
                <div
                  className={cn(
                    "tech-label text-xs transition-colors",
                    isToday && "text-accent",
                    isSelected && "text-foreground"
                  )}
                >
                  {day.day}
                </div>

                {/* Progress bar - Nothing minimalist style */}
                <div className="relative">
                  <div className="week-bar w-8 h-1">
                    <div
                      className={cn(
                        "week-bar-fill",
                        isCompleted && "bg-success",
                        !isCompleted && progress > 0 && "bg-accent",
                        isToday && "today"
                      )}
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>

                  {/* Today indicator dot */}
                  {isToday && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="status-dot active" />
                    </div>
                  )}
                </div>

                {/* Step count on hover/selection */}
                <div
                  className={cn(
                    "text-xs font-mono text-muted-foreground transition-all duration-200",
                    isSelected || isToday
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-60"
                  )}
                >
                  {day.steps > 0 ? day.steps.toLocaleString() : "—"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected day details */}
        {selectedDay !== null && (
          <div className="glass-medium p-4 rounded-sm border border-accent/20 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="tech-label text-accent">
                {weekData[selectedDay].day}
              </div>
              <div className="font-display text-2xl">
                {weekData[selectedDay].steps.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round(
                  (weekData[selectedDay].steps / weekData[selectedDay].goal) *
                    100
                )}
                % OF GOAL ({weekData[selectedDay].goal.toLocaleString()})
              </div>

              {/* Additional metrics */}
              {weekData[selectedDay].steps > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-muted/20">
                  <div className="text-center">
                    <div className="text-xs tech-label">DISTANCE</div>
                    <div className="font-mono text-sm">
                      {(weekData[selectedDay].steps * 0.0008).toFixed(1)}km
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs tech-label">CALORIES</div>
                    <div className="font-mono text-sm">
                      {Math.round(weekData[selectedDay].steps * 0.04)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Week summary stats */}
      {showDetails && (
        <div className="glass p-4 rounded-sm space-y-3">
          <div className="tech-label text-center">WEEK SUMMARY</div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-display text-lg">
                {totalSteps.toLocaleString()}
              </div>
              <div className="tech-label">TOTAL</div>
            </div>
            <div>
              <div className="font-display text-lg">
                {avgSteps.toLocaleString()}
              </div>
              <div className="tech-label">AVERAGE</div>
            </div>
            <div>
              <div className="font-display text-lg">
                {bestDay.steps.toLocaleString()}
              </div>
              <div className="tech-label">BEST DAY</div>
            </div>
          </div>

          {/* Streak indicator */}
          <div className="flex justify-center pt-2">
            <div className="text-xs text-muted-foreground">
              {goalsAchieved === 7
                ? "🔥 PERFECT WEEK!"
                : goalsAchieved >= 5
                ? "💪 STRONG WEEK"
                : goalsAchieved >= 3
                ? "📈 BUILDING MOMENTUM"
                : "🎯 ROOM TO IMPROVE"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
