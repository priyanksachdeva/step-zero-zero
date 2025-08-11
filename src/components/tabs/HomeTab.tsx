import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  RotateCcw,
} from "@/components/icons/NothingIcon";
import { ProgressRing } from "@/components/ProgressRing";
import { StepCounter } from "@/components/StepCounter";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WeekProgress } from "@/components/WeekProgress";
import { DebugPanel } from "@/components/DebugPanel";
import { Separator } from "@/components/ui/separator";
import { MetricsGrid } from "@/components/MetricsGrid";

interface HomeTabProps {
  sensorSupported: boolean | null;
  permissionGranted: boolean;
  progress: number;
  currentSteps: number;
  previousSteps: number;
  dailyGoal: number;
  distance: string;
  calories: number;
  activeTime: number; // minutes
  weekData: any[];
  isTracking: boolean;
  batteryOptimized: boolean;
  toggleTracking: () => void;
  resetDailySteps: () => void;
  openSettings: () => void;
  motivational: string;
  currentDate: string;
  currentTime: string;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  sensorSupported,
  permissionGranted,
  progress,
  currentSteps,
  previousSteps,
  dailyGoal,
  distance,
  calories,
  activeTime,
  weekData,
  isTracking,
  batteryOptimized,
  toggleTracking,
  resetDailySteps,
  openSettings,
  motivational,
  currentDate,
  currentTime,
}) => {
  return (
    <div className="space-y-6">
      {(!sensorSupported || !permissionGranted) && (
        <Alert className="border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-technical text-sm">
            {!sensorSupported ? "SENSOR NOT SUPPORTED" : "PERMISSION REQUIRED"}
          </AlertTitle>
          <AlertDescription className="text-xs font-mono">
            {!sensorSupported
              ? "Device motion sensors not available"
              : "Grant motion sensor access to track steps"}
          </AlertDescription>
        </Alert>
      )}

      <div className="relative flex justify-center">
        <ProgressRing
          progress={progress}
          size={280}
          strokeWidth={3}
          className="transition-nothing"
          adaptive
        >
          <StepCounter
            steps={currentSteps}
            size="large"
            showAnimation={currentSteps > previousSteps}
          />
        </ProgressRing>
      </div>

      <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
        <CardContent className="pt-4 text-center">
          <div className="space-y-2">
            <div className="tech-label">DAILY TARGET</div>
            <div className="font-display text-xl text-muted-foreground tabular-nums">
              {dailyGoal.toLocaleString()} STEPS
            </div>
            <div className="flex justify-center items-center space-x-2">
              <Progress value={progress * 100} className="w-24 h-1" />
              <span className="font-mono text-xs text-muted-foreground/70">
                {Math.round(progress * 100)}%
              </span>
              {progress >= 1 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1 py-0 bg-success/20 text-success"
                >
                  <CheckCircle className="w-2 h-2 mr-1" />
                  GOAL REACHED
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <MetricsGrid
        distanceKm={parseFloat(distance)}
        calories={calories}
        activeMinutes={activeTime}
      />

      <WeekProgress weekData={weekData} className="transition-nothing" />

      <div className="flex space-x-3">
        <Button
          onClick={toggleTracking}
          className={`btn-nothing ${
            isTracking ? "primary" : ""
          } flex-1 flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105`}
        >
          {isTracking ? (
            <>
              <Pause className="w-4 h-4" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>START</span>
            </>
          )}
        </Button>
        <Button
          onClick={resetDailySteps}
          variant="outline"
          aria-label="Reset daily step count"
          className="btn-nothing transition-all duration-200 hover:scale-105"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {batteryOptimized && (
        <div className="text-center">
          <Badge
            variant="secondary"
            className="text-xs px-2 py-1 bg-success/20 text-success"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            BATTERY OPTIMIZED
          </Badge>
        </div>
      )}

      <Card className="border-border/20 bg-card/20 backdrop-blur-sm">
        <CardContent className="pt-4 text-center space-y-2">
          <div className="text-xs text-muted-foreground/50 font-mono">
            {motivational}
          </div>
          <Button
            onClick={openSettings}
            variant="ghost"
            size="sm"
            className="btn-nothing primary transition-all duration-200 hover:scale-105"
          >
            <Settings className="w-4 h-4 mr-2" />
            SETTINGS
          </Button>
        </CardContent>
      </Card>

      <div className="text-center">
        <div className="text-xs text-muted-foreground/50 font-mono space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span>{currentDate}</span>
            <Separator orientation="vertical" className="h-3" />
            <span>{currentTime}</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <span>STEPS TODAY</span>
            <Badge variant="outline" className="text-[8px] px-1 py-0">
              PHASE 3
            </Badge>
          </div>
        </div>
      </div>

      <DebugPanel />
    </div>
  );
};
