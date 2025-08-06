/**
 * Intelligent Goal Setting System - Phase 3.2
 * Adaptive goals that adjust based on user performance
 */

export interface GoalConfig {
  type: 'steps' | 'distance' | 'calories' | 'activeMinutes';
  value: number;
  unit: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  adaptiveEnabled: boolean;
}

export interface GoalProgress {
  current: number;
  target: number;
  percentage: number;
  status: 'not_started' | 'in_progress' | 'achieved' | 'exceeded';
  timeRemaining?: number; // hours until day ends
}

export interface GoalRecommendation {
  currentGoal: number;
  recommendedGoal: number;
  reasoning: string;
  confidence: number; // 0-1
  adjustmentType: 'increase' | 'decrease' | 'maintain';
}

export class IntelligentGoalManager {
  private goals: Map<string, GoalConfig> = new Map();
  private history: any[] = []; // Will integrate with analytics

  constructor() {
    // Initialize default goals
    this.goals.set('steps', {
      type: 'steps',
      value: 10000,
      unit: 'steps',
      difficulty: 'moderate',
      adaptiveEnabled: true
    });

    this.goals.set('distance', {
      type: 'distance',
      value: 5.0,
      unit: 'km',
      difficulty: 'moderate',
      adaptiveEnabled: true
    });

    this.goals.set('calories', {
      type: 'calories',
      value: 300,
      unit: 'cal',
      difficulty: 'moderate',
      adaptiveEnabled: true
    });

    this.goals.set('activeMinutes', {
      type: 'activeMinutes',
      value: 60,
      unit: 'min',
      difficulty: 'moderate',
      adaptiveEnabled: true
    });
  }

  /**
   * Get current goal configuration
   */
  getGoal(type: string): GoalConfig | null {
    return this.goals.get(type) || null;
  }

  /**
   * Update goal configuration
   */
  setGoal(type: string, config: Partial<GoalConfig>): void {
    const existing = this.goals.get(type);
    if (existing) {
      this.goals.set(type, { ...existing, ...config });
    }
  }

  /**
   * Calculate current progress for a goal
   */
  calculateProgress(type: string, currentValue: number): GoalProgress {
    const goal = this.goals.get(type);
    if (!goal) {
      return {
        current: 0,
        target: 0,
        percentage: 0,
        status: 'not_started'
      };
    }

    const percentage = Math.min(100, (currentValue / goal.value) * 100);
    let status: GoalProgress['status'] = 'not_started';

    if (currentValue === 0) {
      status = 'not_started';
    } else if (currentValue >= goal.value) {
      status = currentValue > goal.value * 1.2 ? 'exceeded' : 'achieved';
    } else {
      status = 'in_progress';
    }

    // Calculate time remaining in day
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const timeRemaining = Math.max(0, Math.floor((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60)));

    return {
      current: currentValue,
      target: goal.value,
      percentage: Math.round(percentage),
      status,
      timeRemaining
    };
  }

  /**
   * Generate adaptive goal recommendations based on performance
   */
  generateRecommendation(type: string, recentPerformance: number[]): GoalRecommendation {
    const goal = this.goals.get(type);
    if (!goal || recentPerformance.length === 0) {
      return {
        currentGoal: goal?.value || 0,
        recommendedGoal: goal?.value || 0,
        reasoning: 'Insufficient data for recommendation',
        confidence: 0,
        adjustmentType: 'maintain'
      };
    }

    const currentGoal = goal.value;
    const averagePerformance = recentPerformance.reduce((sum, val) => sum + val, 0) / recentPerformance.length;
    const achievementRate = recentPerformance.filter(val => val >= currentGoal).length / recentPerformance.length;
    
    // Calculate performance consistency
    const variance = recentPerformance.reduce((sum, val) => sum + Math.pow(val - averagePerformance, 2), 0) / recentPerformance.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 1 - (stdDev / averagePerformance));

    let recommendedGoal = currentGoal;
    let reasoning = '';
    let adjustmentType: 'increase' | 'decrease' | 'maintain' = 'maintain';
    let confidence = 0;

    // Algorithm for goal adjustment
    if (achievementRate >= 0.8 && averagePerformance > currentGoal * 1.1 && consistencyScore > 0.6) {
      // Consistently exceeding goal - increase
      const increasePercentage = Math.min(0.2, (averagePerformance - currentGoal) / currentGoal);
      recommendedGoal = Math.round(currentGoal * (1 + increasePercentage));
      reasoning = `Consistently exceeding goal (${Math.round(achievementRate * 100)}% success rate)`;
      adjustmentType = 'increase';
      confidence = Math.min(0.9, consistencyScore + 0.3);
    } else if (achievementRate < 0.4 && averagePerformance < currentGoal * 0.8) {
      // Struggling with current goal - decrease
      const decreasePercentage = Math.min(0.3, (currentGoal - averagePerformance) / currentGoal);
      recommendedGoal = Math.round(currentGoal * (1 - decreasePercentage * 0.7)); // More conservative decrease
      reasoning = `Goal may be too challenging (${Math.round(achievementRate * 100)}% success rate)`;
      adjustmentType = 'decrease';
      confidence = Math.min(0.8, (1 - achievementRate) + 0.2);
    } else if (achievementRate >= 0.5 && achievementRate < 0.8) {
      // Good balance - maintain
      reasoning = `Current goal provides good challenge (${Math.round(achievementRate * 100)}% success rate)`;
      adjustmentType = 'maintain';
      confidence = 0.7;
    } else {
      // Insufficient or inconsistent data
      reasoning = 'More data needed for reliable recommendation';
      confidence = 0.3;
    }

    // Apply difficulty preference
    switch (goal.difficulty) {
      case 'easy':
        if (adjustmentType === 'increase') {
          recommendedGoal = Math.round(recommendedGoal * 0.9); // Smaller increases
        }
        break;
      case 'challenging':
        if (adjustmentType === 'decrease') {
          recommendedGoal = Math.round(recommendedGoal * 1.1); // Smaller decreases
        }
        break;
    }

    return {
      currentGoal,
      recommendedGoal,
      reasoning,
      confidence,
      adjustmentType
    };
  }

  /**
   * Auto-adjust goals based on day of week patterns
   */
  getContextualGoal(type: string, dayOfWeek: number, weatherCondition?: string): number {
    const baseGoal = this.goals.get(type)?.value || 0;

    // Weekend adjustments (0 = Sunday, 6 = Saturday)
    let modifier = 1.0;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekends - potentially more time for activity
      modifier = 1.1;
    } else if (dayOfWeek === 1) {
      // Monday - fresh start motivation
      modifier = 1.05;
    } else if (dayOfWeek === 5) {
      // Friday - end of week fatigue
      modifier = 0.95;
    }

    // Weather adjustments (if provided)
    if (weatherCondition) {
      switch (weatherCondition.toLowerCase()) {
        case 'rain':
        case 'snow':
        case 'storm':
          modifier *= 0.8;
          break;
        case 'sunny':
        case 'clear':
          modifier *= 1.1;
          break;
        case 'cloudy':
        default:
          // No adjustment
          break;
      }
    }

    return Math.round(baseGoal * modifier);
  }

  /**
   * Generate motivational goal message
   */
  getGoalMessage(progress: GoalProgress): string {
    const { percentage, status, timeRemaining } = progress;

    switch (status) {
      case 'not_started':
        return 'Ready to start your day?';
      
      case 'in_progress':
        if (percentage < 25) {
          return `${percentage}% - Keep moving forward`;
        } else if (percentage < 50) {
          return `${percentage}% - Building momentum`;
        } else if (percentage < 75) {
          return `${percentage}% - Over halfway there`;
        } else {
          return `${percentage}% - Almost at your goal`;
        }
      
      case 'achieved':
        return 'Goal achieved! 🎯';
      
      case 'exceeded':
        return `${percentage}% - Exceptional performance`;
      
      default:
        return 'Keep going';
    }
  }

  /**
   * Calculate estimated time to goal completion
   */
  estimateTimeToGoal(progress: GoalProgress, recentPace: number): string {
    if (progress.status === 'achieved' || progress.status === 'exceeded') {
      return 'Goal completed';
    }

    if (recentPace <= 0 || !progress.timeRemaining) {
      return 'Keep moving to estimate';
    }

    const remaining = progress.target - progress.current;
    const hoursNeeded = remaining / recentPace;

    if (hoursNeeded <= progress.timeRemaining) {
      if (hoursNeeded < 1) {
        return `~${Math.round(hoursNeeded * 60)} minutes to goal`;
      } else {
        return `~${Math.round(hoursNeeded)} hours to goal`;
      }
    } else {
      return 'Goal challenging for today';
    }
  }

  /**
   * Export goals configuration
   */
  exportGoals(): string {
    const goalsObject = Object.fromEntries(this.goals);
    return JSON.stringify(goalsObject, null, 2);
  }

  /**
   * Import goals configuration
   */
  importGoals(goalsJson: string): boolean {
    try {
      const goalsObject = JSON.parse(goalsJson);
      this.goals.clear();
      
      for (const [key, value] of Object.entries(goalsObject)) {
        this.goals.set(key, value as GoalConfig);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import goals:', error);
      return false;
    }
  }
}

/**
 * Helper function to format goal progress for UI
 */
export const formatGoalProgress = (progress: GoalProgress, type: string): string => {
  const unit = type === 'steps' ? '' : 
               type === 'distance' ? 'km' :
               type === 'calories' ? 'cal' : 'min';
  
  return `${progress.current.toLocaleString()}${unit} / ${progress.target.toLocaleString()}${unit}`;
};

/**
 * Helper function to get appropriate goal icon
 */
export const getGoalIcon = (type: string): string => {
  switch (type) {
    case 'steps': return '👣';
    case 'distance': return '📍';
    case 'calories': return '🔥';
    case 'activeMinutes': return '⏱️';
    default: return '🎯';
  }
};
