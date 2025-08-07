/**
 * Stress & Mental Wellness Tracker - Phase 2.1
 * Nothing-Style Health App - Smart Stress Detection and Mental Wellness
 * Combines HRV analysis, mood tracking, and guided interventions
 */

export interface MoodEntry {
  timestamp: Date;
  mood: number; // 1-10 scale (1=very sad, 10=very happy)
  energy: number; // 1-10 scale (1=exhausted, 10=energetic)
  stress: number; // 1-10 scale (1=calm, 10=very stressed)
  anxiety: number; // 1-10 scale (1=calm, 10=very anxious)
  notes?: string;
  triggers?: string[]; // work, relationships, health, etc.
  activities?: string[]; // exercise, meditation, socializing, etc.
}

export interface StressData {
  timestamp: Date;
  stressLevel: number; // 1-10 calculated from multiple sources
  heartRateVariability: number; // HRV score
  breathingRate: number; // breaths per minute
  physiologicalStress: number; // derived from heart rate patterns
  confidence: number; // 0-1 confidence in stress detection
  source: "hrv" | "manual" | "activity" | "combined";
}

export interface BreathingSession {
  id: string;
  type: "box" | "4-7-8" | "triangle" | "coherent";
  duration: number; // minutes
  startTime: Date;
  endTime: Date;
  completed: boolean;
  preStressLevel: number;
  postStressLevel: number;
  heartRateBefore?: number;
  heartRateAfter?: number;
}

export interface StressPattern {
  dailyAverages: { date: string; avgStress: number; avgMood: number }[];
  weeklyTrends: {
    week: string;
    stress: number;
    mood: number;
    energy: number;
  }[];
  stressTriggers: { trigger: string; frequency: number; avgImpact: number }[];
  moodPatterns: { timeOfDay: number; avgMood: number; avgStress: number }[];
  recoveryMethods: { method: string; effectiveness: number; usage: number }[];
}

export interface WellnessSettings {
  stressNotifications: boolean;
  moodReminders: boolean;
  reminderFrequency: number; // hours
  breathingReminders: boolean;
  targetStressLevel: number; // 1-10
  privacyMode: boolean; // anonymize data
  enableHRVDetection: boolean;
  sensitivityLevel: "low" | "medium" | "high";
}

export class StressWellnessTracker {
  private moodHistory: MoodEntry[] = [];
  private stressData: StressData[] = [];
  private breathingSessions: BreathingSession[] = [];
  private settings: WellnessSettings;
  private currentStressLevel: number = 5;
  private isMonitoring: boolean = true;
  private monitoringInterval: number | null = null;

  // Stress detection parameters
  private baselineHRV: number = 50; // Will be calibrated
  private stressThreshold: number = 7; // Alert when stress > 7
  private lastStressCheck: Date = new Date();

  constructor(settings?: Partial<WellnessSettings>) {
    this.settings = {
      stressNotifications: true,
      moodReminders: true,
      reminderFrequency: 4, // Every 4 hours
      breathingReminders: true,
      targetStressLevel: 3,
      privacyMode: false,
      enableHRVDetection: true,
      sensitivityLevel: "medium",
      ...settings,
    };

    this.initializeTracking();
    this.loadStoredData();
  }

  /**
   * Initialize stress and wellness tracking
   */
  private initializeTracking(): void {
    // Start continuous stress monitoring
    this.startStressMonitoring();

    // Set up mood reminder notifications
    this.setupMoodReminders();

    console.log("Stress & Wellness tracking initialized");
  }

  /**
   * Start continuous stress monitoring using HRV and other signals
   */
  private startStressMonitoring(): void {
    this.monitoringInterval = window.setInterval(() => {
      this.analyzeCurrentStress();
    }, 2 * 60 * 1000); // Check every 2 minutes
  }

  /**
   * Analyze current stress level from available data
   */
  private analyzeCurrentStress(): void {
    const now = new Date();

    // Simulate HRV-based stress detection (would use real HRV data)
    const simulatedHRV = this.getSimulatedHRV();
    const physiologicalStress = this.calculatePhysiologicalStress(simulatedHRV);

    // Consider time of day patterns
    const timeBasedStress = this.getTimeBasedStressPattern();

    // Combine multiple stress indicators
    const combinedStress = this.combineStressIndicators(
      physiologicalStress,
      timeBasedStress
    );

    const stressReading: StressData = {
      timestamp: now,
      stressLevel: combinedStress,
      heartRateVariability: simulatedHRV,
      breathingRate: 12 + Math.random() * 6, // Simulated breathing rate
      physiologicalStress,
      confidence: 0.7,
      source: "combined",
    };

    this.addStressReading(stressReading);
    this.currentStressLevel = combinedStress;

    // Check if intervention is needed
    if (
      combinedStress > this.stressThreshold &&
      this.settings.stressNotifications
    ) {
      this.triggerStressIntervention(combinedStress);
    }
  }

  /**
   * Simulate HRV data (in real app, would use actual heart rate data)
   */
  private getSimulatedHRV(): number {
    const hour = new Date().getHours();
    let baseHRV = this.baselineHRV;

    // Simulate circadian rhythm effects on HRV
    if (hour >= 9 && hour <= 17) {
      // Work hours - potentially higher stress
      baseHRV -= 5 + Math.random() * 10;
    } else if (hour >= 22 || hour <= 6) {
      // Sleep/rest hours - better HRV
      baseHRV += 5 + Math.random() * 8;
    }

    // Add some random variation
    return Math.max(20, Math.min(80, baseHRV + (Math.random() - 0.5) * 20));
  }

  /**
   * Calculate physiological stress from HRV
   */
  private calculatePhysiologicalStress(hrv: number): number {
    // Higher HRV = lower stress, lower HRV = higher stress
    const normalizedHRV = Math.max(0, Math.min(100, hrv));
    const stressFromHRV = 10 - normalizedHRV / 10; // Invert and scale
    return Math.max(1, Math.min(10, stressFromHRV));
  }

  /**
   * Get stress patterns based on time of day
   */
  private getTimeBasedStressPattern(): number {
    const hour = new Date().getHours();

    // Typical daily stress patterns
    if (hour >= 7 && hour <= 9) return 6; // Morning rush
    if (hour >= 10 && hour <= 12) return 5; // Mid-morning work
    if (hour >= 13 && hour <= 15) return 6; // Post-lunch work
    if (hour >= 16 && hour <= 18) return 7; // End of workday
    if (hour >= 19 && hour <= 21) return 4; // Evening wind-down
    if (hour >= 22 || hour <= 6) return 3; // Sleep/rest

    return 5; // Default
  }

  /**
   * Combine multiple stress indicators
   */
  private combineStressIndicators(
    physiological: number,
    timeBased: number
  ): number {
    const recentMood = this.getRecentMoodStress();
    const activityStress = this.getActivityStress();

    // Weighted combination
    const combined =
      physiological * 0.4 +
      timeBased * 0.2 +
      recentMood * 0.3 +
      activityStress * 0.1;

    return Math.round(Math.max(1, Math.min(10, combined)));
  }

  /**
   * Get stress level from recent mood entries
   */
  private getRecentMoodStress(): number {
    const recent = this.moodHistory.filter((entry) => {
      const hoursDiff =
        (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60);
      return hoursDiff <= 6; // Last 6 hours
    });

    if (recent.length === 0) return 5; // Default if no recent data

    const avgStress =
      recent.reduce((sum, entry) => sum + entry.stress, 0) / recent.length;
    return avgStress;
  }

  /**
   * Estimate stress from activity patterns
   */
  private getActivityStress(): number {
    // This would integrate with activity tracker
    // For now, simulate based on time and movement
    const hour = new Date().getHours();

    if (hour >= 9 && hour <= 17) {
      // Work hours - check if sedentary
      return Math.random() > 0.5 ? 6 : 4; // Randomly high or moderate
    }

    return 3; // Lower stress during non-work hours
  }

  /**
   * Add a stress reading to the data
   */
  private addStressReading(reading: StressData): void {
    this.stressData.push(reading);

    // Keep only last 24 hours of data
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.stressData = this.stressData.filter((data) => data.timestamp > cutoff);

    // Save to storage
    this.saveStressData();
  }

  /**
   * Trigger stress intervention when high stress is detected
   */
  private triggerStressIntervention(stressLevel: number): void {
    console.log(
      `High stress detected (${stressLevel}/10) - suggesting intervention`
    );

    // In a real app, this would show a notification
    // For now, just log the recommendation
    if (stressLevel >= 8) {
      console.log("Suggestion: Take a 5-minute breathing break");
    } else if (stressLevel >= 7) {
      console.log("Suggestion: Try a quick meditation or walk");
    }
  }

  /**
   * Log mood entry
   */
  logMoodEntry(entry: Omit<MoodEntry, "timestamp">): void {
    const moodEntry: MoodEntry = {
      ...entry,
      timestamp: new Date(),
    };

    this.moodHistory.push(moodEntry);

    // Keep only last 30 days
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.moodHistory = this.moodHistory.filter(
      (mood) => mood.timestamp > cutoff
    );

    this.saveMoodData();
  }

  /**
   * Start a guided breathing session
   */
  startBreathingSession(
    type: BreathingSession["type"],
    duration: number
  ): string {
    const sessionId = `breathing_${Date.now()}`;
    const session: BreathingSession = {
      id: sessionId,
      type,
      duration,
      startTime: new Date(),
      endTime: new Date(Date.now() + duration * 60 * 1000),
      completed: false,
      preStressLevel: this.currentStressLevel,
      postStressLevel: 0,
    };

    this.breathingSessions.push(session);
    return sessionId;
  }

  /**
   * Complete a breathing session
   */
  completeBreathingSession(sessionId: string, postStressLevel: number): void {
    const session = this.breathingSessions.find((s) => s.id === sessionId);
    if (session) {
      session.completed = true;
      session.endTime = new Date();
      session.postStressLevel = postStressLevel;

      this.saveBreathingData();
    }
  }

  /**
   * Get current stress level
   */
  getCurrentStressLevel(): number {
    return this.currentStressLevel;
  }

  /**
   * Get recent stress data
   */
  getRecentStressData(hours: number = 24): StressData[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.stressData.filter((data) => data.timestamp > cutoff);
  }

  /**
   * Get recent mood entries
   */
  getRecentMoodEntries(days: number = 7): MoodEntry[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.moodHistory.filter((mood) => mood.timestamp > cutoff);
  }

  /**
   * Get breathing session history
   */
  getBreathingSessions(days: number = 30): BreathingSession[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.breathingSessions.filter(
      (session) => session.startTime > cutoff
    );
  }

  /**
   * Analyze stress patterns
   */
  getStressPattern(days: number = 14): StressPattern {
    const moodEntries = this.getRecentMoodEntries(days);
    const stressData = this.getRecentStressData(days * 24);

    // Daily averages
    const dailyAverages = this.calculateDailyAverages(
      moodEntries,
      stressData,
      days
    );

    // Weekly trends
    const weeklyTrends = this.calculateWeeklyTrends(moodEntries);

    // Stress triggers
    const stressTriggers = this.analyzeStressTriggers(moodEntries);

    // Mood patterns by time of day
    const moodPatterns = this.analyzeMoodPatterns(moodEntries);

    // Recovery method effectiveness
    const recoveryMethods = this.analyzeRecoveryMethods();

    return {
      dailyAverages,
      weeklyTrends,
      stressTriggers,
      moodPatterns,
      recoveryMethods,
    };
  }

  /**
   * Calculate daily averages
   */
  private calculateDailyAverages(
    moodEntries: MoodEntry[],
    stressData: StressData[],
    days: number
  ) {
    const dailyData: { [date: string]: { stress: number[]; mood: number[] } } =
      {};

    // Process mood entries
    moodEntries.forEach((entry) => {
      const date = entry.timestamp.toISOString().split("T")[0];
      if (!dailyData[date]) dailyData[date] = { stress: [], mood: [] };
      dailyData[date].stress.push(entry.stress);
      dailyData[date].mood.push(entry.mood);
    });

    // Process stress data
    stressData.forEach((data) => {
      const date = data.timestamp.toISOString().split("T")[0];
      if (!dailyData[date]) dailyData[date] = { stress: [], mood: [] };
      dailyData[date].stress.push(data.stressLevel);
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      avgStress:
        data.stress.length > 0
          ? data.stress.reduce((a, b) => a + b, 0) / data.stress.length
          : 5,
      avgMood:
        data.mood.length > 0
          ? data.mood.reduce((a, b) => a + b, 0) / data.mood.length
          : 5,
    }));
  }

  /**
   * Calculate weekly trends
   */
  private calculateWeeklyTrends(moodEntries: MoodEntry[]) {
    // Group by week and calculate averages
    const weeklyData: {
      [week: string]: { stress: number[]; mood: number[]; energy: number[] };
    } = {};

    moodEntries.forEach((entry) => {
      const week = this.getWeekString(entry.timestamp);
      if (!weeklyData[week])
        weeklyData[week] = { stress: [], mood: [], energy: [] };
      weeklyData[week].stress.push(entry.stress);
      weeklyData[week].mood.push(entry.mood);
      weeklyData[week].energy.push(entry.energy);
    });

    return Object.entries(weeklyData).map(([week, data]) => ({
      week,
      stress: data.stress.reduce((a, b) => a + b, 0) / data.stress.length,
      mood: data.mood.reduce((a, b) => a + b, 0) / data.mood.length,
      energy: data.energy.reduce((a, b) => a + b, 0) / data.energy.length,
    }));
  }

  /**
   * Analyze stress triggers
   */
  private analyzeStressTriggers(moodEntries: MoodEntry[]) {
    const triggerCounts: {
      [trigger: string]: { count: number; totalImpact: number };
    } = {};

    moodEntries.forEach((entry) => {
      if (entry.triggers && entry.stress > 6) {
        // High stress entries
        entry.triggers.forEach((trigger) => {
          if (!triggerCounts[trigger])
            triggerCounts[trigger] = { count: 0, totalImpact: 0 };
          triggerCounts[trigger].count++;
          triggerCounts[trigger].totalImpact += entry.stress;
        });
      }
    });

    return Object.entries(triggerCounts).map(([trigger, data]) => ({
      trigger,
      frequency: data.count,
      avgImpact: data.totalImpact / data.count,
    }));
  }

  /**
   * Analyze mood patterns by time of day
   */
  private analyzeMoodPatterns(moodEntries: MoodEntry[]) {
    const hourlyData: { [hour: number]: { mood: number[]; stress: number[] } } =
      {};

    moodEntries.forEach((entry) => {
      const hour = entry.timestamp.getHours();
      if (!hourlyData[hour]) hourlyData[hour] = { mood: [], stress: [] };
      hourlyData[hour].mood.push(entry.mood);
      hourlyData[hour].stress.push(entry.stress);
    });

    return Object.entries(hourlyData).map(([hour, data]) => ({
      timeOfDay: parseInt(hour),
      avgMood: data.mood.reduce((a, b) => a + b, 0) / data.mood.length,
      avgStress: data.stress.reduce((a, b) => a + b, 0) / data.stress.length,
    }));
  }

  /**
   * Analyze recovery method effectiveness
   */
  private analyzeRecoveryMethods() {
    const breathingSessions = this.getBreathingSessions();
    const methods: {
      [method: string]: { sessions: number; avgImprovement: number };
    } = {};

    breathingSessions.forEach((session) => {
      if (session.completed) {
        const improvement = session.preStressLevel - session.postStressLevel;
        if (!methods[session.type])
          methods[session.type] = { sessions: 0, avgImprovement: 0 };
        methods[session.type].sessions++;
        methods[session.type].avgImprovement += improvement;
      }
    });

    return Object.entries(methods).map(([method, data]) => ({
      method,
      effectiveness: data.avgImprovement / data.sessions,
      usage: data.sessions,
    }));
  }

  /**
   * Get week string for grouping
   */
  private getWeekString(date: Date): string {
    const year = date.getFullYear();
    const week = Math.ceil(
      (date.getTime() - new Date(year, 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );
    return `${year}-W${week}`;
  }

  /**
   * Setup mood reminder notifications
   */
  private setupMoodReminders(): void {
    if (!this.settings.moodReminders) return;

    // Set up periodic reminders (simplified for demo)
    setInterval(() => {
      if (this.shouldShowMoodReminder()) {
        console.log("Mood check reminder: How are you feeling?");
      }
    }, this.settings.reminderFrequency * 60 * 60 * 1000);
  }

  /**
   * Check if mood reminder should be shown
   */
  private shouldShowMoodReminder(): boolean {
    const lastEntry = this.moodHistory[this.moodHistory.length - 1];
    if (!lastEntry) return true;

    const hoursSinceLastEntry =
      (Date.now() - lastEntry.timestamp.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastEntry >= this.settings.reminderFrequency;
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<WellnessSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem("wellness_settings", JSON.stringify(this.settings));
  }

  /**
   * Get current settings
   */
  getSettings(): WellnessSettings {
    return { ...this.settings };
  }

  /**
   * Save data to localStorage
   */
  private saveMoodData(): void {
    localStorage.setItem("mood_history", JSON.stringify(this.moodHistory));
  }

  private saveStressData(): void {
    localStorage.setItem("stress_data", JSON.stringify(this.stressData));
  }

  private saveBreathingData(): void {
    localStorage.setItem(
      "breathing_sessions",
      JSON.stringify(this.breathingSessions)
    );
  }

  /**
   * Load stored data
   */
  private loadStoredData(): void {
    try {
      const moodData = localStorage.getItem("mood_history");
      if (moodData) {
        this.moodHistory = JSON.parse(moodData).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      }

      const stressData = localStorage.getItem("stress_data");
      if (stressData) {
        this.stressData = JSON.parse(stressData).map((data: any) => ({
          ...data,
          timestamp: new Date(data.timestamp),
        }));
      }

      const breathingData = localStorage.getItem("breathing_sessions");
      if (breathingData) {
        this.breathingSessions = JSON.parse(breathingData).map(
          (session: any) => ({
            ...session,
            startTime: new Date(session.startTime),
            endTime: new Date(session.endTime),
          })
        );
      }

      const settings = localStorage.getItem("wellness_settings");
      if (settings) {
        this.settings = { ...this.settings, ...JSON.parse(settings) };
      }
    } catch (error) {
      console.error("Error loading wellness data:", error);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.isMonitoring = false;
  }
}

// Export singleton instance
export const stressWellnessTracker = new StressWellnessTracker();
