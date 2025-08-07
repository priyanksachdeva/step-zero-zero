/**
 * Enhanced Activity Detection System - Phase 1.1
 * Nothing-Style Health App - Activity Expansion
 * Detects walking, running, floors climbed, and calculates enhanced metrics
 */

export interface ActivityData {
  steps: number;
  distance: number; // kilometers
  calories: number;
  activeMinutes: number;
  floorsClimbed: number;
  activityType: "walking" | "running" | "stationary" | "unknown";
  intensity: "light" | "moderate" | "vigorous";
  pace: number; // steps per minute
}

export interface ActivitySession {
  startTime: Date;
  endTime: Date;
  activityType: "walking" | "running" | "stationary";
  steps: number;
  distance: number;
  duration: number; // minutes
  avgPace: number;
  maxPace: number;
  calories: number;
  intensity: "light" | "moderate" | "vigorous";
}

export interface UserProfile {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: "male" | "female" | "other";
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  strideLength: number; // cm
}

export class EnhancedActivityDetector {
  private stepHistory: { timestamp: number; steps: number }[] = [];
  private motionHistory: {
    timestamp: number;
    magnitude: number;
    elevation?: number;
  }[] = [];
  private currentSession: ActivitySession | null = null;
  private userProfile: UserProfile;
  private lastElevation: number = 0;
  private elevationGain: number = 0;

  constructor(userProfile: UserProfile) {
    this.userProfile = userProfile;
  }

  /**
   * Process new step data and motion information
   */
  processStepData(
    steps: number,
    motionMagnitude: number,
    elevation?: number
  ): ActivityData {
    const now = Date.now();

    // Add to history
    this.stepHistory.push({ timestamp: now, steps });
    this.motionHistory.push({
      timestamp: now,
      magnitude: motionMagnitude,
      elevation,
    });

    // Keep only last 10 minutes of data
    const cutoff = now - 10 * 60 * 1000;
    this.stepHistory = this.stepHistory.filter(
      (entry) => entry.timestamp > cutoff
    );
    this.motionHistory = this.motionHistory.filter(
      (entry) => entry.timestamp > cutoff
    );

    // Calculate metrics
    const activityType = this.detectActivityType();
    const pace = this.calculatePace();
    const intensity = this.calculateIntensity(pace, motionMagnitude);
    const distance = this.calculateDistance(steps);
    const calories = this.calculateCalories(steps, intensity, activityType);
    const activeMinutes = this.calculateActiveMinutes();
    const floorsClimbed = this.calculateFloorsClimbed(elevation);

    // Update current session
    this.updateActivitySession(activityType, steps, pace, intensity);

    return {
      steps,
      distance,
      calories,
      activeMinutes,
      floorsClimbed,
      activityType,
      intensity,
      pace,
    };
  }

  /**
   * Detect activity type based on step patterns and motion data
   */
  private detectActivityType():
    | "walking"
    | "running"
    | "stationary"
    | "unknown" {
    if (this.stepHistory.length < 2) return "unknown";

    const recentSteps = this.stepHistory.slice(-5); // Last 5 entries
    const recentMotion = this.motionHistory.slice(-5);

    // Calculate step frequency (steps per minute)
    const timeSpan =
      (recentSteps[recentSteps.length - 1].timestamp -
        recentSteps[0].timestamp) /
      1000 /
      60;
    const stepDiff =
      recentSteps[recentSteps.length - 1].steps - recentSteps[0].steps;
    const stepsPerMinute = timeSpan > 0 ? stepDiff / timeSpan : 0;

    // Calculate motion intensity
    const avgMotion =
      recentMotion.reduce((sum, entry) => sum + entry.magnitude, 0) /
      recentMotion.length;

    // Detect activity type
    if (stepsPerMinute < 10) {
      return "stationary";
    } else if (stepsPerMinute < 100 && avgMotion < 2.0) {
      return "walking";
    } else if (stepsPerMinute >= 100 && avgMotion >= 2.0) {
      return "running";
    }

    return "walking"; // Default to walking
  }

  /**
   * Calculate current pace (steps per minute)
   */
  private calculatePace(): number {
    if (this.stepHistory.length < 2) return 0;

    const recent = this.stepHistory.slice(-3); // Last 3 entries
    const timeSpan =
      (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000 / 60;
    const stepDiff = recent[recent.length - 1].steps - recent[0].steps;

    return timeSpan > 0 ? stepDiff / timeSpan : 0;
  }

  /**
   * Calculate activity intensity based on pace and motion
   */
  private calculateIntensity(
    pace: number,
    motionMagnitude: number
  ): "light" | "moderate" | "vigorous" {
    // Intensity based on steps per minute and motion magnitude
    if (pace < 80 && motionMagnitude < 1.5) {
      return "light";
    } else if (pace < 120 && motionMagnitude < 2.5) {
      return "moderate";
    } else {
      return "vigorous";
    }
  }

  /**
   * Calculate distance based on steps and stride length
   */
  private calculateDistance(steps: number): number {
    // Distance in kilometers
    return (steps * this.userProfile.strideLength) / 100000;
  }

  /**
   * Calculate calories burned with enhanced accuracy
   */
  private calculateCalories(
    steps: number,
    intensity: "light" | "moderate" | "vigorous",
    activityType: string
  ): number {
    const { weight, age, gender } = this.userProfile;

    // Base metabolic rate calculation (Mifflin-St Jeor Equation)
    let bmr: number;
    if (gender === "male") {
      bmr = (10 * weight + 6.25 * this.userProfile.height - 5 * age + 5) / 1440; // per minute
    } else {
      bmr =
        (10 * weight + 6.25 * this.userProfile.height - 5 * age - 161) / 1440; // per minute
    }

    // Activity multipliers
    let activityMultiplier: number;
    switch (intensity) {
      case "light":
        activityMultiplier = activityType === "walking" ? 3.0 : 2.5;
        break;
      case "moderate":
        activityMultiplier =
          activityType === "walking"
            ? 4.0
            : activityType === "running"
            ? 6.0
            : 3.5;
        break;
      case "vigorous":
        activityMultiplier = activityType === "running" ? 8.0 : 6.0;
        break;
    }

    // Calculate calories per step
    const caloriesPerStep = (bmr * activityMultiplier) / 120; // Assuming 120 steps per minute average

    return Math.round(steps * caloriesPerStep);
  }

  /**
   * Calculate active minutes based on intensity and pace
   */
  private calculateActiveMinutes(): number {
    if (this.motionHistory.length === 0) return 0;

    let activeCount = 0;
    const recentMotion = this.motionHistory.slice(-10); // Last 10 minutes

    for (const entry of recentMotion) {
      // Consider active if motion magnitude > 1.0 (moderate movement)
      if (entry.magnitude > 1.0) {
        activeCount++;
      }
    }

    return activeCount; // Approximate minutes of activity
  }

  /**
   * Calculate floors climbed using elevation data
   */
  private calculateFloorsClimbed(currentElevation?: number): number {
    if (!currentElevation) return 0;

    const elevationChange = currentElevation - this.lastElevation;

    // Only count upward movement
    if (elevationChange > 0) {
      this.elevationGain += elevationChange;
    }

    this.lastElevation = currentElevation;

    // One floor = approximately 3 meters elevation gain
    return Math.floor(this.elevationGain / 3);
  }

  /**
   * Update or create activity session
   */
  private updateActivitySession(
    activityType: "walking" | "running" | "stationary" | "unknown",
    totalSteps: number,
    pace: number,
    intensity: "light" | "moderate" | "vigorous"
  ): void {
    const now = new Date();

    if (activityType === "stationary" || activityType === "unknown") {
      // End current session if activity stopped
      if (this.currentSession) {
        this.currentSession.endTime = now;
        this.currentSession = null;
      }
      return;
    }

    if (
      !this.currentSession ||
      this.currentSession.activityType !== activityType
    ) {
      // Start new session
      this.currentSession = {
        startTime: now,
        endTime: now,
        activityType: activityType as "walking" | "running" | "stationary",
        steps: totalSteps,
        distance: this.calculateDistance(totalSteps),
        duration: 0,
        avgPace: pace,
        maxPace: pace,
        calories: 0,
        intensity,
      };
    } else {
      // Update existing session
      this.currentSession.endTime = now;
      this.currentSession.duration =
        (now.getTime() - this.currentSession.startTime.getTime()) / 1000 / 60;
      this.currentSession.maxPace = Math.max(this.currentSession.maxPace, pace);

      // Update average pace
      const sessionSteps = totalSteps - this.currentSession.steps;
      this.currentSession.avgPace =
        sessionSteps / Math.max(this.currentSession.duration, 1);

      this.currentSession.distance = this.calculateDistance(totalSteps);
      this.currentSession.calories = this.calculateCalories(
        sessionSteps,
        intensity,
        activityType
      );
    }
  }

  /**
   * Get current activity session
   */
  getCurrentSession(): ActivitySession | null {
    return this.currentSession;
  }

  /**
   * Get activity summary for time period
   */
  getActivitySummary(timeframe: "today" | "week" | "month"): {
    totalSteps: number;
    totalDistance: number;
    totalCalories: number;
    totalActiveMinutes: number;
    totalFloorsClimbed: number;
    sessionsCount: number;
    averagePace: number;
  } {
    // This would integrate with data persistence to get historical data
    // For now, return current session data
    const session = this.currentSession;

    if (!session) {
      return {
        totalSteps: 0,
        totalDistance: 0,
        totalCalories: 0,
        totalActiveMinutes: 0,
        totalFloorsClimbed: 0,
        sessionsCount: 0,
        averagePace: 0,
      };
    }

    return {
      totalSteps: session.steps,
      totalDistance: session.distance,
      totalCalories: session.calories,
      totalActiveMinutes: session.duration,
      totalFloorsClimbed: this.calculateFloorsClimbed(),
      sessionsCount: 1,
      averagePace: session.avgPace,
    };
  }

  /**
   * Update user profile
   */
  updateUserProfile(profile: Partial<UserProfile>): void {
    this.userProfile = { ...this.userProfile, ...profile };
  }

  /**
   * Reset daily counters (call at midnight)
   */
  resetDailyCounters(): void {
    this.elevationGain = 0;
    this.currentSession = null;
    this.stepHistory = [];
    this.motionHistory = [];
  }

  /**
   * Get current activity metrics in Nothing-style format
   */
  getNothingStyleMetrics(): {
    primary: {
      label: string;
      value: string;
      unit: string;
      trend?: "up" | "down" | "neutral";
    };
    secondary: { label: string; value: string; unit: string }[];
  } {
    const summary = this.getActivitySummary("today");
    const session = this.getCurrentSession();

    return {
      primary: {
        label: "ACTIVITY",
        value: session?.activityType.toUpperCase() || "STATIONARY",
        unit: session ? `${Math.round(session.avgPace)} SPM` : "",
        trend: session ? "up" : "neutral",
      },
      secondary: [
        {
          label: "DISTANCE",
          value: summary.totalDistance.toFixed(1),
          unit: "KM",
        },
        {
          label: "CALORIES",
          value: summary.totalCalories.toString(),
          unit: "KCAL",
        },
        {
          label: "FLOORS",
          value: summary.totalFloorsClimbed.toString(),
          unit: "FL",
        },
        {
          label: "ACTIVE",
          value: Math.round(summary.totalActiveMinutes).toString(),
          unit: "MIN",
        },
      ],
    };
  }
}
