/**
 * Automatic Sleep Dashboard - Phase 1.3 Enhanced
 * Nothing-Style Health App - Smart Sleep Detection Interface
 * Continuously monitors and displays sleep status automatically
 */

import React, { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Clock,
  TrendingUp,
  Settings,
  Star,
  Brain,
  Activity,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  sleepTracker,
  SleepStatus,
  SleepData,
  SleepSettings,
} from "../lib/sleepTracker";

interface SleepDashboardProps {}

export const SleepDashboard: React.FC<SleepDashboardProps> = () => {
  const [currentStatus, setCurrentStatus] = useState<SleepStatus | null>(null);
  const [recentSleep, setRecentSleep] = useState<SleepData[]>([]);
  const [settings, setSettings] = useState<SleepSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load initial data
    loadSleepData();

    // Update current status every 30 seconds
    const statusInterval = setInterval(() => {
      const status = sleepTracker.getCurrentStatus();
      setCurrentStatus(status);
    }, 30000);

    // Load data every 5 minutes
    const dataInterval = setInterval(loadSleepData, 5 * 60 * 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(dataInterval);
    };
  }, []);

  const loadSleepData = () => {
    const status = sleepTracker.getCurrentStatus();
    const recent = sleepTracker.getRecentSleepData(7);
    const currentSettings = sleepTracker.getSettings();

    setCurrentStatus(status);
    setRecentSleep(recent);
    setSettings(currentSettings);
  };

  const updateSettings = (newSettings: Partial<SleepSettings>) => {
    sleepTracker.updateSettings(newSettings);
    setSettings(sleepTracker.getSettings());
    setShowSettings(false);
  };

  const formatTime = (date: Date | null): string => {
    if (!date) return "--:--";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStateColor = (state: string): string => {
    switch (state) {
      case "awake":
        return "text-red-400";
      case "falling_asleep":
        return "text-yellow-400";
      case "light_sleep":
        return "text-green-400";
      case "deep_sleep":
        return "text-blue-400";
      case "waking_up":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case "awake":
        return <Sun className="w-5 h-5" />;
      case "falling_asleep":
        return <Moon className="w-5 h-5" />;
      case "light_sleep":
        return <Moon className="w-5 h-5" />;
      case "deep_sleep":
        return <Brain className="w-5 h-5" />;
      case "waking_up":
        return <Sun className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const renderQualityStars = (quality: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= quality
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const calculateSleepDebtTrend = (): number => {
    if (recentSleep.length < 2) return 0;
    const recent = recentSleep.slice(-3);
    const totalDebt = recent.reduce((sum, sleep) => sum + sleep.sleepDebt, 0);
    return totalDebt / recent.length;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg text-white">SMART SLEEP</h1>
          <p className="text-xs text-gray-400">Automatic detection</p>
        </div>
        <Button
          onClick={() => setShowSettings(true)}
          variant="outline"
          size="sm"
          className="glass border-white/10 hover:border-red-500/50"
        >
          <Settings className="w-3 h-3" />
        </Button>
      </div>

      {/* Current Status Card */}
      <div className="glass-medium p-3 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-technical text-white text-sm">CURRENT STATUS</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-technical">
              AUTO MONITORING
            </span>
          </div>
        </div>

        {currentStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sleep State */}
            <div className="text-center">
              <div
                className={`flex items-center justify-center mb-2 ${getStateColor(
                  currentStatus.currentState
                )}`}
              >
                {getStateIcon(currentStatus.currentState)}
                <span className="ml-2 font-technical text-sm">
                  {currentStatus.currentState.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <div className="text-2xl font-display text-white">
                {currentStatus.currentState === "awake" ? "AWAKE" : "SLEEPING"}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Confidence: {Math.round(currentStatus.confidence * 100)}%
              </div>
            </div>

            {/* Sleep Duration */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2 text-blue-400">
                <Clock className="w-5 h-5" />
                <span className="ml-2 font-technical text-sm">DURATION</span>
              </div>
              <div className="text-2xl font-display text-white">
                {currentStatus.minutesAsleep > 0
                  ? formatDuration(currentStatus.minutesAsleep)
                  : "--:--"}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {currentStatus.estimatedSleepTime
                  ? `Since ${formatTime(currentStatus.estimatedSleepTime)}`
                  : "Not sleeping"}
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2 text-yellow-400">
                <Star className="w-5 h-5" />
                <span className="ml-2 font-technical text-sm">QUALITY</span>
              </div>
              <div className="flex justify-center mb-1">
                {renderQualityStars(currentStatus.currentQuality)}
              </div>
              <div className="text-xs text-gray-400">
                {currentStatus.currentState === "awake"
                  ? "Estimated"
                  : "Live tracking"}
              </div>
            </div>
          </div>
        )}

        {!currentStatus && (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">Initializing smart detection...</p>
          </div>
        )}
      </div>

      {/* Sleep History */}
      <div className="glass p-6 border border-white/10">
        <h2 className="font-technical text-white mb-4">
          RECENT SLEEP (7 DAYS)
        </h2>

        {recentSleep.length > 0 ? (
          <div className="space-y-3">
            {recentSleep.map((sleep, index) => (
              <div
                key={sleep.date}
                className="flex items-center justify-between p-3 glass border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <div className="font-technical text-xs text-gray-400">
                      {new Date(sleep.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="font-mono text-sm text-white">
                      {index === 0
                        ? "TODAY"
                        : index === 1
                        ? "YESTERDAY"
                        : new Date(sleep.date)
                            .toLocaleDateString("en-US", { weekday: "short" })
                            .toUpperCase()}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <div className="font-technical text-xs text-gray-400">
                        BEDTIME
                      </div>
                      <div className="font-mono text-sm text-white">
                        {formatTime(sleep.bedtime)}
                      </div>
                    </div>
                    <div>
                      <div className="font-technical text-xs text-gray-400">
                        WAKE
                      </div>
                      <div className="font-mono text-sm text-white">
                        {formatTime(sleep.wakeTime)}
                      </div>
                    </div>
                    <div>
                      <div className="font-technical text-xs text-gray-400">
                        DURATION
                      </div>
                      <div className="font-mono text-sm text-white">
                        {formatDuration(sleep.duration)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {renderQualityStars(sleep.quality)}
                  <div
                    className={`font-technical text-xs px-2 py-1 rounded ${
                      sleep.sleepDebt < 0
                        ? "bg-green-500/20 text-green-400"
                        : sleep.sleepDebt > 60
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {sleep.sleepDebt < 0 ? "+" : ""}
                    {Math.abs(Math.round((sleep.sleepDebt / 60) * 10) / 10)}H
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Moon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">
              No sleep data yet. Sleep tonight to start tracking!
            </p>
          </div>
        )}
      </div>

      {/* Sleep Insights */}
      {recentSleep.length >= 3 && (
        <div className="glass p-6 border border-white/10">
          <h2 className="font-technical text-white mb-4">SMART INSIGHTS</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Average Sleep */}
            <div className="text-center p-4 glass border border-white/5">
              <div className="font-technical text-xs text-gray-400 mb-1">
                AVG DURATION
              </div>
              <div className="font-display text-lg text-white">
                {formatDuration(
                  recentSleep.reduce((sum, s) => sum + s.duration, 0) /
                    recentSleep.length
                )}
              </div>
            </div>

            {/* Consistency Score */}
            <div className="text-center p-4 glass border border-white/5">
              <div className="font-technical text-xs text-gray-400 mb-1">
                CONSISTENCY
              </div>
              <div className="font-display text-lg text-white">
                {(
                  recentSleep.reduce((sum, s) => sum + s.consistency, 0) /
                  recentSleep.length
                ).toFixed(1)}
                /5
              </div>
            </div>

            {/* Sleep Debt Trend */}
            <div className="text-center p-4 glass border border-white/5">
              <div className="font-technical text-xs text-gray-400 mb-1">
                DEBT TREND
              </div>
              <div
                className={`font-display text-lg ${
                  calculateSleepDebtTrend() < 0
                    ? "text-green-400"
                    : calculateSleepDebtTrend() > 30
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {calculateSleepDebtTrend() < 0 ? "+" : ""}
                {Math.round((calculateSleepDebtTrend() / 60) * 10) / 10}H
              </div>
            </div>
          </div>

          {/* Smart Recommendations */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="font-technical text-xs text-blue-400">
                AI RECOMMENDATION
              </span>
            </div>
            <p className="text-sm text-blue-200">
              {calculateSleepDebtTrend() > 60
                ? "You're building sleep debt. Try going to bed 30 minutes earlier tonight."
                : calculateSleepDebtTrend() < -30
                ? "Great sleep consistency! Your body is well-rested."
                : "Your sleep patterns are stable. Keep maintaining your routine."}
            </p>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && settings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-strong p-6 border border-white/20 max-w-md w-full mx-4">
            <h2 className="font-technical text-white mb-4">SLEEP SETTINGS</h2>

            <div className="space-y-4">
              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  TARGET SLEEP DURATION
                </label>
                <input
                  type="range"
                  min="360"
                  max="600"
                  step="30"
                  value={settings.targetSleepDuration}
                  onChange={(e) =>
                    updateSettings({
                      targetSleepDuration: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="text-center text-sm text-white mt-1">
                  {formatDuration(settings.targetSleepDuration)}
                </div>
              </div>

              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  MOTION SENSITIVITY
                </label>
                <select
                  value={settings.motionSensitivity}
                  onChange={(e) =>
                    updateSettings({ motionSensitivity: e.target.value as any })
                  }
                  className="w-full p-2 glass border border-white/10 text-white bg-transparent"
                >
                  <option value="low">Low (Less sensitive)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (More sensitive)</option>
                </select>
              </div>

              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  SMART ALARM WINDOW
                </label>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="15"
                  value={settings.smartAlarmWindow}
                  onChange={(e) =>
                    updateSettings({
                      smartAlarmWindow: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="text-center text-sm text-white mt-1">
                  {settings.smartAlarmWindow} minutes
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                className="flex-1 glass border-white/10"
              >
                CANCEL
              </Button>
              <Button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                SAVE
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SleepDashboard;
