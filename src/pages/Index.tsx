import { ProgressRing } from "@/components/ProgressRing";
import { StepCounter } from "@/components/StepCounter";
import { MetricCard } from "@/components/MetricCard";
import { WeekProgress } from "@/components/WeekProgress";
import { usePedometer } from "@/hooks/usePedometer";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

const Index = () => {
  const { 
    currentSteps, 
    progress, 
    dailyGoal, 
    distance, 
    calories, 
    activeTime,
    weekData,
    isTracking,
    toggleTracking,
    resetDailySteps
  } = usePedometer();

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  }).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-sm mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="tech-label">STEPS</div>
            <div className="font-mono text-sm text-muted-foreground">{currentDate}</div>
          </div>
          <div className="font-display text-2xl tabular-nums">
            {currentTime}
          </div>
        </div>

        {/* Main Progress Ring */}
        <div className="flex justify-center mb-8">
          <ProgressRing progress={progress} size={240} strokeWidth={12}>
            <StepCounter steps={currentSteps} />
          </ProgressRing>
        </div>

        {/* Goal Display */}
        <div className="text-center mb-8">
          <div className="tech-label mb-2">DAILY GOAL</div>
          <div className="font-display text-xl text-muted-foreground">
            {dailyGoal.toLocaleString()} STEPS
          </div>
          {progress >= 1 && (
            <div className="tech-label text-success mt-2 animate-pulse">
              GOAL ACHIEVED
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <MetricCard 
            value={distance} 
            unit="KM"
            label="DISTANCE" 
          />
          <MetricCard 
            value={calories} 
            label="CALORIES" 
          />
          <MetricCard 
            value={`${Math.floor(activeTime / 60)}H ${activeTime % 60}M`}
            label="ACTIVE" 
          />
        </div>

        {/* Week Progress */}
        <WeekProgress weekData={weekData} className="mb-8" />

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTracking}
            className="glass border-accent/20 hover:border-accent/40"
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetDailySteps}
            className="glass border-muted/20 hover:border-destructive/40"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            RESET
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="flex justify-center mt-6">
          <div className={`flex items-center space-x-2 text-xs ${isTracking ? 'text-success' : 'text-muted-foreground'}`}>
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="tech-label">
              {isTracking ? 'TRACKING ACTIVE' : 'TRACKING PAUSED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
