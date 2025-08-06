/**
 * Analytics Dashboard Component - Phase 3.1 & 3.2
 * Smart analytics and insights with Nothing-style design
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Calendar, Award, BarChart3 } from 'lucide-react';
import { SmartAnalytics, AnalyticsInsight, DailyStats } from '../lib/analytics';
import { IntelligentGoalManager, GoalProgress, GoalRecommendation } from '../lib/goalManager';

interface AnalyticsDashboardProps {
  currentSteps: number;
  dailyGoal: number;
  onGoalUpdate?: (newGoal: number) => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  currentSteps,
  dailyGoal,
  onGoalUpdate
}) => {
  const [analytics] = useState(() => new SmartAnalytics());
  const [goalManager] = useState(() => new IntelligentGoalManager());
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [goalProgress, setGoalProgress] = useState<GoalProgress>({ 
    current: 0, target: 0, percentage: 0, status: 'not_started' 
  });
  const [recommendation, setRecommendation] = useState<GoalRecommendation | null>(null);
  const [weeklyData, setWeeklyData] = useState<DailyStats[]>([]);
  const [personalRecords, setPersonalRecords] = useState<any>(null);

  useEffect(() => {
    // Initialize with some sample data for demonstration
    const sampleData: DailyStats[] = [];
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const baseSteps = 8000 + Math.random() * 4000;
      const steps = Math.round(baseSteps + (Math.random() - 0.5) * 2000);
      
      sampleData.push({
        date: date.toISOString().split('T')[0],
        steps: Math.max(0, steps),
        distance: steps * 0.0008, // ~0.8m per step
        calories: Math.round(steps * 0.04), // ~0.04 cal per step
        activeMinutes: Math.round(steps / 100), // ~100 steps per minute
        goalAchieved: steps >= dailyGoal
      });
    }

    // Add current day data
    const todayData: DailyStats = {
      date: today.toISOString().split('T')[0],
      steps: currentSteps,
      distance: currentSteps * 0.0008,
      calories: Math.round(currentSteps * 0.04),
      activeMinutes: Math.round(currentSteps / 100),
      goalAchieved: currentSteps >= dailyGoal
    };

    sampleData.forEach(data => analytics.addDailyData(data));
    analytics.addDailyData(todayData);

    // Update state
    setInsights(analytics.generateInsights());
    setGoalProgress(goalManager.calculateProgress('steps', currentSteps));
    setWeeklyData(sampleData.slice(-7));
    setPersonalRecords(analytics.getPersonalRecords());

    // Generate goal recommendation
    const recentPerformance = sampleData.slice(-7).map(d => d.steps);
    const rec = goalManager.generateRecommendation('steps', recentPerformance);
    setRecommendation(rec);

  }, [currentSteps, dailyGoal, analytics, goalManager]);

  const handleGoalAdjustment = () => {
    if (recommendation && onGoalUpdate) {
      onGoalUpdate(recommendation.recommendedGoal);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'pattern': return <BarChart3 className="w-4 h-4" />;
      case 'achievement': return <Award className="w-4 h-4" />;
      case 'recommendation': return <Target className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-success" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-destructive" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Progress Overview */}
      <div className="glass-medium p-6 border-radius-2">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="tech-label text-accent mb-1">TODAY'S PROGRESS</div>
            <div className="font-display text-3xl">
              {goalProgress.percentage}%
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-lg text-muted-foreground">
              {goalProgress.current.toLocaleString()}
            </div>
            <div className="tech-label">OF {goalProgress.target.toLocaleString()}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="week-bar mb-2">
          <div 
            className="week-bar-fill" 
            style={{ width: `${Math.min(100, goalProgress.percentage)}%` }}
          />
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          {goalManager.getGoalMessage(goalProgress)}
        </div>
      </div>

      {/* Analytics Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <div className="tech-label text-accent">INSIGHTS</div>
          {insights.map((insight, index) => (
            <div key={index} className="glass p-4">
              <div className="flex items-start space-x-3">
                <div className="text-accent mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-technical text-sm">{insight.title}</span>
                    {getTrendIcon(insight.trend)}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {insight.description}
                  </div>
                  {insight.value && (
                    <div className="font-display text-lg mt-1">
                      {insight.value.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Pattern Visualization */}
      <div className="space-y-3">
        <div className="tech-label text-accent">7-DAY PATTERN</div>
        <div className="glass p-4">
          {weeklyData.map((day, index) => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en', { weekday: 'short' }).toUpperCase();
            const isToday = date.toDateString() === new Date().toDateString();
            const progress = Math.min(100, (day.steps / dailyGoal) * 100);
            
            return (
              <div key={day.date} className="flex items-center space-x-3 mb-3 last:mb-0">
                <div className={`font-technical text-xs w-8 ${isToday ? 'text-accent' : 'text-muted-foreground'}`}>
                  {dayName}
                </div>
                <div className="flex-1">
                  <div className="week-bar">
                    <div 
                      className={`week-bar-fill ${isToday ? 'today' : ''}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="font-display text-sm w-16 text-right">
                  {(day.steps / 1000).toFixed(1)}K
                </div>
                {day.goalAchieved && (
                  <div className="text-success text-xs">●</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Records */}
      {personalRecords && (
        <div className="space-y-3">
          <div className="tech-label text-accent">PERSONAL RECORDS</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass p-4 text-center">
              <div className="font-display text-2xl">
                {(personalRecords.highestSteps / 1000).toFixed(1)}K
              </div>
              <div className="tech-label">BEST DAY</div>
            </div>
            <div className="glass p-4 text-center">
              <div className="font-display text-2xl">
                {personalRecords.longestStreak}
              </div>
              <div className="tech-label">LONGEST STREAK</div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Recommendation */}
      {recommendation && recommendation.adjustmentType !== 'maintain' && (
        <div className="glass-medium p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="tech-label text-accent mb-2">GOAL RECOMMENDATION</div>
              <div className="text-sm text-muted-foreground font-mono mb-2">
                {recommendation.reasoning}
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <span className="tech-label">CURRENT: </span>
                  <span className="font-display">{recommendation.currentGoal.toLocaleString()}</span>
                </div>
                <div className="text-muted-foreground">→</div>
                <div>
                  <span className="tech-label">SUGGESTED: </span>
                  <span className="font-display text-accent">{recommendation.recommendedGoal.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2 font-mono">
                Confidence: {Math.round(recommendation.confidence * 100)}%
              </div>
            </div>
            <button
              onClick={handleGoalAdjustment}
              className="btn-nothing primary ml-4"
            >
              APPLY
            </button>
          </div>
        </div>
      )}

      {/* 30-Day Average */}
      <div className="glass p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="tech-label text-muted-foreground">30-DAY AVERAGE</div>
            <div className="font-display text-xl">
              {analytics.getThirtyDayAverage().toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="tech-label text-muted-foreground">7-DAY AVERAGE</div>
            <div className="font-display text-xl">
              {analytics.getSevenDayAverage().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
