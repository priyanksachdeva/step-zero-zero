/**
 * Smart Analytics System - Phase 3.1
 * Provides intelligent insights without complexity
 */

export interface DailyStats {
  date: string;
  steps: number;
  distance: number;
  calories: number;
  activeMinutes: number;
  goalAchieved: boolean;
}

export interface WeeklyPattern {
  dayOfWeek: number; // 0 = Sunday
  averageSteps: number;
  consistencyScore: number; // 0-1
  mostActiveHour: number;
}

export interface AnalyticsInsight {
  type: 'trend' | 'pattern' | 'achievement' | 'recommendation';
  title: string;
  description: string;
  value?: number;
  trend?: 'up' | 'down' | 'stable';
  priority: 'high' | 'medium' | 'low';
}

export class SmartAnalytics {
  private data: DailyStats[] = [];

  constructor(historicalData: DailyStats[] = []) {
    this.data = historicalData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Add new daily data
   */
  addDailyData(stats: DailyStats): void {
    const existingIndex = this.data.findIndex(d => d.date === stats.date);
    if (existingIndex >= 0) {
      this.data[existingIndex] = stats;
    } else {
      this.data.push(stats);
      this.data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  }

  /**
   * Get 7-day moving average
   */
  getSevenDayAverage(endDate?: string): number {
    const end = endDate ? new Date(endDate) : new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 6);

    const relevantData = this.data.filter(d => {
      const date = new Date(d.date);
      return date >= start && date <= end;
    });

    if (relevantData.length === 0) return 0;
    return Math.round(relevantData.reduce((sum, d) => sum + d.steps, 0) / relevantData.length);
  }

  /**
   * Get 30-day moving average
   */
  getThirtyDayAverage(endDate?: string): number {
    const end = endDate ? new Date(endDate) : new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 29);

    const relevantData = this.data.filter(d => {
      const date = new Date(d.date);
      return date >= start && date <= end;
    });

    if (relevantData.length === 0) return 0;
    return Math.round(relevantData.reduce((sum, d) => sum + d.steps, 0) / relevantData.length);
  }

  /**
   * Analyze weekly patterns - identify most/least active days
   */
  getWeeklyPatterns(): WeeklyPattern[] {
    const patterns: WeeklyPattern[] = [];

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const dayData = this.data.filter(d => new Date(d.date).getDay() === dayOfWeek);
      
      if (dayData.length === 0) {
        patterns.push({
          dayOfWeek,
          averageSteps: 0,
          consistencyScore: 0,
          mostActiveHour: 12
        });
        continue;
      }

      const averageSteps = Math.round(
        dayData.reduce((sum, d) => sum + d.steps, 0) / dayData.length
      );

      // Calculate consistency (how close steps are to average)
      const variance = dayData.reduce((sum, d) => sum + Math.pow(d.steps - averageSteps, 2), 0) / dayData.length;
      const stdDev = Math.sqrt(variance);
      const consistencyScore = Math.max(0, 1 - (stdDev / averageSteps));

      patterns.push({
        dayOfWeek,
        averageSteps,
        consistencyScore: Math.min(1, consistencyScore || 0),
        mostActiveHour: 12 // TODO: Implement hourly tracking
      });
    }

    return patterns;
  }

  /**
   * Get current streak of goal achievements
   */
  getCurrentStreak(): number {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayData = this.data.find(d => d.date === dateStr);
      if (dayData && dayData.goalAchieved) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get personal records
   */
  getPersonalRecords() {
    if (this.data.length === 0) {
      return {
        highestSteps: 0,
        highestDistance: 0,
        highestCalories: 0,
        longestStreak: 0,
        mostActiveDay: null
      };
    }

    const highestSteps = Math.max(...this.data.map(d => d.steps));
    const highestDistance = Math.max(...this.data.map(d => d.distance));
    const highestCalories = Math.max(...this.data.map(d => d.calories));
    const mostActiveDay = this.data.find(d => d.steps === highestSteps);

    // Calculate longest streak
    let longestStreak = 0;
    let currentStreak = 0;

    for (const day of this.data) {
      if (day.goalAchieved) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return {
      highestSteps,
      highestDistance: Math.round(highestDistance * 100) / 100,
      highestCalories,
      longestStreak,
      mostActiveDay: mostActiveDay?.date || null
    };
  }

  /**
   * Generate intelligent insights based on data patterns
   */
  generateInsights(): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    if (this.data.length < 7) {
      insights.push({
        type: 'recommendation',
        title: 'KEEP TRACKING',
        description: 'Need 7 days of data for insights',
        priority: 'medium'
      });
      return insights;
    }

    const recent7 = this.getSevenDayAverage();
    const previous7 = this.getSevenDayAverage(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );

    // Trend analysis
    if (recent7 > previous7 * 1.1) {
      insights.push({
        type: 'trend',
        title: 'UPWARD TREND',
        description: `+${Math.round(((recent7 - previous7) / previous7) * 100)}% vs last week`,
        value: recent7,
        trend: 'up',
        priority: 'high'
      });
    } else if (recent7 < previous7 * 0.9) {
      insights.push({
        type: 'trend',
        title: 'ACTIVITY DECREASE',
        description: `${Math.round(((previous7 - recent7) / previous7) * 100)}% below last week`,
        value: recent7,
        trend: 'down',
        priority: 'medium'
      });
    }

    // Weekly patterns
    const patterns = this.getWeeklyPatterns();
    const bestDay = patterns.reduce((max, p) => p.averageSteps > max.averageSteps ? p : max);
    const worstDay = patterns.reduce((min, p) => p.averageSteps < min.averageSteps ? p : min);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (bestDay.averageSteps > worstDay.averageSteps * 1.5) {
      insights.push({
        type: 'pattern',
        title: 'WEEKLY PATTERN',
        description: `Most active on ${dayNames[bestDay.dayOfWeek]}s`,
        value: bestDay.averageSteps,
        priority: 'low'
      });
    }

    // Current streak
    const streak = this.getCurrentStreak();
    if (streak >= 7) {
      insights.push({
        type: 'achievement',
        title: 'GOAL STREAK',
        description: `${streak} days in a row`,
        value: streak,
        priority: 'high'
      });
    }

    // Personal records
    const records = this.getPersonalRecords();
    const today = this.data[this.data.length - 1];
    if (today && today.steps === records.highestSteps) {
      insights.push({
        type: 'achievement',
        title: 'PERSONAL RECORD',
        description: 'New daily step record!',
        value: today.steps,
        priority: 'high'
      });
    }

    return insights.slice(0, 3); // Limit to 3 insights for Nothing minimalism
  }

  /**
   * Calculate recommended daily goal based on recent performance
   */
  getRecommendedGoal(currentGoal: number): number {
    const recent30 = this.getThirtyDayAverage();
    const recent7 = this.getSevenDayAverage();

    if (recent7 === 0) return currentGoal;

    // If consistently exceeding goal, suggest increase
    if (recent7 > currentGoal * 1.2 && recent30 > currentGoal * 1.1) {
      return Math.round(recent7 * 1.1);
    }

    // If struggling with current goal, suggest decrease
    if (recent7 < currentGoal * 0.8 && recent30 < currentGoal * 0.8) {
      return Math.round(recent7 * 1.05);
    }

    // Otherwise, keep current goal
    return currentGoal;
  }

  /**
   * Export analytics data for user
   */
  exportData(): string {
    const summary = {
      totalDays: this.data.length,
      averageSteps: this.getThirtyDayAverage(),
      personalRecords: this.getPersonalRecords(),
      weeklyPatterns: this.getWeeklyPatterns(),
      insights: this.generateInsights(),
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(summary, null, 2);
  }
}

/**
 * Helper function to format insights for UI display
 */
export const formatInsight = (insight: AnalyticsInsight): string => {
  switch (insight.type) {
    case 'trend':
      return `${insight.title}: ${insight.description}`;
    case 'pattern':
      return `${insight.title}: ${insight.description}`;
    case 'achievement':
      return `🎯 ${insight.title}: ${insight.description}`;
    case 'recommendation':
      return `💡 ${insight.title}: ${insight.description}`;
    default:
      return insight.description;
  }
};
