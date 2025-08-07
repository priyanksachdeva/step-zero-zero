/**
 * Hydration Tracker - Phase 2.2
 * Nothing-Style Health App - Smart Water Intake Monitoring
 * Intelligent hydration tracking with personalized goals and health insights
 */

export interface HydrationEntry {
  id: string;
  timestamp: Date;
  amount: number; // ml
  type: "water" | "tea" | "coffee" | "juice" | "sports_drink" | "other";
  source: "manual" | "smart_bottle" | "meal_detection" | "routine";
  temperature?: "cold" | "room" | "warm" | "hot";
  context?: "meal" | "workout" | "wake_up" | "break" | "before_sleep";
}

export interface HydrationGoal {
  dailyTarget: number; // ml
  personalizedFactor: number; // multiplier based on activity/weather
  minIntakePerHour: number;
  maxIntakePerHour: number;
  morningTarget: number; // first 2 hours
  workoutMultiplier: number;
  weatherAdjustment: number;
}

export interface HydrationStatus {
  currentIntake: number; // today's total ml
  goalProgress: number; // percentage
  hourlyRate: number; // ml/hour current
  hydrationLevel: "dehydrated" | "low" | "optimal" | "overhydrated";
  nextReminderTime: Date | null;
  urgencyLevel: "none" | "low" | "medium" | "high" | "critical";
  timeToOptimal: number; // minutes
}

export interface HydrationInsights {
  weeklyAverage: number;
  consistency: number; // 1-10 scale
  bestHydrationTime: string;
  worstHydrationTime: string;
  hydrationTrends: Array<{
    date: string;
    intake: number;
    goal: number;
    percentage: number;
  }>;
  correlations: {
    activityLevel: number;
    sleepQuality: number;
    stressLevel: number;
  };
  recommendations: string[];
}

export interface HydrationSettings {
  reminderInterval: number; // minutes
  smartReminders: boolean;
  quietHours: { start: string; end: string };
  preferredDrinks: string[];
  bottleSize: number; // ml for quick logging
  goalCalculationMethod:
    | "standard"
    | "activity_based"
    | "weight_based"
    | "custom";
  customDailyGoal?: number;
  activityMultiplier: number;
  climateAdjustment: boolean;
}

class HydrationTracker {
  private entries: HydrationEntry[] = [];
  private goals: HydrationGoal;
  private settings: HydrationSettings;
  private storageKey = "nothing_hydration_data";
  private settingsKey = "nothing_hydration_settings";
  private reminderTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.loadData();
    this.goals = this.calculatePersonalizedGoals();
    this.settings = this.loadSettings();
    this.startSmartReminders();
  }

  private loadData(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.entries =
          data.entries?.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          })) || [];
      }
    } catch (error) {
      console.error("Error loading hydration data:", error);
      this.entries = [];
    }
  }

  private saveData(): void {
    try {
      const data = {
        entries: this.entries,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving hydration data:", error);
    }
  }

  private loadSettings(): HydrationSettings {
    try {
      const stored = localStorage.getItem(this.settingsKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading hydration settings:", error);
    }

    return {
      reminderInterval: 60,
      smartReminders: true,
      quietHours: { start: "22:00", end: "07:00" },
      preferredDrinks: ["water"],
      bottleSize: 500,
      goalCalculationMethod: "activity_based",
      activityMultiplier: 1.2,
      climateAdjustment: true,
    };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    } catch (error) {
      console.error("Error saving hydration settings:", error);
    }
  }

  private calculatePersonalizedGoals(): HydrationGoal {
    // Base calculation: 35ml per kg of body weight (assuming 70kg average)
    const baseTarget = 2500; // ml for average adult

    // Get activity level from fitness tracker if available
    const activityMultiplier = this.getActivityMultiplier();

    // Weather adjustment (simplified - in real app would use weather API)
    const weatherMultiplier = this.getWeatherMultiplier();

    const dailyTarget = Math.round(
      baseTarget * activityMultiplier * weatherMultiplier
    );

    return {
      dailyTarget,
      personalizedFactor: activityMultiplier * weatherMultiplier,
      minIntakePerHour: 50,
      maxIntakePerHour: 400,
      morningTarget: dailyTarget * 0.25, // 25% in first 2 hours
      workoutMultiplier: 1.5,
      weatherAdjustment: weatherMultiplier,
    };
  }

  private getActivityMultiplier(): number {
    // In real app, would integrate with fitness tracker
    // For now, return default multiplier
    return this.settings?.activityMultiplier || 1.2;
  }

  private getWeatherMultiplier(): number {
    // In real app, would use weather API
    // For now, simulate based on season/date
    const month = new Date().getMonth();
    if (month >= 5 && month <= 8) {
      // Summer months
      return 1.15;
    } else if (month >= 11 || month <= 2) {
      // Winter months
      return 0.95;
    }
    return 1.0; // Spring/Fall
  }

  logHydration(
    amount: number,
    type: HydrationEntry["type"] = "water",
    context?: HydrationEntry["context"],
    temperature?: HydrationEntry["temperature"]
  ): string {
    const entry: HydrationEntry = {
      id: `hydration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      amount,
      type,
      source: "manual",
      temperature,
      context,
    };

    this.entries.push(entry);
    this.saveData();
    this.updateReminders();

    return entry.id;
  }

  logQuickIntake(bottleCount: number = 1): string {
    return this.logHydration(
      this.settings.bottleSize * bottleCount,
      "water",
      undefined,
      "room"
    );
  }

  getCurrentStatus(): HydrationStatus {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const todayEntries = this.entries.filter(
      (entry) => entry.timestamp >= startOfDay
    );

    const currentIntake = todayEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );
    const goalProgress = (currentIntake / this.goals.dailyTarget) * 100;

    // Calculate hourly rate (last 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recentEntries = todayEntries.filter(
      (entry) => entry.timestamp >= twoHoursAgo
    );
    const recentIntake = recentEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );
    const hourlyRate = recentIntake / 2;

    const hydrationLevel = this.calculateHydrationLevel(
      currentIntake,
      goalProgress
    );
    const urgencyLevel = this.calculateUrgencyLevel(currentIntake, hourlyRate);
    const timeToOptimal = this.calculateTimeToOptimal(currentIntake);

    return {
      currentIntake,
      goalProgress: Math.min(goalProgress, 100),
      hourlyRate,
      hydrationLevel,
      nextReminderTime: this.calculateNextReminder(urgencyLevel),
      urgencyLevel,
      timeToOptimal,
    };
  }

  private calculateHydrationLevel(
    currentIntake: number,
    goalProgress: number
  ): HydrationStatus["hydrationLevel"] {
    if (goalProgress < 30) return "dehydrated";
    if (goalProgress < 60) return "low";
    if (goalProgress <= 100) return "optimal";
    return "overhydrated";
  }

  private calculateUrgencyLevel(
    currentIntake: number,
    hourlyRate: number
  ): HydrationStatus["urgencyLevel"] {
    const now = new Date();
    const hourOfDay = now.getHours();
    const expectedIntakeByNow = (this.goals.dailyTarget * hourOfDay) / 24;
    const deficit = expectedIntakeByNow - currentIntake;

    if (deficit < 100) return "none";
    if (deficit < 300) return "low";
    if (deficit < 600) return "medium";
    if (deficit < 1000) return "high";
    return "critical";
  }

  private calculateTimeToOptimal(currentIntake: number): number {
    const remaining = Math.max(0, this.goals.dailyTarget - currentIntake);
    const averageIntakeRate = 200; // ml per reminder interval
    return Math.round(
      (remaining / averageIntakeRate) * this.settings.reminderInterval
    );
  }

  private calculateNextReminder(
    urgencyLevel?: "none" | "low" | "medium" | "high" | "critical"
  ): Date | null {
    if (!this.settings.smartReminders) return null;

    const now = new Date();
    let intervalMinutes = this.settings.reminderInterval;

    // Adjust based on urgency if provided
    if (urgencyLevel) {
      switch (urgencyLevel) {
        case "critical":
          intervalMinutes = 15;
          break;
        case "high":
          intervalMinutes = 30;
          break;
        case "medium":
          intervalMinutes = 45;
          break;
        case "low":
          intervalMinutes = 60;
          break;
        case "none":
        default:
          intervalMinutes = 90;
          break;
      }
    }

    // Check quiet hours
    if (this.isQuietTime(now)) {
      const quietEnd = this.parseTime(this.settings.quietHours.end);
      return quietEnd;
    }

    return new Date(now.getTime() + intervalMinutes * 60 * 1000);
  }

  private isQuietTime(time: Date): boolean {
    const timeString = time.toTimeString().substr(0, 5);
    const quietStart = this.settings.quietHours.start;
    const quietEnd = this.settings.quietHours.end;

    if (quietStart <= quietEnd) {
      return timeString >= quietStart && timeString <= quietEnd;
    } else {
      return timeString >= quietStart || timeString <= quietEnd;
    }
  }

  private parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(":").map(Number);
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time;
  }

  getHydrationHistory(days: number = 7): HydrationEntry[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.entries
      .filter((entry) => entry.timestamp >= cutoffDate)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getDailyIntake(date: Date): number {
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    return this.entries
      .filter(
        (entry) => entry.timestamp >= startOfDay && entry.timestamp < endOfDay
      )
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  generateInsights(): HydrationInsights {
    const last7Days = this.getLast7DaysData();
    const weeklyAverage =
      last7Days.reduce((sum, day) => sum + day.intake, 0) / 7;

    const consistency = this.calculateConsistency(last7Days);
    const timeAnalysis = this.analyzeHydrationTimes();

    return {
      weeklyAverage,
      consistency,
      bestHydrationTime: timeAnalysis.best,
      worstHydrationTime: timeAnalysis.worst,
      hydrationTrends: last7Days,
      correlations: this.calculateCorrelations(),
      recommendations: this.generateRecommendations(last7Days, consistency),
    };
  }

  private getLast7DaysData() {
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const intake = this.getDailyIntake(date);
      const goal = this.goals.dailyTarget;

      trends.push({
        date: date.toISOString().split("T")[0],
        intake,
        goal,
        percentage: (intake / goal) * 100,
      });
    }
    return trends;
  }

  private calculateConsistency(trends: any[]): number {
    if (trends.length < 2) return 5;

    const percentages = trends.map((t) => t.percentage);
    const mean =
      percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const variance =
      percentages.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) /
      percentages.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to 1-10 scale (lower deviation = higher consistency)
    const consistency = Math.max(1, Math.min(10, 10 - standardDeviation / 10));
    return Math.round(consistency * 10) / 10;
  }

  private analyzeHydrationTimes(): { best: string; worst: string } {
    const hourlyIntake = new Array(24).fill(0);
    const hourlyCounts = new Array(24).fill(0);

    this.entries.forEach((entry) => {
      const hour = entry.timestamp.getHours();
      hourlyIntake[hour] += entry.amount;
      hourlyCounts[hour]++;
    });

    const hourlyAverages = hourlyIntake.map((total, hour) => ({
      hour,
      average: hourlyCounts[hour] > 0 ? total / hourlyCounts[hour] : 0,
    }));

    // Guard against empty arrays
    if (hourlyAverages.length === 0) {
      return {
        best: "08:00-09:00",
        worst: "22:00-23:00",
      };
    }

    const bestHour = hourlyAverages.reduce((max, curr) =>
      curr.average > max.average ? curr : max
    );

    const filteredHours = hourlyAverages.filter((h) => h.average > 0);
    const worstHour =
      filteredHours.length > 0
        ? filteredHours.reduce((min, curr) =>
            curr.average < min.average ? curr : min
          )
        : hourlyAverages[0]; // fallback to first hour if no positive averages

    return {
      best: `${bestHour.hour}:00-${(bestHour.hour + 1) % 24}:00`,
      worst: `${worstHour.hour}:00-${(worstHour.hour + 1) % 24}:00`,
    };
  }

  private calculateCorrelations() {
    // In real app, would correlate with actual fitness/sleep/stress data
    // For now, return mock correlations
    return {
      activityLevel: 0.65,
      sleepQuality: 0.42,
      stressLevel: -0.38,
    };
  }

  private generateRecommendations(
    trends: any[],
    consistency: number
  ): string[] {
    const recommendations = [];
    const avgPercentage =
      trends.reduce((sum, t) => sum + t.percentage, 0) / trends.length;

    if (avgPercentage < 70) {
      recommendations.push(
        "Increase daily water intake - aim for your personalized goal"
      );
    }

    if (consistency < 6) {
      recommendations.push(
        "Focus on consistent daily hydration - set regular reminders"
      );
    }

    const recentTrend = trends.slice(-3);
    const isDecreasing = recentTrend.every(
      (day, i) => i === 0 || day.percentage < recentTrend[i - 1].percentage
    );

    if (isDecreasing) {
      recommendations.push(
        "Your hydration has been decreasing - check if you need goal adjustments"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Great hydration habits! Keep maintaining your routine"
      );
    }

    return recommendations;
  }

  updateSettings(newSettings: Partial<HydrationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.goals = this.calculatePersonalizedGoals();
    this.updateReminders();
  }

  getSettings(): HydrationSettings {
    return { ...this.settings };
  }

  getGoals(): HydrationGoal {
    return { ...this.goals };
  }

  private startSmartReminders(): void {
    if (this.reminderTimeout) {
      clearTimeout(this.reminderTimeout);
    }

    if (!this.settings.smartReminders) return;

    const nextReminder = this.calculateNextReminder();
    if (!nextReminder) return;

    const timeUntilReminder = nextReminder.getTime() - Date.now();
    if (timeUntilReminder > 0) {
      this.reminderTimeout = setTimeout(() => {
        this.triggerReminder();
        this.startSmartReminders(); // Schedule next reminder
      }, timeUntilReminder);
    }
  }

  private updateReminders(): void {
    this.startSmartReminders();
  }

  private triggerReminder(): void {
    const status = this.getCurrentStatus();

    // In real app, would show notification
    console.log(`Hydration reminder: ${status.urgencyLevel} urgency`);

    // Could dispatch custom event for UI to handle
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("hydrationReminder", {
          detail: { status, urgency: status.urgencyLevel },
        })
      );
    }
  }

  deleteEntry(entryId: string): boolean {
    const initialLength = this.entries.length;
    this.entries = this.entries.filter((entry) => entry.id !== entryId);

    if (this.entries.length < initialLength) {
      this.saveData();
      this.updateReminders();
      return true;
    }

    return false;
  }

  editEntry(entryId: string, updates: Partial<HydrationEntry>): boolean {
    const entryIndex = this.entries.findIndex((entry) => entry.id === entryId);

    if (entryIndex !== -1) {
      this.entries[entryIndex] = { ...this.entries[entryIndex], ...updates };
      this.saveData();
      this.updateReminders();
      return true;
    }

    return false;
  }

  // Quick actions for common use cases
  drinkWater(amount?: number): string {
    return this.logHydration(amount || this.settings.bottleSize, "water");
  }

  drinkCoffee(amount: number = 250): string {
    return this.logHydration(amount, "coffee", "break", "hot");
  }

  drinkTea(amount: number = 200): string {
    return this.logHydration(amount, "tea", "break", "hot");
  }

  postWorkoutHydration(amount: number = 500): string {
    return this.logHydration(amount, "water", "workout", "cold");
  }

  morningHydration(amount: number = 300): string {
    return this.logHydration(amount, "water", "wake_up", "room");
  }
}

// Export singleton instance
export const hydrationTracker = new HydrationTracker();
export default hydrationTracker;
