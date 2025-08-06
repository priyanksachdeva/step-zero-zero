/**
 * Health Insights System - Phase 3.3
 * Walking pace, calorie estimation, distance tracking, and activity analysis
 */

export interface UserProfile {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female' | 'other';
  strideLength?: number; // meters, calculated if not provided
}

export interface ActivitySession {
  startTime: Date;
  endTime: Date;
  steps: number;
  distance: number;
  averagePace: number; // steps per minute
  calories: number;
  activityType: 'walking' | 'running' | 'stationary' | 'unknown';
}

export interface HealthMetrics {
  totalSteps: number;
  totalDistance: number; // km
  totalCalories: number;
  activeMinutes: number;
  averagePace: number; // steps per minute
  restingMinutes: number;
  walkingEfficiency: number; // 0-1 score
}

export interface HealthInsight {
  category: 'pace' | 'calories' | 'distance' | 'activity' | 'efficiency';
  title: string;
  description: string;
  value: number;
  unit: string;
  recommendation?: string;
  trend?: 'improving' | 'declining' | 'stable';
}

export class HealthInsightsEngine {
  private userProfile: UserProfile;
  private activitySessions: ActivitySession[] = [];
  private dailyMetrics: HealthMetrics[] = [];

  constructor(profile: UserProfile) {
    this.userProfile = profile;
    
    // Calculate stride length if not provided
    if (!profile.strideLength) {
      this.userProfile.strideLength = this.calculateStrideLength(profile.height, profile.gender);
    }
  }

  /**
   * Calculate stride length based on height and gender
   */
  private calculateStrideLength(height: number, gender: string): number {
    // Average stride length formulas
    const heightInMeters = height / 100;
    
    switch (gender) {
      case 'male':
        return heightInMeters * 0.415; // Male average
      case 'female':
        return heightInMeters * 0.413; // Female average
      default:
        return heightInMeters * 0.414; // Average
    }
  }

  /**
   * Calculate walking pace from step data
   */
  calculateWalkingPace(steps: number, timeMinutes: number): number {
    if (timeMinutes === 0) return 0;
    return Math.round(steps / timeMinutes);
  }

  /**
   * Estimate calories burned based on steps, user profile, and pace
   */
  estimateCalories(steps: number, averagePace: number): number {
    const { weight, height, age, gender } = this.userProfile;
    
    // Base metabolic rate (BMR) calculation
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // MET (Metabolic Equivalent) based on pace
    let met: number;
    if (averagePace < 70) {
      met = 2.0; // Slow walk
    } else if (averagePace < 100) {
      met = 3.0; // Moderate walk
    } else if (averagePace < 130) {
      met = 3.8; // Brisk walk
    } else {
      met = 5.0; // Fast walk/light jog
    }

    // Calories per minute
    const caloriesPerMinute = (met * weight * 3.5) / 200;
    
    // Estimate time spent walking (assuming average pace)
    const estimatedMinutes = steps / Math.max(averagePace, 1);
    
    return Math.round(caloriesPerMinute * estimatedMinutes);
  }

  /**
   * Calculate distance based on steps and stride length
   */
  calculateDistance(steps: number): number {
    const strideLength = this.userProfile.strideLength || 0.7;
    return (steps * strideLength) / 1000; // Convert to km
  }

  /**
   * Analyze activity patterns to determine activity type
   */
  analyzeActivityType(stepData: { steps: number; timestamp: Date }[]): 'walking' | 'running' | 'stationary' | 'unknown' {
    if (stepData.length < 2) return 'unknown';

    // Calculate pace between data points
    const paces: number[] = [];
    for (let i = 1; i < stepData.length; i++) {
      const timeDiff = (stepData[i].timestamp.getTime() - stepData[i-1].timestamp.getTime()) / (1000 * 60); // minutes
      const stepDiff = stepData[i].steps - stepData[i-1].steps;
      if (timeDiff > 0) {
        paces.push(stepDiff / timeDiff);
      }
    }

    if (paces.length === 0) return 'stationary';

    const avgPace = paces.reduce((sum, pace) => sum + pace, 0) / paces.length;

    if (avgPace < 10) return 'stationary';
    if (avgPace < 120) return 'walking';
    return 'running';
  }

  /**
   * Calculate walking efficiency score
   */
  calculateWalkingEfficiency(steps: number, distance: number, time: number): number {
    if (steps === 0 || time === 0) return 0;

    const pace = steps / time; // steps per minute
    const speed = distance / (time / 60); // km/h
    
    // Optimal walking parameters
    const optimalPace = 100; // steps per minute
    const optimalSpeed = 5; // km/h
    
    // Calculate efficiency as proximity to optimal values
    const paceEfficiency = 1 - Math.abs(pace - optimalPace) / optimalPace;
    const speedEfficiency = 1 - Math.abs(speed - optimalSpeed) / optimalSpeed;
    
    return Math.max(0, Math.min(1, (paceEfficiency + speedEfficiency) / 2));
  }

  /**
   * Process daily activity data and generate health metrics
   */
  processDailyActivity(stepData: { steps: number; timestamp: Date }[]): HealthMetrics {
    if (stepData.length === 0) {
      return {
        totalSteps: 0,
        totalDistance: 0,
        totalCalories: 0,
        activeMinutes: 0,
        averagePace: 0,
        restingMinutes: 0,
        walkingEfficiency: 0
      };
    }

    const totalSteps = stepData[stepData.length - 1].steps;
    const totalDistance = this.calculateDistance(totalSteps);
    
    // Calculate active vs resting time
    let activeMinutes = 0;
    let lastActiveTime = stepData[0].timestamp;
    
    for (let i = 1; i < stepData.length; i++) {
      const timeDiff = (stepData[i].timestamp.getTime() - stepData[i-1].timestamp.getTime()) / (1000 * 60);
      const stepDiff = stepData[i].steps - stepData[i-1].steps;
      
      if (stepDiff > 0) {
        activeMinutes += timeDiff;
        lastActiveTime = stepData[i].timestamp;
      }
    }

    const averagePace = activeMinutes > 0 ? totalSteps / activeMinutes : 0;
    const totalCalories = this.estimateCalories(totalSteps, averagePace);
    
    const totalTime = (stepData[stepData.length - 1].timestamp.getTime() - stepData[0].timestamp.getTime()) / (1000 * 60);
    const restingMinutes = Math.max(0, totalTime - activeMinutes);
    
    const walkingEfficiency = this.calculateWalkingEfficiency(totalSteps, totalDistance, activeMinutes);

    return {
      totalSteps,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalCalories,
      activeMinutes: Math.round(activeMinutes),
      averagePace: Math.round(averagePace),
      restingMinutes: Math.round(restingMinutes),
      walkingEfficiency: Math.round(walkingEfficiency * 100) / 100
    };
  }

  /**
   * Generate health insights based on recent activity
   */
  generateHealthInsights(recentMetrics: HealthMetrics[]): HealthInsight[] {
    const insights: HealthInsight[] = [];

    if (recentMetrics.length === 0) {
      return [{
        category: 'activity',
        title: 'START TRACKING',
        description: 'Begin your health journey',
        value: 0,
        unit: 'days',
        recommendation: 'Start with 5,000 steps daily'
      }];
    }

    const latest = recentMetrics[recentMetrics.length - 1];
    const average = this.calculateAverageMetrics(recentMetrics);

    // Pace analysis
    if (latest.averagePace > 0) {
      let paceCategory = 'Leisurely';
      let paceRecommendation = '';

      if (latest.averagePace < 70) {
        paceCategory = 'Leisurely';
        paceRecommendation = 'Try to increase pace gradually for better cardiovascular benefits';
      } else if (latest.averagePace < 100) {
        paceCategory = 'Moderate';
        paceRecommendation = 'Good pace for general health and fitness';
      } else if (latest.averagePace < 130) {
        paceCategory = 'Brisk';
        paceRecommendation = 'Excellent pace for cardiovascular health';
      } else {
        paceCategory = 'Fast';
        paceRecommendation = 'High-intensity pace - ensure adequate recovery';
      }

      insights.push({
        category: 'pace',
        title: `${paceCategory.toUpperCase()} PACE`,
        description: `${latest.averagePace} steps/minute`,
        value: latest.averagePace,
        unit: 'steps/min',
        recommendation: paceRecommendation,
        trend: this.calculateTrend(recentMetrics.map(m => m.averagePace))
      });
    }

    // Calorie efficiency
    if (latest.totalSteps > 0) {
      const caloriesPerStep = latest.totalCalories / latest.totalSteps;
      const efficiency = caloriesPerStep > 0.04 ? 'HIGH' : caloriesPerStep > 0.03 ? 'MODERATE' : 'LOW';
      
      insights.push({
        category: 'calories',
        title: `${efficiency} CALORIE BURN`,
        description: `${Math.round(caloriesPerStep * 1000)} cal per 1000 steps`,
        value: latest.totalCalories,
        unit: 'calories',
        recommendation: efficiency === 'LOW' ? 'Try walking at a brisker pace or include inclines' : 'Great calorie efficiency'
      });
    }

    // Activity consistency
    const activeMinutesPercentage = (latest.activeMinutes / (latest.activeMinutes + latest.restingMinutes)) * 100;
    if (activeMinutesPercentage > 0) {
      insights.push({
        category: 'activity',
        title: 'ACTIVITY RATIO',
        description: `${Math.round(activeMinutesPercentage)}% of tracked time active`,
        value: latest.activeMinutes,
        unit: 'minutes',
        recommendation: activeMinutesPercentage < 15 ? 'Try to increase active time throughout the day' : 'Good activity distribution'
      });
    }

    // Walking efficiency
    if (latest.walkingEfficiency > 0) {
      const efficiencyScore = Math.round(latest.walkingEfficiency * 100);
      insights.push({
        category: 'efficiency',
        title: 'WALKING EFFICIENCY',
        description: `${efficiencyScore}% optimal form`,
        value: efficiencyScore,
        unit: '%',
        recommendation: efficiencyScore < 70 ? 'Focus on consistent pace and stride length' : 'Excellent walking form'
      });
    }

    // Distance achievements
    if (latest.totalDistance > 0) {
      const kmRounded = Math.round(latest.totalDistance * 10) / 10;
      insights.push({
        category: 'distance',
        title: 'DISTANCE COVERED',
        description: `${kmRounded}km today`,
        value: kmRounded,
        unit: 'km',
        recommendation: kmRounded < 3 ? 'Aim for at least 3-5km daily' : 'Great distance coverage'
      });
    }

    return insights.slice(0, 4); // Limit for Nothing minimalism
  }

  /**
   * Calculate average metrics from array
   */
  private calculateAverageMetrics(metrics: HealthMetrics[]): HealthMetrics {
    if (metrics.length === 0) {
      return {
        totalSteps: 0,
        totalDistance: 0,
        totalCalories: 0,
        activeMinutes: 0,
        averagePace: 0,
        restingMinutes: 0,
        walkingEfficiency: 0
      };
    }

    const totals = metrics.reduce((acc, metric) => ({
      totalSteps: acc.totalSteps + metric.totalSteps,
      totalDistance: acc.totalDistance + metric.totalDistance,
      totalCalories: acc.totalCalories + metric.totalCalories,
      activeMinutes: acc.activeMinutes + metric.activeMinutes,
      averagePace: acc.averagePace + metric.averagePace,
      restingMinutes: acc.restingMinutes + metric.restingMinutes,
      walkingEfficiency: acc.walkingEfficiency + metric.walkingEfficiency
    }), {
      totalSteps: 0,
      totalDistance: 0,
      totalCalories: 0,
      activeMinutes: 0,
      averagePace: 0,
      restingMinutes: 0,
      walkingEfficiency: 0
    });

    const count = metrics.length;
    return {
      totalSteps: Math.round(totals.totalSteps / count),
      totalDistance: Math.round((totals.totalDistance / count) * 100) / 100,
      totalCalories: Math.round(totals.totalCalories / count),
      activeMinutes: Math.round(totals.activeMinutes / count),
      averagePace: Math.round(totals.averagePace / count),
      restingMinutes: Math.round(totals.restingMinutes / count),
      walkingEfficiency: Math.round((totals.walkingEfficiency / count) * 100) / 100
    };
  }

  /**
   * Calculate trend direction from array of values
   */
  private calculateTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 3) return 'stable';

    const recent = values.slice(-3);
    const earlier = values.slice(-6, -3);
    
    if (earlier.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length;

    const change = (recentAvg - earlierAvg) / earlierAvg;

    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  /**
   * Update user profile
   */
  updateProfile(profile: Partial<UserProfile>): void {
    this.userProfile = { ...this.userProfile, ...profile };
    
    // Recalculate stride length if height or gender changed
    if (profile.height || profile.gender) {
      this.userProfile.strideLength = this.calculateStrideLength(
        this.userProfile.height, 
        this.userProfile.gender
      );
    }
  }

  /**
   * Get user profile
   */
  getProfile(): UserProfile {
    return { ...this.userProfile };
  }

  /**
   * Export health data
   */
  exportHealthData(): string {
    return JSON.stringify({
      profile: this.userProfile,
      metrics: this.dailyMetrics,
      sessions: this.activitySessions,
      exportDate: new Date().toISOString()
    }, null, 2);
  }
}
