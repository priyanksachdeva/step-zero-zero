/**
 * Automatic Sleep Tracking System - Phase 1.3 Enhanced
 * Nothing-Style Health App - Smart Sleep Detection
 * Continuously monitors and automatically detects sleep patterns
 */

export interface SleepData {
  date: string; // YYYY-MM-DD format
  bedtime: Date;
  wakeTime: Date;
  duration: number; // minutes
  quality: number; // 1-5 stars
  efficiency: number; // percentage
  deepSleep: number; // estimated minutes
  lightSleep: number; // estimated minutes
  awakeTime: number; // minutes awake during night
  sleepDebt: number; // minutes behind/ahead of target
  consistency: number; // 1-5 score based on regular schedule
}

export interface SleepPattern {
  averageBedtime: Date;
  averageWakeTime: Date;
  averageDuration: number;
  averageQuality: number;
  weekdayPattern: SleepData[];
  weekendPattern: SleepData[];
  sleepDebtTrend: number[];
}

export interface SleepSettings {
  targetSleepDuration: number; // minutes
  preferredBedtime: Date;
  preferredWakeTime: Date;
  smartAlarmWindow: number; // minutes before preferred wake time
  weekendOffset: number; // minutes later for weekends
  motionSensitivity: "low" | "medium" | "high";
}

export interface MotionEvent {
  timestamp: Date;
  magnitude: number;
  isSignificant: boolean;
}

export interface SleepStatus {
  currentState:
    | "awake"
    | "falling_asleep"
    | "light_sleep"
    | "deep_sleep"
    | "waking_up";
  confidence: number; // 0-1
  sessionStartTime: Date | null;
  estimatedSleepTime: Date | null;
  estimatedWakeTime: Date | null;
  currentQuality: number; // 1-5
  minutesAsleep: number;
  isAutoDetected: boolean;
}

export class SleepTracker {
  private motionHistory: MotionEvent[] = [];
  private currentSleepSession: Partial<SleepData> | null = null;
  private settings: SleepSettings;
  private motionThreshold: number = 0.3; // Smart threshold for automatic detection
  private isMonitoring: boolean = true; // Always monitoring
  private lastMotionTime: Date = new Date();
  private sleepStatus: SleepStatus;
  private monitoringInterval: number | null = null;
  private motionSensor: DeviceMotionEvent | null = null;

  // Detection parameters
  private sleepOnsetThreshold = 15 * 60 * 1000; // 15 minutes of low activity
  private wakeThreshold = 5 * 60 * 1000; // 5 minutes of sustained activity
  private deepSleepThreshold = 45 * 60 * 1000; // 45 minutes for deep sleep phase

  constructor(settings?: Partial<SleepSettings>) {
    this.settings = {
      targetSleepDuration: 8 * 60, // 8 hours
      preferredBedtime: new Date(0, 0, 0, 23, 0), // 11 PM
      preferredWakeTime: new Date(0, 0, 0, 7, 0), // 7 AM
      smartAlarmWindow: 30,
      weekendOffset: 60, // 1 hour later on weekends
      motionSensitivity: "medium",
      ...settings,
    };

    this.sleepStatus = {
      currentState: "awake",
      confidence: 0.8,
      sessionStartTime: null,
      estimatedSleepTime: null,
      estimatedWakeTime: null,
      currentQuality: 3,
      minutesAsleep: 0,
      isAutoDetected: true,
    };

    this.initializeAutomaticTracking();
    this.loadStoredData();
  }

  /**
   * Initialize automatic sleep tracking
   */
  private initializeAutomaticTracking(): void {
    // Set motion sensitivity
    this.updateMotionSensitivity();

    // Start motion detection
    this.initializeMotionSensor();

    // Start continuous monitoring
    this.startContinuousMonitoring();

    console.log("Automatic sleep tracking initialized");
  }

  /**
   * Update motion sensitivity based on settings
   */
  private updateMotionSensitivity(): void {
    switch (this.settings.motionSensitivity) {
      case "low":
        this.motionThreshold = 0.5;
        break;
      case "medium":
        this.motionThreshold = 0.3;
        break;
      case "high":
        this.motionThreshold = 0.15;
        break;
    }
  }

  /**
   * Initialize device motion sensor
   */
  private initializeMotionSensor(): void {
    if (typeof window !== "undefined" && "DeviceMotionEvent" in window) {
      window.addEventListener("devicemotion", (event) => {
        this.processMotionEvent(event);
      });
    } else {
      // Fallback: simulate motion data for testing
      this.simulateMotionData();
    }
  }

  /**
   * Process device motion events
   */
  private processMotionEvent(event: DeviceMotionEvent): void {
    if (!event.acceleration) return;

    const { x = 0, y = 0, z = 0 } = event.acceleration;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    this.addMotionReading(magnitude);
  }

  /**
   * Simulate motion data for testing/development
   */
  private simulateMotionData(): void {
    setInterval(() => {
      // Simulate motion based on time of day
      const hour = new Date().getHours();
      let magnitude: number;

      if (hour >= 23 || hour <= 6) {
        // Night time - low motion (simulating sleep)
        magnitude = Math.random() * 0.2;
      } else if (hour >= 7 && hour <= 9) {
        // Morning - moderate motion (waking up)
        magnitude = Math.random() * 0.8 + 0.2;
      } else {
        // Day time - high motion (awake)
        magnitude = Math.random() * 1.2 + 0.3;
      }

      this.addMotionReading(magnitude);
    }, 30000); // Every 30 seconds
  }

  /**
   * Add motion reading and analyze sleep state
   */
  private addMotionReading(magnitude: number): void {
    const now = new Date();
    const isSignificant = magnitude > this.motionThreshold;

    this.motionHistory.push({
      timestamp: now,
      magnitude,
      isSignificant,
    });

    if (isSignificant) {
      this.lastMotionTime = now;
    }

    // Keep only last 24 hours of data
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    this.motionHistory = this.motionHistory.filter(
      (event) => event.timestamp > cutoff
    );

    // Analyze current sleep state
    this.analyzeCurrentState();
  }

  /**
   * Start continuous monitoring loop
   */
  private startContinuousMonitoring(): void {
    this.monitoringInterval = window.setInterval(() => {
      this.updateSleepStatus();
      this.checkForSleepTransitions();
    }, 60000); // Check every minute
  }

  /**
   * Analyze current sleep state based on motion patterns
   */
  private analyzeCurrentState(): void {
    const now = new Date();
    const recentActivity = this.getRecentActivityLevel(30); // Last 30 minutes
    const timeSinceLastMotion = now.getTime() - this.lastMotionTime.getTime();

    // Update sleep status based on activity
    if (
      timeSinceLastMotion > this.sleepOnsetThreshold &&
      recentActivity < 0.1
    ) {
      this.detectSleepOnset(now);
    } else if (
      this.sleepStatus.currentState !== "awake" &&
      recentActivity > 0.3
    ) {
      this.detectWakeUp(now);
    }

    // Determine sleep phase if currently sleeping
    if (this.sleepStatus.currentState !== "awake") {
      this.updateSleepPhase();
    }
  }

  /**
   * Detect sleep onset automatically
   */
  private detectSleepOnset(time: Date): void {
    if (this.sleepStatus.currentState === "awake") {
      this.sleepStatus.currentState = "falling_asleep";
      this.sleepStatus.sessionStartTime = time;

      // Look back to find actual sleep onset
      const actualSleepTime = this.findSleepOnsetTime();
      if (actualSleepTime) {
        this.sleepStatus.estimatedSleepTime = actualSleepTime;
        this.startNewSleepSession(actualSleepTime);
      }

      console.log(
        "Sleep onset detected automatically:",
        actualSleepTime || time
      );
    }
  }

  /**
   * Detect wake up automatically
   */
  private detectWakeUp(time: Date): void {
    if (this.sleepStatus.currentState !== "awake") {
      this.sleepStatus.currentState = "waking_up";
      this.sleepStatus.estimatedWakeTime = time;

      // Complete the sleep session
      if (this.currentSleepSession && this.sleepStatus.estimatedSleepTime) {
        this.completeSleepSession(time);
      }

      // Return to awake state after a few minutes
      setTimeout(() => {
        this.sleepStatus.currentState = "awake";
      }, 5 * 60 * 1000); // 5 minutes

      console.log("Wake up detected automatically:", time);
    }
  }

  /**
   * Find actual sleep onset time by analyzing motion history
   */
  private findSleepOnsetTime(): Date | null {
    if (this.motionHistory.length < 30) return null;

    // Look for sustained period of low activity (30+ minutes)
    const windowSize = 30;
    const activityThreshold = 0.05;

    for (let i = this.motionHistory.length - 1; i >= windowSize; i--) {
      const window = this.motionHistory.slice(i - windowSize, i);
      const activity =
        window.filter((e) => e.isSignificant).length / window.length;

      if (activity < activityThreshold) {
        return window[0].timestamp;
      }
    }

    return null;
  }

  /**
   * Update sleep phase based on motion patterns
   */
  private updateSleepPhase(): void {
    const now = new Date();
    const sessionDuration = this.sleepStatus.sessionStartTime
      ? now.getTime() - this.sleepStatus.sessionStartTime.getTime()
      : 0;

    const recentActivity = this.getRecentActivityLevel(15); // Last 15 minutes

    if (sessionDuration > this.deepSleepThreshold && recentActivity < 0.02) {
      this.sleepStatus.currentState = "deep_sleep";
      this.sleepStatus.confidence = 0.9;
    } else if (recentActivity < 0.1) {
      this.sleepStatus.currentState = "light_sleep";
      this.sleepStatus.confidence = 0.8;
    } else {
      this.sleepStatus.currentState = "falling_asleep";
      this.sleepStatus.confidence = 0.6;
    }
  }

  /**
   * Get activity level for specified time period (0-1 scale)
   */
  private getRecentActivityLevel(minutes: number): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentEvents = this.motionHistory.filter(
      (event) => event.timestamp > cutoff
    );

    if (recentEvents.length === 0) return 0;

    const significantMovements = recentEvents.filter(
      (event) => event.isSignificant
    ).length;
    return significantMovements / recentEvents.length;
  }

  /**
   * Start a new sleep session
   */
  private startNewSleepSession(bedtime: Date): void {
    this.currentSleepSession = {
      date: bedtime.toISOString().split("T")[0],
      bedtime,
      duration: 0,
      quality: 3,
      efficiency: 0,
      deepSleep: 0,
      lightSleep: 0,
      awakeTime: 0,
      sleepDebt: 0,
      consistency: 3,
    };
  }

  /**
   * Complete current sleep session
   */
  private completeSleepSession(wakeTime: Date): void {
    if (!this.currentSleepSession?.bedtime) return;

    this.currentSleepSession.wakeTime = wakeTime;
    const sleepData = this.analyzeSleepSession();

    if (sleepData) {
      this.saveSleepData(sleepData);
      this.currentSleepSession = null;
    }
  }

  /**
   * Analyze completed sleep session
   */
  private analyzeSleepSession(): SleepData | null {
    if (
      !this.currentSleepSession?.bedtime ||
      !this.currentSleepSession?.wakeTime
    ) {
      return null;
    }

    const bedtime = this.currentSleepSession.bedtime;
    const wakeTime = this.currentSleepSession.wakeTime;
    const duration = (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60); // minutes

    // Analyze sleep phases from motion data
    const phases = this.analyzeSleepPhases(bedtime, wakeTime);

    // Calculate quality score based on motion patterns
    const quality = this.calculateSleepQuality(phases, duration);

    // Calculate efficiency (time asleep vs time in bed)
    const efficiency = Math.min(
      100,
      (duration / this.settings.targetSleepDuration) * 100
    );

    // Calculate sleep debt
    const sleepDebt = this.settings.targetSleepDuration - duration;

    // Calculate consistency score
    const consistency = this.calculateConsistencyScore(bedtime);

    return {
      date: bedtime.toISOString().split("T")[0],
      bedtime,
      wakeTime,
      duration,
      quality,
      efficiency,
      deepSleep: phases.deepSleep,
      lightSleep: phases.lightSleep,
      awakeTime: phases.awakeTime,
      sleepDebt,
      consistency,
    };
  }

  /**
   * Analyze sleep phases from motion data
   */
  private analyzeSleepPhases(bedtime: Date, wakeTime: Date) {
    const sessionMotion = this.motionHistory.filter(
      (event) => event.timestamp >= bedtime && event.timestamp <= wakeTime
    );

    let deepSleep = 0;
    let lightSleep = 0;
    let awakeTime = 0;

    // Analyze in 15-minute chunks
    const chunkSize = 15 * 60 * 1000; // 15 minutes
    const totalDuration = wakeTime.getTime() - bedtime.getTime();

    for (
      let time = bedtime.getTime();
      time < wakeTime.getTime();
      time += chunkSize
    ) {
      const chunkEnd = Math.min(time + chunkSize, wakeTime.getTime());
      const chunkMotion = sessionMotion.filter(
        (event) =>
          event.timestamp.getTime() >= time &&
          event.timestamp.getTime() < chunkEnd
      );

      const activityLevel =
        chunkMotion.length > 0
          ? chunkMotion.filter((e) => e.isSignificant).length /
            chunkMotion.length
          : 0;

      const chunkMinutes = (chunkEnd - time) / (1000 * 60);

      if (activityLevel < 0.02) {
        deepSleep += chunkMinutes;
      } else if (activityLevel < 0.1) {
        lightSleep += chunkMinutes;
      } else {
        awakeTime += chunkMinutes;
      }
    }

    return { deepSleep, lightSleep, awakeTime };
  }

  /**
   * Calculate sleep quality score (1-5)
   */
  private calculateSleepQuality(phases: any, duration: number): number {
    const deepSleepRatio = phases.deepSleep / duration;
    const awakeRatio = phases.awakeTime / duration;
    const durationScore = Math.min(
      duration / this.settings.targetSleepDuration,
      1
    );

    // Quality based on deep sleep percentage, minimal wake time, and duration
    let quality = 5;

    if (deepSleepRatio < 0.15) quality -= 1; // Less than 15% deep sleep
    if (awakeRatio > 0.15) quality -= 1; // More than 15% awake time
    if (durationScore < 0.8) quality -= 1; // Less than 80% of target duration
    if (duration < 4 * 60) quality -= 2; // Less than 4 hours is poor quality

    return Math.max(1, Math.min(5, quality));
  }

  /**
   * Calculate consistency score based on regular bedtime
   */
  private calculateConsistencyScore(bedtime: Date): number {
    const recentSleep = this.getRecentSleepData(7); // Last 7 days
    if (recentSleep.length < 3) return 3; // Not enough data

    const bedtimes = recentSleep.map(
      (sleep) => sleep.bedtime.getHours() * 60 + sleep.bedtime.getMinutes()
    );
    const avgBedtime = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
    const variance =
      bedtimes.reduce((acc, time) => acc + Math.pow(time - avgBedtime, 2), 0) /
      bedtimes.length;
    const stdDev = Math.sqrt(variance);

    // Score based on standard deviation (lower is better)
    if (stdDev < 30) return 5; // Very consistent (within 30 minutes)
    if (stdDev < 60) return 4; // Good consistency (within 1 hour)
    if (stdDev < 90) return 3; // Moderate consistency
    if (stdDev < 120) return 2; // Poor consistency
    return 1; // Very inconsistent
  }

  /**
   * Update sleep status display
   */
  private updateSleepStatus(): void {
    if (this.sleepStatus.sessionStartTime) {
      const now = new Date();
      this.sleepStatus.minutesAsleep = Math.floor(
        (now.getTime() - this.sleepStatus.sessionStartTime.getTime()) /
          (1000 * 60)
      );
    }
  }

  /**
   * Check for sleep state transitions
   */
  private checkForSleepTransitions(): void {
    const now = new Date();
    const hour = now.getHours();

    // Auto-detect evening mode (prepare for sleep tracking)
    if (hour >= 21 && this.sleepStatus.currentState === "awake") {
      this.sleepStatus.confidence = 0.7; // Slightly higher chance of sleep
    }

    // Auto-detect morning mode (prepare for wake detection)
    if (hour >= 5 && hour <= 10 && this.sleepStatus.currentState !== "awake") {
      this.sleepStatus.confidence = Math.min(
        0.9,
        this.sleepStatus.confidence + 0.1
      );
    }
  }

  /**
   * Get current sleep status
   */
  getCurrentStatus(): SleepStatus {
    return { ...this.sleepStatus };
  }

  /**
   * Get sleep data for specific date
   */
  getSleepData(date: string): SleepData | null {
    const stored = localStorage.getItem(`sleep_${date}`);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Get recent sleep data
   */
  getRecentSleepData(days: number = 7): SleepData[] {
    const data: SleepData[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const sleepData = this.getSleepData(dateStr);
      if (sleepData) {
        data.push({
          ...sleepData,
          bedtime: new Date(sleepData.bedtime),
          wakeTime: new Date(sleepData.wakeTime),
        });
      }
    }

    return data.reverse();
  }

  /**
   * Save sleep data to storage
   */
  private saveSleepData(data: SleepData): void {
    localStorage.setItem(`sleep_${data.date}`, JSON.stringify(data));
    console.log("Sleep data saved:", data);
  }

  /**
   * Load stored data on initialization
   */
  private loadStoredData(): void {
    // Check if there's an active session from yesterday that wasn't completed
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const storedSession = localStorage.getItem(
      `active_session_${yesterdayStr}`
    );
    if (storedSession) {
      this.currentSleepSession = JSON.parse(storedSession);
      if (this.currentSleepSession?.bedtime) {
        this.currentSleepSession.bedtime = new Date(
          this.currentSleepSession.bedtime
        );
      }
    }
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<SleepSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.updateMotionSensitivity();
    localStorage.setItem("sleep_settings", JSON.stringify(this.settings));
  }

  /**
   * Get current settings
   */
  getSettings(): SleepSettings {
    return { ...this.settings };
  }

  /**
   * Get sleep pattern analysis
   */
  getSleepPattern(days: number = 30): SleepPattern | null {
    const recentData = this.getRecentSleepData(days);
    if (recentData.length < 3) return null;

    const weekdayData = recentData.filter((d) => {
      const day = new Date(d.bedtime).getDay();
      return day >= 1 && day <= 5; // Monday to Friday
    });

    const weekendData = recentData.filter((d) => {
      const day = new Date(d.bedtime).getDay();
      return day === 0 || day === 6; // Saturday and Sunday
    });

    const avgBedtime = this.calculateAverageTime(
      recentData.map((d) => d.bedtime)
    );
    const avgWakeTime = this.calculateAverageTime(
      recentData.map((d) => d.wakeTime)
    );
    const avgDuration =
      recentData.reduce((sum, d) => sum + d.duration, 0) / recentData.length;
    const avgQuality =
      recentData.reduce((sum, d) => sum + d.quality, 0) / recentData.length;

    return {
      averageBedtime: avgBedtime,
      averageWakeTime: avgWakeTime,
      averageDuration: avgDuration,
      averageQuality: avgQuality,
      weekdayPattern: weekdayData,
      weekendPattern: weekendData,
      sleepDebtTrend: recentData.slice(-7).map((d) => d.sleepDebt),
    };
  }

  /**
   * Calculate average time from array of dates
   */
  private calculateAverageTime(times: Date[]): Date {
    const totalMinutes = times.reduce((sum, time) => {
      return sum + time.getHours() * 60 + time.getMinutes();
    }, 0);

    const avgMinutes = totalMinutes / times.length;
    const hours = Math.floor(avgMinutes / 60);
    const minutes = Math.floor(avgMinutes % 60);

    return new Date(0, 0, 0, hours, minutes);
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
export const sleepTracker = new SleepTracker();
