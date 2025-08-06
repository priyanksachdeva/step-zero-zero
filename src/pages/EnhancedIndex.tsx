/**
 * Enhanced Index Page - Phase 3 Integration
 * Main interface with tabs for Analytics and Health Insights
 */

import { ProgressRing } from "@/components/ProgressRing";
import { StepCounter } from "@/components/StepCounter";
import { MetricCard } from "@/components/MetricCard";
import { WeekProgress } from "@/components/WeekProgress";
import { SettingsPanel } from "@/components/SettingsPanel";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import HealthInsights from "@/components/HealthInsights";
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
  BarChart3,
  Heart,
  Home,
} from "lucide-react";
import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/healthInsights";

type TabType = 'home' | 'analytics' | 'health';

const EnhancedIndex = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [previousSteps, setPreviousSteps] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>();
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
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentSteps]);

  // Determine time of day for contextual messaging
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6) setTimeOfDay("night");
    else if (hour < 12) setTimeOfDay("morning");
    else if (hour < 18) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");
  }, []);

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    }
  }, []);

  const handleProfileUpdate = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const handleGoalUpdate = (newGoal: number) => {
    updateSettings({ dailyGoal: newGoal });
  };

  const currentDate = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).toUpperCase();

  const currentTime = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const getMotivationalMessage = () => {
    const progressPercent = Math.round(progress * 100);
    
    if (progressPercent === 0) {
      return timeOfDay === "morning" ? "Ready to start your day?" : "Time to get moving";
    } else if (progressPercent < 25) {
      return "Every step counts";
    } else if (progressPercent < 50) {
      return "Building momentum";
    } else if (progressPercent < 75) {
      return "Over halfway there";
    } else if (progressPercent < 100) {
      return "Almost at your goal";
    } else {
      return "Goal achieved! 🎯";
    }
  };

  const TabButton = ({ id, label, icon: Icon, isActive }: {
    id: TabType;
    label: string;
    icon: any;
    isActive: boolean;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex flex-col items-center space-y-1 p-3 transition-nothing ${
        isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="tech-label text-xs">{label}</span>
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <AnalyticsDashboard
            currentSteps={currentSteps}
            dailyGoal={dailyGoal}
            onGoalUpdate={handleGoalUpdate}
          />
        );
      
      case 'health':
        return (
          <HealthInsights
            currentSteps={currentSteps}
            currentDistance={parseFloat(distance)}
            currentCalories={calories}
            userProfile={userProfile}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      
      default:
        return (
          <div className="space-y-6">
            {/* Sensor Status Alert with Nothing styling */}
            {(!sensorSupported || !permissionGranted) && (
              <div className="glass-medium border-destructive/20 p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div className="flex-1">
                    <div className="font-technical text-sm text-destructive">
                      {!sensorSupported ? "SENSOR NOT SUPPORTED" : "PERMISSION REQUIRED"}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {!sensorSupported 
                        ? "Device motion sensors not available"
                        : "Grant motion sensor access to track steps"
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Progress Ring with Nothing aesthetics */}
            <div className="relative flex justify-center">
              <ProgressRing
                progress={progress}
                size={280}
                strokeWidth={3}
                className="transition-nothing"
              >
                <StepCounter 
                  steps={currentSteps} 
                  size="large"
                  showAnimation={currentSteps > previousSteps}
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
                <div className={`status-dot ${progress >= 1 ? 'active' : 'inactive'}`} />
                <span className="font-mono text-muted-foreground/70">
                  {Math.round(progress * 100)}% COMPLETE
                </span>
              </div>
            </div>

            {/* Enhanced Metrics Grid with Nothing precision */}
            <div className="grid grid-cols-3 gap-4">
              <MetricCard
                icon={<Target className="w-5 h-5" />}
                label="DISTANCE"
                value={parseFloat(distance)}
                unit="KM"
                previousValue={parseFloat(distance) * 0.9} // Simulated previous value
                trend={parseFloat(distance) > parseFloat(distance) * 0.9 ? "up" : "neutral"}
              />
              <MetricCard
                icon={<Zap className="w-5 h-5" />}
                label="CALORIES"
                value={calories}
                unit="CAL"
                previousValue={calories * 0.85}
                trend={calories > calories * 0.85 ? "up" : "neutral"}
              />
              <MetricCard
                icon={<Activity className="w-5 h-5" />}
                label="ACTIVE"
                value={`${Math.floor(activeTime / 60)}H ${activeTime % 60}M`}
                unit=""
                previousValue={`${Math.floor(activeTime / 60) * 0.8}H`}
                trend={activeTime > activeTime * 0.8 ? "up" : "neutral"}
              />
            </div>

            {/* Enhanced Week Progress */}
            <WeekProgress
              weekData={weekData}
              className="transition-nothing"
            />

            {/* Nothing-style Controls */}
            <div className="flex space-x-3">
              <Button
                onClick={toggleTracking}
                className={`btn-nothing ${
                  isTracking ? 'primary' : ''
                } flex-1 flex items-center justify-center space-x-2`}
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
                className="btn-nothing"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Status indicators with enhanced info */}
            {batteryOptimized && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 glass px-3 py-1">
                  <div className="status-dot active" />
                  <div className="text-xs text-success/70 font-mono">
                    BATTERY OPTIMIZED
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced motivational messaging */}
            <div className="text-center space-y-2">
              <div className="text-xs text-muted-foreground/50 font-mono">
                {getMotivationalMessage()}
              </div>
              <Button
                onClick={() => setShowSettings(true)}
                variant="ghost"
                size="sm"
                className="btn-nothing primary"
              >
                <Settings className="w-4 h-4 mr-2" />
                SETTINGS
              </Button>
            </div>

            {/* Nothing-style footer info */}
            <div className="text-center">
              <div className="text-xs text-muted-foreground/50 font-mono space-y-1">
                <div>{currentDate} • {currentTime}</div>
                <div>STEPS TODAY • PHASE 3 ENHANCED</div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 max-w-md mx-auto">
      {/* Enhanced Header with Nothing precision */}
      <div className="mb-6">
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
      </div>

      {/* Tab Content */}
      <div className="mb-20">
        {renderTabContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-md mx-auto flex">
          <TabButton
            id="home"
            label="HOME"
            icon={Home}
            isActive={activeTab === 'home'}
          />
          <TabButton
            id="analytics"
            label="ANALYTICS"
            icon={BarChart3}
            isActive={activeTab === 'analytics'}
          />
          <TabButton
            id="health"
            label="HEALTH"
            icon={Heart}
            isActive={activeTab === 'health'}
          />
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 p-4">
          <div className="max-w-md mx-auto">
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
            onImportData={(data) => {
              try {
                const result = importData(data);
                return typeof result === 'boolean' ? result : false;
              } catch {
                return false;
              }
            }}
            batteryOptimized={batteryOptimized}
            sensorSupported={sensorSupported}
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedIndex;
