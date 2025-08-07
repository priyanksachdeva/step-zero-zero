/**
 * Stress & Wellness Dashboard - Phase 2.1
 * Nothing-Style Health App - Mental Wellness Interface
 * Mood tracking, stress monitoring, and guided breathing exercises
 */

import React, { useState, useEffect } from "react";
import {
  Brain,
  Heart,
  Wind,
  TrendingUp,
  Settings,
  Plus,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Smile,
  Frown,
  Meh,
  Zap,
  Moon,
  Sun,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  stressWellnessTracker,
  MoodEntry,
  StressData,
  BreathingSession,
  WellnessSettings,
} from "@/lib/stressWellnessTracker";

interface StressWellnessDashboardProps {}

export const StressWellnessDashboard: React.FC<
  StressWellnessDashboardProps
> = () => {
  const [currentStress, setCurrentStress] = useState<number>(5);
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [recentStress, setRecentStress] = useState<StressData[]>([]);
  const [breathingSessions, setBreathingSessions] = useState<
    BreathingSession[]
  >([]);
  const [settings, setSettings] = useState<WellnessSettings | null>(null);
  const [showMoodEntry, setShowMoodEntry] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeBreathing, setActiveBreathing] = useState<string | null>(null);

  // Mood entry form state
  const [moodForm, setMoodForm] = useState({
    mood: 5,
    energy: 5,
    stress: 5,
    anxiety: 5,
    notes: "",
    triggers: [] as string[],
    activities: [] as string[],
  });

  // Breathing exercise state
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<
    "inhale" | "hold" | "exhale" | "pause"
  >("inhale");

  useEffect(() => {
    loadWellnessData();

    // Update data every 2 minutes
    const interval = setInterval(loadWellnessData, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadWellnessData = () => {
    const stress = stressWellnessTracker.getCurrentStressLevel();
    const moods = stressWellnessTracker.getRecentMoodEntries(7);
    const stressData = stressWellnessTracker.getRecentStressData(24);
    const sessions = stressWellnessTracker.getBreathingSessions(7);
    const currentSettings = stressWellnessTracker.getSettings();

    setCurrentStress(stress);
    setRecentMoods(moods);
    setRecentStress(stressData);
    setBreathingSessions(sessions);
    setSettings(currentSettings);
  };

  const submitMoodEntry = () => {
    stressWellnessTracker.logMoodEntry(moodForm);
    setShowMoodEntry(false);
    setMoodForm({
      mood: 5,
      energy: 5,
      stress: 5,
      anxiety: 5,
      notes: "",
      triggers: [],
      activities: [],
    });
    loadWellnessData();
  };

  const startBreathingExercise = (
    type: BreathingSession["type"],
    duration: number
  ) => {
    const sessionId = stressWellnessTracker.startBreathingSession(
      type,
      duration
    );
    setActiveBreathing(sessionId);
    setBreathingTimer(duration * 60); // Convert to seconds
    setShowBreathing(false);

    // Start breathing timer
    const timer = setInterval(() => {
      setBreathingTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeBreathingSession(sessionId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeBreathingSession = (sessionId: string) => {
    // In real app, would ask user for post-stress level
    const postStress = Math.max(1, currentStress - 2); // Assume breathing helps
    stressWellnessTracker.completeBreathingSession(sessionId, postStress);
    setActiveBreathing(null);
    setBreathingTimer(0);
    loadWellnessData();
  };

  const getStressColor = (level: number): string => {
    if (level <= 3) return "text-green-400";
    if (level <= 5) return "text-yellow-400";
    if (level <= 7) return "text-orange-400";
    return "text-red-400";
  };

  const getStressIcon = (level: number) => {
    if (level <= 3) return <Smile className="w-5 h-5" />;
    if (level <= 5) return <Meh className="w-5 h-5" />;
    if (level <= 7) return <Frown className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 8) return <Smile className="w-4 h-4 text-green-400" />;
    if (mood >= 6) return <Meh className="w-4 h-4 text-yellow-400" />;
    return <Frown className="w-4 h-4 text-red-400" />;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDailyAverage = (data: number[]): number => {
    return data.length > 0 ? data.reduce((a, b) => a + b, 0) / data.length : 5;
  };

  return (
    <div className="space-y-3">
      {/* Current Status - Mobile Optimized */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {/* Stress Level */}
          <div className="text-center p-2 rounded border border-border/30 bg-background/50">
            <div
              className={`flex items-center justify-center mb-1 ${getStressColor(
                currentStress
              )}`}
            >
              {getStressIcon(currentStress)}
            </div>
            <div className="text-lg font-display text-white mb-1">
              {currentStress}/10
            </div>
            <div className="text-[10px] text-muted-foreground">STRESS</div>
          </div>

          {/* Today's Mood Average */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2 text-yellow-400">
              <Smile className="w-5 h-5" />
              <span className="ml-2 font-technical text-sm">MOOD</span>
            </div>
            <div className="text-3xl font-display text-white mb-1">
              {recentMoods.length > 0
                ? calculateDailyAverage(
                    recentMoods
                      .filter(
                        (m) =>
                          new Date(m.timestamp).toDateString() ===
                          new Date().toDateString()
                      )
                      .map((m) => m.mood)
                  ).toFixed(1)
                : "--"}
              /10
            </div>
            <div className="text-xs text-gray-400">Today's average</div>
          </div>

          {/* Energy Level */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2 text-orange-400">
              <Zap className="w-5 h-5" />
              <span className="ml-2 font-technical text-sm">ENERGY</span>
            </div>
            <div className="text-3xl font-display text-white mb-1">
              {recentMoods.length > 0
                ? calculateDailyAverage(
                    recentMoods
                      .filter(
                        (m) =>
                          new Date(m.timestamp).toDateString() ===
                          new Date().toDateString()
                      )
                      .map((m) => m.energy)
                  ).toFixed(1)
                : "--"}
              /10
            </div>
            <div className="text-xs text-gray-400">Today's average</div>
          </div>

          {/* Breathing Sessions */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2 text-green-400">
              <Wind className="w-5 h-5" />
              <span className="ml-2 font-technical text-sm">BREATHING</span>
            </div>
            <div className="text-3xl font-display text-white mb-1">
              {
                breathingSessions.filter(
                  (s) =>
                    s.completed &&
                    new Date(s.startTime).toDateString() ===
                      new Date().toDateString()
                ).length
              }
            </div>
            <div className="text-xs text-gray-400">Sessions today</div>
          </div>
        </div>

        {/* Active Breathing Exercise */}
        {activeBreathing && (
          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-green-400 animate-pulse" />
              <span className="font-technical text-xs text-green-400">
                BREATHING EXERCISE ACTIVE
              </span>
            </div>
            <div className="text-xl font-display text-white mb-2">
              {formatTime(breathingTimer)}
            </div>
            <Button
              onClick={() => completeBreathingSession(activeBreathing)}
              variant="outline"
              size="sm"
              className="glass border-green-500/30 text-xs"
            >
              COMPLETE
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        {!activeBreathing && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              onClick={() => setShowBreathing(true)}
              className="glass border-white/10 hover:border-green-500/50 text-xs"
              variant="outline"
              size="sm"
            >
              <Wind className="w-3 h-3 mr-1" />
              BREATHING
            </Button>
            <Button
              onClick={() => setShowMoodEntry(true)}
              className="glass border-white/10 hover:border-blue-500/50 text-xs"
              variant="outline"
              size="sm"
            >
              <Plus className="w-3 h-3 mr-1" />
              LOG MOOD
            </Button>
          </div>
        )}
      </div>

      {/* Recent Mood Entries */}
      <div className="glass p-3 border border-white/10">
        <h2 className="font-technical text-white mb-3 text-sm">
          RECENT MOOD ENTRIES
        </h2>

        {recentMoods.length > 0 ? (
          <div className="space-y-2">
            {recentMoods
              .slice(-5)
              .reverse()
              .map((mood, index) => (
                <div
                  key={index}
                  className="p-2 glass border border-white/5 rounded"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-technical text-xs text-gray-400">
                      {formatDateTime(mood.timestamp)}
                    </div>
                    {mood.notes && (
                      <div className="text-xs text-gray-300 max-w-[120px] truncate">
                        "{mood.notes}"
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      {getMoodIcon(mood.mood)}
                      <span className="text-gray-400">MOOD</span>
                      <span className="text-white font-mono">
                        {mood.mood}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${getStressColor(
                          mood.stress
                        ).replace("text-", "bg-")}`}
                      ></div>
                      <span className="text-gray-400">STRESS</span>
                      <span className="text-white font-mono">
                        {mood.stress}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-2 h-2 text-orange-400" />
                      <span className="text-gray-400">ENERGY</span>
                      <span className="text-white font-mono">
                        {mood.energy}/10
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Brain className="w-6 h-6 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">
              No mood entries yet. Start tracking your wellness!
            </p>
          </div>
        )}
      </div>

      {/* Stress Trends */}
      {recentStress.length > 0 && (
        <div className="glass p-3 border border-white/10">
          <h2 className="font-technical text-white mb-3 text-sm">
            STRESS TRENDS (24H)
          </h2>
          <div className="h-20 bg-gray-900/50 rounded border border-white/5 p-2 flex items-end gap-1">
            {recentStress.slice(-24).map((data, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t transition-all ${
                  data.stressLevel <= 3
                    ? "bg-green-400"
                    : data.stressLevel <= 5
                    ? "bg-yellow-400"
                    : data.stressLevel <= 7
                    ? "bg-orange-400"
                    : "bg-red-400"
                }`}
                style={{ height: `${(data.stressLevel / 10) * 100}%` }}
                title={`${data.stressLevel}/10 at ${formatDateTime(
                  data.timestamp
                )}`}
              />
            ))}
          </div>
          <div className="mt-1 text-xs text-gray-400 text-center">
            Last 24 hours • Tap for details
          </div>
        </div>
      )}

      {/* Mood Entry Modal */}
      {showMoodEntry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-strong p-6 border border-white/20 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-technical text-white mb-4">LOG YOUR MOOD</h2>

            <div className="space-y-4">
              {/* Mood Slider */}
              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  MOOD ({moodForm.mood}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodForm.mood}
                  onChange={(e) =>
                    setMoodForm((prev) => ({
                      ...prev,
                      mood: parseInt(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Sad</span>
                  <span>Very Happy</span>
                </div>
              </div>

              {/* Energy Slider */}
              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  ENERGY ({moodForm.energy}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodForm.energy}
                  onChange={(e) =>
                    setMoodForm((prev) => ({
                      ...prev,
                      energy: parseInt(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Exhausted</span>
                  <span>Energetic</span>
                </div>
              </div>

              {/* Stress Slider */}
              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  STRESS ({moodForm.stress}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodForm.stress}
                  onChange={(e) =>
                    setMoodForm((prev) => ({
                      ...prev,
                      stress: parseInt(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Calm</span>
                  <span>Very Stressed</span>
                </div>
              </div>

              {/* Anxiety Slider */}
              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  ANXIETY ({moodForm.anxiety}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodForm.anxiety}
                  onChange={(e) =>
                    setMoodForm((prev) => ({
                      ...prev,
                      anxiety: parseInt(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Calm</span>
                  <span>Very Anxious</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  NOTES (OPTIONAL)
                </label>
                <textarea
                  value={moodForm.notes}
                  onChange={(e) =>
                    setMoodForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="How are you feeling? What's on your mind?"
                  className="w-full p-2 glass border border-white/10 text-white bg-transparent text-sm"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowMoodEntry(false)}
                variant="outline"
                className="flex-1 glass border-white/10"
              >
                CANCEL
              </Button>
              <Button
                onClick={submitMoodEntry}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                SAVE MOOD
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Breathing Exercise Modal */}
      {showBreathing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-strong p-6 border border-white/20 max-w-md w-full mx-4">
            <h2 className="font-technical text-white mb-4">
              BREATHING EXERCISES
            </h2>

            <div className="space-y-4">
              <Button
                onClick={() => startBreathingExercise("box", 5)}
                className="w-full glass border-white/10 hover:border-green-500/50 text-left p-4"
                variant="outline"
              >
                <div>
                  <div className="font-technical text-sm text-white">
                    BOX BREATHING
                  </div>
                  <div className="text-xs text-gray-400">
                    4-4-4-4 pattern • 5 minutes
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => startBreathingExercise("4-7-8", 3)}
                className="w-full glass border-white/10 hover:border-green-500/50 text-left p-4"
                variant="outline"
              >
                <div>
                  <div className="font-technical text-sm text-white">
                    4-7-8 BREATHING
                  </div>
                  <div className="text-xs text-gray-400">
                    Relaxation technique • 3 minutes
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => startBreathingExercise("coherent", 10)}
                className="w-full glass border-white/10 hover:border-green-500/50 text-left p-4"
                variant="outline"
              >
                <div>
                  <div className="font-technical text-sm text-white">
                    COHERENT BREATHING
                  </div>
                  <div className="text-xs text-gray-400">
                    5-5 pattern • 10 minutes
                  </div>
                </div>
              </Button>
            </div>

            <Button
              onClick={() => setShowBreathing(false)}
              variant="outline"
              className="w-full mt-6 glass border-white/10"
            >
              CANCEL
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StressWellnessDashboard;
