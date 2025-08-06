import { ProgressRing } from "@/components/ProgressRing";
import { StepCounter } from "@/components/StepCounter";
import { MetricCard } from "@/components/MetricCard";
import { WeekProgress } from "@/components/WeekProgress";
import { SettingsPanel } from "@/components/SettingsPanel";
import { usePedometer } from "@/hooks/usePedometer";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  AlertTriangle,
  Activity,
  Target,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";

const Index = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [previousSteps, setPreviousSteps] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState<
    "morning" | "afternoon" | "evening" | "night"
  >("morning");

  const {
    currentSteps,
    progress,
    dailyGoal,
    distance,
    calories,
    activeTime,
    weekData,
    isTracking,
    sensorSupported,
    permissionGranted,
    batteryOptimized,
    settings,
    toggleTracking,
    resetDailySteps,
    updateSettings,
    exportData,
    importData,
  } = usePedometer();

  // Track previous steps for trend indicators
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviousSteps(currentSteps);
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentSteps]);

  // Determine time of day for contextual UI
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6) setTimeOfDay("night");
    else if (hour < 12) setTimeOfDay("morning");
    else if (hour < 18) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");
  }, []);

  if (showSettings) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-sm mx-auto px-6 py-4">
          <Button
            onClick={() => setShowSettings(false)}
            variant="ghost"
            size="sm"
            className="mb-4 btn-nothing"
          >
            ← BACK
          </Button>
        </div>
        <SettingsPanel
          settings={settings}
          onSettingsChange={updateSettings}
          onExportData={exportData}
          onImportData={importData}
          batteryOptimized={batteryOptimized}
          sensorSupported={sensorSupported}
        />
      </div>
    );
  }

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const currentDate = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  // Get motivational message based on progress and time
  const getMotivationalMessage = () => {
    if (progress >= 1) return "GOAL ACHIEVED";
    if (progress >= 0.8) return "ALMOST THERE";
    if (progress >= 0.5) return "HALFWAY POINT";
    if (timeOfDay === "morning" && progress < 0.1) return "START STRONG";
    if (timeOfDay === "evening" && progress < 0.3) return "EVENING PUSH";
    return "KEEP MOVING";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-sm mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Header with Nothing precision */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="tech-label text-accent">STEPS</div>
            <div className="font-mono text-sm text-muted-foreground tabular-nums">
              {currentDate}
            </div>
            <div className="text-xs text-muted-foreground/70 font-mono">
              {getMotivationalMessage()}
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="font-display text-2xl tabular-nums">
              {currentTime}
            </div>
            <Button
              onClick={() => setShowSettings(true)}
              variant="ghost"
              size="sm"
              className="p-2 btn-nothing"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sensor Status Alert with Nothing styling */}
        {sensorSupported === false && (
          <div className="glass-medium p-4 rounded-sm border border-muted/20 animate-fade-in">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="space-y-1">
                <div className="tech-label text-muted-foreground">
                  MANUAL MODE ACTIVE
                </div>
                <div className="text-xs text-muted-foreground/70">
                  Motion sensors unavailable. Use manual step entry.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Progress Ring with Nothing aesthetics */}
        <div className="flex justify-center p-8">
          <ProgressRing
            progress={progress}
            size={280}
            strokeWidth={14}
            animated={true}
            className="transition-nothing"
          >
            <StepCounter
              steps={currentSteps}
              size="large"
              showAnimation={true}
            />
          </ProgressRing>
        </div>

        {/* Goal Status with precision */}
        <div className="text-center space-y-2">
          <div className="tech-label">DAILY TARGET</div>
          <div className="font-display text-xl text-muted-foreground tabular-nums">
            {dailyGoal.toLocaleString()} STEPS
          </div>
          <div className="flex justify-center items-center space-x-2 text-xs">
            <div
              className={`status-dot ${progress >= 1 ? "active" : "inactive"}`}
            />
            <span className="font-mono text-muted-foreground/70">
              {Math.round(progress * 100)}% COMPLETE
            </span>
          </div>
        </div>

        {/* Enhanced Metrics Grid with Nothing precision */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            value={distance}
            unit="KM"
            label="DISTANCE"
            previousValue={
              previousSteps > 0
                ? (previousSteps * 0.0008).toFixed(1)
                : undefined
            }
            icon={<Target className="w-4 h-4" />}
            precision={1}
          />
          <MetricCard
            value={calories}
            label="CALORIES"
            previousValue={
              previousSteps > 0 ? Math.floor(previousSteps * 0.04) : undefined
            }
            icon={<Zap className="w-4 h-4" />}
          />
          <MetricCard
            value={`${Math.floor(activeTime / 60)}H ${activeTime % 60}M`}
            label="ACTIVE"
            icon={<Activity className="w-4 h-4" />}
          />
        </div>

        {/* Enhanced Week Progress */}
        <WeekProgress
          weekData={weekData}
          showDetails={false}
          className="transition-nothing"
        />

        {/* Nothing-style Controls */}
        <div className="flex justify-center space-x-3">
          <Button
            onClick={toggleTracking}
            disabled={sensorSupported === false}
            className={`btn-nothing ${
              isTracking ? "primary" : ""
            } min-w-[100px]`}
          >
            {isTracking ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                PAUSE
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                START
              </>
            )}
          </Button>

          <Button onClick={resetDailySteps} className="btn-nothing">
            <RotateCcw className="w-4 h-4 mr-2" />
            RESET
          </Button>
        </div>

        {/* Enhanced Status Indicator */}
        <div className="flex justify-center">
          <div
            className={`flex items-center space-x-3 glass p-3 rounded-sm border ${
              isTracking ? "border-success/20" : "border-muted/20"
            }`}
          >
            <div
              className={`status-dot ${isTracking ? "active" : "inactive"}`}
            />
            <div className="space-y-0.5">
              <div className="tech-label text-xs">
                {sensorSupported === false
                  ? "MANUAL MODE"
                  : isTracking
                  ? "TRACKING ACTIVE"
                  : "TRACKING PAUSED"}
              </div>
              {batteryOptimized && isTracking && (
                <div className="text-xs text-success/70 font-mono">
                  BATTERY OPTIMIZED
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Manual Step Entry for devices without sensors */}
        {sensorSupported === false && (
          <div className="flex justify-center">
            <Button
              onClick={() => {
                const steps = prompt("Enter step count:");
                if (steps && !isNaN(Number(steps))) {
                  // Manual step entry would be implemented here
                  console.log("Manual step entry:", steps);
                }
              }}
              className="btn-nothing primary"
            >
              ADD STEPS MANUALLY
            </Button>
          </div>
        )}

        {/* Nothing-style footer info */}
        <div className="text-center pt-4">
          <div className="text-xs text-muted-foreground/50 font-mono space-y-1">
            <div>ALL DATA STORED LOCALLY</div>
            <div>TAP SETTINGS TO EXPORT BACKUP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
