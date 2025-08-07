/**
 * Enhanced Activity Dashboard - Phase 1.1
 * Nothing-Style Health App - Activity Expansion
 * Displays walking/running detection, distance, calories, floors, active time
 */

import React, { useState, useEffect } from "react";
import {
  Activity,
  Target,
  Zap,
  TrendingUp,
  Clock,
  Mountain,
} from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import {
  EnhancedActivityDetector,
  ActivityData,
  ActivitySession,
  UserProfile,
} from "@/lib/activityDetection";

interface ActivityDashboardProps {
  currentSteps: number;
  motionMagnitude: number;
  elevation?: number;
  userProfile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

const ActivityDashboard: React.FC<ActivityDashboardProps> = ({
  currentSteps,
  motionMagnitude,
  elevation,
  userProfile,
  onProfileUpdate,
}) => {
  const [activityDetector] = useState(
    () => new EnhancedActivityDetector(userProfile)
  );
  const [activityData, setActivityData] = useState<ActivityData>({
    steps: 0,
    distance: 0,
    calories: 0,
    activeMinutes: 0,
    floorsClimbed: 0,
    activityType: "stationary",
    intensity: "light",
    pace: 0,
  });
  const [currentSession, setCurrentSession] = useState<ActivitySession | null>(
    null
  );
  const [showProfile, setShowProfile] = useState(false);

  // Update activity data when new step data comes in
  useEffect(() => {
    const newActivityData = activityDetector.processStepData(
      currentSteps,
      motionMagnitude,
      elevation
    );
    setActivityData(newActivityData);
    setCurrentSession(activityDetector.getCurrentSession());
  }, [currentSteps, motionMagnitude, elevation, activityDetector]);

  // Update user profile in detector when it changes
  useEffect(() => {
    activityDetector.updateUserProfile(userProfile);
  }, [userProfile, activityDetector]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "running":
        return "🏃";
      case "walking":
        return "🚶";
      case "stationary":
        return "⏸️";
      default:
        return "❓";
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "light":
        return "text-muted-foreground";
      case "moderate":
        return "text-accent/70";
      case "vigorous":
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}H ${mins}M` : `${mins}M`;
  };

  const ProfileSetupModal = () => (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
      <div className="glass-medium p-6 max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="tech-label text-accent mb-2">USER PROFILE</div>
          <div className="text-sm text-muted-foreground font-mono">
            Setup for accurate activity tracking
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="tech-label block mb-2">WEIGHT (KG)</label>
              <input
                type="number"
                value={userProfile.weight}
                onChange={(e) =>
                  onProfileUpdate({
                    ...userProfile,
                    weight: parseFloat(e.target.value) || 70,
                  })
                }
                className="input-nothing w-full"
                min="30"
                max="200"
              />
            </div>
            <div>
              <label className="tech-label block mb-2">HEIGHT (CM)</label>
              <input
                type="number"
                value={userProfile.height}
                onChange={(e) =>
                  onProfileUpdate({
                    ...userProfile,
                    height: parseFloat(e.target.value) || 170,
                  })
                }
                className="input-nothing w-full"
                min="120"
                max="220"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="tech-label block mb-2">AGE</label>
              <input
                type="number"
                value={userProfile.age}
                onChange={(e) =>
                  onProfileUpdate({
                    ...userProfile,
                    age: parseInt(e.target.value) || 25,
                  })
                }
                className="input-nothing w-full"
                min="13"
                max="100"
              />
            </div>
            <div>
              <label className="tech-label block mb-2">GENDER</label>
              <select
                value={userProfile.gender}
                onChange={(e) =>
                  onProfileUpdate({
                    ...userProfile,
                    gender: e.target.value as "male" | "female" | "other",
                  })
                }
                className="input-nothing w-full"
              >
                <option value="male">MALE</option>
                <option value="female">FEMALE</option>
                <option value="other">OTHER</option>
              </select>
            </div>
          </div>

          <div>
            <label className="tech-label block mb-2">FITNESS LEVEL</label>
            <select
              value={userProfile.fitnessLevel}
              onChange={(e) =>
                onProfileUpdate({
                  ...userProfile,
                  fitnessLevel: e.target.value as
                    | "beginner"
                    | "intermediate"
                    | "advanced",
                })
              }
              className="input-nothing w-full"
            >
              <option value="beginner">BEGINNER</option>
              <option value="intermediate">INTERMEDIATE</option>
              <option value="advanced">ADVANCED</option>
            </select>
          </div>

          <div>
            <label className="tech-label block mb-2">STRIDE LENGTH (CM)</label>
            <input
              type="number"
              value={userProfile.strideLength}
              onChange={(e) =>
                onProfileUpdate({
                  ...userProfile,
                  strideLength: parseFloat(e.target.value) || 75,
                })
              }
              className="input-nothing w-full"
              min="50"
              max="120"
            />
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              Average: {userProfile.height * 0.43}cm
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowProfile(false)}
            className="btn-nothing primary flex-1"
          >
            SAVE PROFILE
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Activity Status Header */}
      <div className="glass-medium p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="tech-label">CURRENT ACTIVITY</div>
          <button
            onClick={() => setShowProfile(true)}
            className="btn-nothing text-xs px-2 py-1"
          >
            PROFILE
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-2xl">
            {getActivityIcon(activityData.activityType)}
          </div>
          <div className="flex-1">
            <div className="font-display text-lg">
              {activityData.activityType.toUpperCase()}
            </div>
            <div
              className={`text-sm font-mono ${getIntensityColor(
                activityData.intensity
              )}`}
            >
              {activityData.intensity.toUpperCase()} •{" "}
              {Math.round(activityData.pace)} SPM
            </div>
          </div>
          <div className="text-right">
            <div className="tech-label">PACE</div>
            <div className="font-mono text-sm tabular-nums">
              {Math.round(activityData.pace)}
            </div>
          </div>
        </div>

        {/* Current Session Info */}
        {currentSession && (
          <div className="border-t border-border pt-3 mt-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-muted-foreground">SESSION</span>
              <span className="text-muted-foreground">
                {formatTime(currentSession.duration)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div className="text-center">
                <div className="tech-label">STEPS</div>
                <div className="font-mono tabular-nums">
                  {currentSession.steps}
                </div>
              </div>
              <div className="text-center">
                <div className="tech-label">DISTANCE</div>
                <div className="font-mono tabular-nums">
                  {currentSession.distance.toFixed(1)}km
                </div>
              </div>
              <div className="text-center">
                <div className="tech-label">CALORIES</div>
                <div className="font-mono tabular-nums">
                  {currentSession.calories}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Activity Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          icon={<Target className="w-5 h-5" />}
          label="DISTANCE"
          value={activityData.distance.toFixed(1)}
          unit="KM"
          trend={activityData.distance > 0 ? "up" : "neutral"}
        />
        <MetricCard
          icon={<Zap className="w-5 h-5" />}
          label="CALORIES"
          value={activityData.calories}
          unit="KCAL"
          trend={activityData.calories > 0 ? "up" : "neutral"}
        />
        <MetricCard
          icon={<Mountain className="w-5 h-5" />}
          label="FLOORS"
          value={activityData.floorsClimbed}
          unit="FL"
          trend={activityData.floorsClimbed > 0 ? "up" : "neutral"}
        />
        <MetricCard
          icon={<Clock className="w-5 h-5" />}
          label="ACTIVE"
          value={formatTime(activityData.activeMinutes)}
          unit=""
          trend={activityData.activeMinutes > 0 ? "up" : "neutral"}
        />
      </div>

      {/* Activity Intensity Indicator */}
      <div className="glass p-4">
        <div className="tech-label mb-3">ACTIVITY INTENSITY</div>
        <div className="flex items-center space-x-2">
          <div className="flex-1 h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                activityData.intensity === "light"
                  ? "w-1/3 bg-muted-foreground"
                  : activityData.intensity === "moderate"
                  ? "w-2/3 bg-accent/70"
                  : "w-full bg-accent"
              }`}
            />
          </div>
          <div
            className={`text-xs font-mono ${getIntensityColor(
              activityData.intensity
            )}`}
          >
            {activityData.intensity.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 text-xs font-mono text-muted-foreground">
          <div className="text-center">LIGHT</div>
          <div className="text-center">MODERATE</div>
          <div className="text-center">VIGOROUS</div>
        </div>
      </div>

      {/* Activity Type Detection */}
      <div className="glass p-4">
        <div className="tech-label mb-3">MOVEMENT DETECTION</div>
        <div className="grid grid-cols-3 gap-3">
          {(["stationary", "walking", "running"] as const).map((type) => (
            <div
              key={type}
              className={`text-center p-2 border rounded transition-all ${
                activityData.activityType === type
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground"
              }`}
            >
              <div className="text-lg mb-1">{getActivityIcon(type)}</div>
              <div className="text-xs font-mono">{type.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Metrics */}
      <div className="glass p-4">
        <div className="tech-label mb-3">TECHNICAL DATA</div>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <div className="text-muted-foreground">MOTION MAG</div>
            <div className="tabular-nums">{motionMagnitude.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">ELEVATION</div>
            <div className="tabular-nums">
              {elevation ? `${elevation.toFixed(1)}m` : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">STRIDE LEN</div>
            <div className="tabular-nums">{userProfile.strideLength}cm</div>
          </div>
          <div>
            <div className="text-muted-foreground">STEP FREQ</div>
            <div className="tabular-nums">
              {Math.round(activityData.pace)}/min
            </div>
          </div>
        </div>
      </div>

      {/* Profile Setup Modal */}
      {showProfile && <ProfileSetupModal />}
    </div>
  );
};

export default ActivityDashboard;
