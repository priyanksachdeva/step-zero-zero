import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MetricCard } from "@/components/MetricCard";
import { Target, Zap, Activity } from "@/components/icons/NothingIcon";

interface MetricsGridProps {
  distanceKm: number;
  calories: number;
  activeMinutes: number; // total active minutes today
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  distanceKm,
  calories,
  activeMinutes,
}) => {
  const distancePrev = distanceKm * 0.9;
  const caloriesPrev = calories * 0.85;
  const activePrev = activeMinutes * 0.8;

  return (
    <div
      className="grid gap-3 sm:gap-4 grid-cols-3 xs:grid-cols-4 [@media(min-width:480px)]:grid-cols-4 md:grid-cols-6 auto-rows-fr"
      aria-label="Daily summary metrics"
      role="group"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <MetricCard
              icon={<Target className="w-5 h-5" />}
              label="DISTANCE"
              value={distanceKm}
              unit="KM"
              previousValue={distancePrev}
              trend={distanceKm > distancePrev ? "up" : "neutral"}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Total distance walked today</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <MetricCard
              icon={<Zap className="w-5 h-5" />}
              label="CALORIES"
              value={calories}
              unit="CAL"
              previousValue={caloriesPrev}
              trend={calories > caloriesPrev ? "up" : "neutral"}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Calories burned through walking</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <MetricCard
              icon={<Activity className="w-5 h-5" />}
              label="ACTIVE"
              value={`${Math.floor(activeMinutes / 60)}H ${
                activeMinutes % 60
              }M`}
              unit=""
              previousValue={`${Math.floor(activePrev / 60)}H`}
              trend={activeMinutes > activePrev ? "up" : "neutral"}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Active time spent walking</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
