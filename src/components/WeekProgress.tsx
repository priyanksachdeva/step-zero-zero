import { cn } from "@/lib/utils";

interface DayProgress {
  day: string;
  steps: number;
  goal: number;
  isToday?: boolean;
}

interface WeekProgressProps {
  weekData: DayProgress[];
  className?: string;
}

export const WeekProgress = ({ weekData, className }: WeekProgressProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="tech-label text-center">
        WEEK PROGRESS
      </div>
      
      <div className="flex justify-center space-x-3">
        {weekData.map((day, index) => {
          const progress = Math.min(day.steps / day.goal, 1);
          const isCompleted = progress >= 1;
          const isToday = day.isToday;
          
          return (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="tech-label text-xs">
                {day.day}
              </div>
              
              <div 
                className={cn(
                  "w-3 h-3 rounded-full border-2 transition-all duration-normal",
                  {
                    "bg-success border-success": isCompleted,
                    "bg-accent border-accent": !isCompleted && progress > 0,
                    "bg-transparent border-muted": progress === 0,
                    "ring-2 ring-accent ring-opacity-50": isToday,
                  }
                )}
                style={{
                  opacity: progress === 0 ? 0.3 : 1
                }}
              />
              
              {isToday && progress > 0 && progress < 1 && (
                <div className="w-1 h-1 bg-accent rounded-full animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};