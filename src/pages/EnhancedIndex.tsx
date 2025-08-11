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
import ActivityDashboard from "@/components/ActivityDashboard";
import HeartRateDashboard from "@/components/HeartRateDashboard";
import SleepDashboard from "@/components/SleepDashboard";
import StressWellnessDashboard from "@/components/StressWellnessDashboard";
import HydrationDashboard from "@/components/HydrationDashboard";
import NutritionDashboard from "@/components/NutritionDashboard";
import PWAInstallButton from "@/components/PWAInstallButton";
import { DebugPanel } from "@/components/DebugPanel";
import { usePedometer } from "@/hooks/usePedometer";
import { useClock } from "@/hooks/useClock";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  TrendingUp,
  Moon,
  Brain,
  Droplets,
  Apple,
  User,
  CheckCircle,
  Info,
} from "@/components/icons/NothingIcon";
import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/healthInsights";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav, MainTab } from "@/components/layout/BottomNav";
import { SettingsOverlay } from "@/components/layout/SettingsOverlay";
import { MetricsGrid } from "@/components/MetricsGrid";
import { HomeTab } from "@/components/tabs/HomeTab";
import { getMotivationalMessage } from "@/lib/motivation";

type TabType = "home" | "health" | "insights" | "profile";

type HealthSubTab = "body" | "wellness" | "activity";

const EnhancedIndex = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [activeHealthSubTab, setActiveHealthSubTab] =
    useState<HealthSubTab>("body");
  const [previousSteps, setPreviousSteps] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>();
  const [userAge, setUserAge] = useState(25);
  const [activityProfile, setActivityProfile] = useState({
    weight: 70,
    height: 170,
    age: 25,
    gender: "male" as const,
    fitnessLevel: "intermediate" as const,
    strideLength: 75,
  });
  const {
    dateLabel: currentDate,
    timeLabel: currentTime,
    timeOfDay,
  } = useClock();

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

  // Load user profiles from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    }

    const savedActivityProfile = localStorage.getItem("activityProfile");
    if (savedActivityProfile) {
      try {
        setActivityProfile(JSON.parse(savedActivityProfile));
      } catch (error) {
        console.error("Failed to load activity profile:", error);
      }
    }

    const savedAge = localStorage.getItem("userAge");
    if (savedAge) {
      setUserAge(parseInt(savedAge) || 25);
    }
  }, []);

  const handleProfileUpdate = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem("userProfile", JSON.stringify(profile));
  };

  const handleActivityProfileUpdate = (profile: typeof activityProfile) => {
    setActivityProfile(profile);
    localStorage.setItem("activityProfile", JSON.stringify(profile));
  };

  const handleUserAgeUpdate = (age: number) => {
    setUserAge(age);
    localStorage.setItem("userAge", age.toString());
  };

  const handleGoalUpdate = (newGoal: number) => {
    updateSettings({ dailyGoal: newGoal });
  };

  const motivational = getMotivationalMessage(progress, timeOfDay);

  const TabButton = ({
    id,
    label,
    icon: Icon,
    isActive,
  }: {
    id: TabType;
    label: string;
    icon: any;
    isActive: boolean;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => setActiveTab(id)}
          aria-label={`Switch to ${label.toLowerCase()} tab`}
          className={`flex flex-col items-center justify-center p-2 transition-all duration-200 rounded-sm relative ${
            isActive
              ? "text-accent bg-accent/10 scale-105"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Icon
            className={`w-4 h-4 mb-1 transition-transform duration-200 ${
              isActive ? "scale-110" : ""
            }`}
          />
          <span className="tech-label text-[10px] leading-none">{label}</span>
          {isActive && (
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs capitalize">{label.toLowerCase()}</p>
      </TooltipContent>
    </Tooltip>
  );

  const renderHealthSubTabs = () => (
    <div className="mb-3">
      <Card className="p-1 border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="flex rounded-sm">
          <button
            onClick={() => setActiveHealthSubTab("body")}
            aria-label="Switch to body health metrics"
            className={`flex-1 py-2 px-3 rounded-sm text-[10px] font-technical transition-all duration-200 ${
              activeHealthSubTab === "body"
                ? "bg-accent text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/30"
            }`}
          >
            <Heart className="w-3 h-3 mx-auto mb-1" />
            BODY
          </button>
          <button
            onClick={() => setActiveHealthSubTab("wellness")}
            aria-label="Switch to wellness metrics"
            className={`flex-1 py-2 px-3 rounded-sm text-[10px] font-technical transition-all duration-200 ${
              activeHealthSubTab === "wellness"
                ? "bg-accent text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/30"
            }`}
          >
            <Brain className="w-3 h-3 mx-auto mb-1" />
            WELLNESS
          </button>
          <button
            onClick={() => setActiveHealthSubTab("activity")}
            aria-label="Switch to activity metrics"
            className={`flex-1 py-2 px-3 rounded-sm text-[10px] font-technical transition-all duration-200 ${
              activeHealthSubTab === "activity"
                ? "bg-accent text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/30"
            }`}
          >
            <Activity className="w-3 h-3 mx-auto mb-1" />
            ACTIVITY
          </button>
        </div>
      </Card>
    </div>
  );
  const renderHealthTabContent = () => {
    switch (activeHealthSubTab) {
      case "body":
        return (
          <div className="space-y-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="tech-label text-accent text-xs flex items-center gap-2">
                    <Heart className="w-3 h-3" />
                    HEART RATE
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        aria-label="Heart rate monitoring information"
                        className="focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
                      >
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Real-time heart rate monitoring</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <HeartRateDashboard
                  userAge={userAge}
                  onUserAgeUpdate={handleUserAgeUpdate}
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="tech-label text-accent text-xs flex items-center gap-2">
                    <Moon className="w-3 h-3" />
                    SLEEP TRACKING
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    BETA
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <SleepDashboard />
              </CardContent>
            </Card>
          </div>
        );

      case "wellness":
        return (
          <div className="space-y-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="tech-label text-accent text-xs flex items-center gap-2">
                  <Brain className="w-3 h-3" />
                  STRESS & MINDFULNESS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <StressWellnessDashboard />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="tech-label text-accent text-xs flex items-center gap-2">
                  <Droplets className="w-3 h-3" />
                  HYDRATION
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground">
                  Daily water intake tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <HydrationDashboard />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="tech-label text-accent text-xs flex items-center gap-2">
                  <Apple className="w-3 h-3" />
                  NUTRITION
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <NutritionDashboard />
              </CardContent>
            </Card>
          </div>
        );

      case "activity":
        return (
          <div className="space-y-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="tech-label text-accent text-xs flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  ACTIVITY METRICS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ActivityDashboard
                  currentSteps={currentSteps}
                  motionMagnitude={1.5}
                  elevation={undefined}
                  userProfile={activityProfile}
                  onProfileUpdate={handleActivityProfileUpdate}
                />
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "health":
        return (
          <div className="space-y-4">
            {renderHealthSubTabs()}
            {renderHealthTabContent()}
          </div>
        );

      case "insights":
        return (
          <div className="space-y-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="tech-label text-accent text-xs flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" />
                  ANALYTICS DASHBOARD
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground">
                  Track your daily progress and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <AnalyticsDashboard
                  currentSteps={currentSteps}
                  dailyGoal={dailyGoal}
                  onGoalUpdate={handleGoalUpdate}
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="tech-label text-accent text-xs flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    HEALTH INSIGHTS
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    AI POWERED
                  </Badge>
                </div>
                <CardDescription className="text-[10px] text-muted-foreground">
                  Personalized health recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <HealthInsights
                  currentSteps={currentSteps}
                  currentDistance={parseFloat(distance)}
                  currentCalories={calories}
                  userProfile={userProfile}
                  onProfileUpdate={handleProfileUpdate}
                />
              </CardContent>
            </Card>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="tech-label text-accent text-xs flex items-center gap-2">
                  <User className="w-3 h-3" />
                  USER PROFILE
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground">
                  Personal settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 rounded border border-border/30 bg-background/50">
                      <div className="text-xs text-muted-foreground font-mono mb-1">
                        AGE
                      </div>
                      <div className="font-technical text-base flex items-center gap-1">
                        {userAge}
                        <Badge
                          variant="outline"
                          className="text-[8px] px-1 py-0"
                        >
                          YRS
                        </Badge>
                      </div>
                    </div>
                    <div className="p-2 rounded border border-border/30 bg-background/50">
                      <div className="text-xs text-muted-foreground font-mono mb-1">
                        DAILY GOAL
                      </div>
                      <div className="font-technical text-base flex items-center gap-1">
                        {dailyGoal.toLocaleString()}
                        <Badge
                          variant="outline"
                          className="text-[8px] px-1 py-0"
                        >
                          STEPS
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Daily Progress
                      </span>
                      <span className="font-mono">
                        {Math.round(progress * 100)}%
                      </span>
                    </div>
                    <Progress value={progress * 100} className="h-1" />
                  </div>

                  <Button
                    onClick={() => setShowSettings(true)}
                    className="w-full btn-nothing primary text-sm py-2 mt-3"
                  >
                    <Settings className="w-3 h-3 mr-2" />
                    CONFIGURE SETTINGS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <HomeTab
            sensorSupported={sensorSupported}
            permissionGranted={permissionGranted}
            progress={progress}
            currentSteps={currentSteps}
            previousSteps={previousSteps}
            dailyGoal={dailyGoal}
            distance={distance}
            calories={calories}
            activeTime={activeTime}
            weekData={weekData}
            isTracking={isTracking}
            batteryOptimized={batteryOptimized}
            toggleTracking={toggleTracking}
            resetDailySteps={resetDailySteps}
            openSettings={() => setShowSettings(true)}
            motivational={motivational}
            currentDate={currentDate}
            currentTime={currentTime}
          />
        );
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <PWAInstallButton />
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto px-2 sm:px-4">
          <AppHeader
            currentDate={currentDate}
            currentTime={currentTime}
            onOpenSettings={() => setShowSettings(true)}
          />
          <div className="px-3 py-3 pb-20 min-h-[calc(100vh-120px)] overflow-y-auto">
            {renderTabContent()}
          </div>
          <BottomNav
            active={activeTab as MainTab}
            onChange={(t) => setActiveTab(t as TabType)}
          />
          <SettingsOverlay
            open={showSettings}
            onClose={() => setShowSettings(false)}
            settings={settings}
            onSettingsChange={updateSettings}
            onExportData={exportData}
            onImportData={importData}
            batteryOptimized={batteryOptimized}
            sensorSupported={sensorSupported || false}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EnhancedIndex;
