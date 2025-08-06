/**
 * Health Insights Component - Phase 3.3
 * Display walking pace, calorie estimation, distance tracking, and activity analysis
 */

import React, { useState, useEffect } from 'react';
import { Activity, Zap, MapPin, Clock, TrendingUp, TrendingDown, Minus, User } from 'lucide-react';
import { HealthInsightsEngine, UserProfile, HealthInsight, HealthMetrics } from '../lib/healthInsights';

interface HealthInsightsProps {
  currentSteps: number;
  currentDistance: number;
  currentCalories: number;
  userProfile?: UserProfile;
  onProfileUpdate?: (profile: UserProfile) => void;
}

const HealthInsights: React.FC<HealthInsightsProps> = ({
  currentSteps,
  currentDistance,
  currentCalories,
  userProfile,
  onProfileUpdate
}) => {
  const [healthEngine, setHealthEngine] = useState<HealthInsightsEngine | null>(null);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<HealthMetrics | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileForm, setProfileForm] = useState<UserProfile>({
    weight: 70,
    height: 170,
    age: 30,
    gender: 'other'
  });

  useEffect(() => {
    if (userProfile) {
      const engine = new HealthInsightsEngine(userProfile);
      setHealthEngine(engine);
      
      // Generate sample activity data for demonstration
      const sampleData = generateSampleActivityData(currentSteps);
      const metrics = engine.processDailyActivity(sampleData);
      setCurrentMetrics(metrics);
      
      // Generate sample historical data for insights
      const historicalMetrics = generateHistoricalMetrics(engine, 7);
      const generatedInsights = engine.generateHealthInsights([...historicalMetrics, metrics]);
      setInsights(generatedInsights);
    }
  }, [userProfile, currentSteps]);

  const generateSampleActivityData = (totalSteps: number) => {
    const data = [];
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
    
    // Generate step progression throughout the day
    for (let i = 0; i <= 12; i++) {
      const time = new Date(startOfDay.getTime() + i * 60 * 60 * 1000); // Every hour
      const progress = Math.min(1, i / 12);
      const steps = Math.round(totalSteps * progress * (0.8 + Math.random() * 0.4));
      
      data.push({
        steps: Math.max(0, steps),
        timestamp: time
      });
    }
    
    return data;
  };

  const generateHistoricalMetrics = (engine: HealthInsightsEngine, days: number): HealthMetrics[] => {
    const metrics: HealthMetrics[] = [];
    
    for (let i = days; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseSteps = 7000 + Math.random() * 6000;
      const sampleData = generateSampleActivityData(baseSteps);
      const dayMetrics = engine.processDailyActivity(sampleData);
      
      metrics.push(dayMetrics);
    }
    
    return metrics;
  };

  const handleProfileSave = () => {
    if (onProfileUpdate) {
      onProfileUpdate(profileForm);
    }
    setShowProfileSetup(false);
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'pace': return <Activity className="w-4 h-4" />;
      case 'calories': return <Zap className="w-4 h-4" />;
      case 'distance': return <MapPin className="w-4 h-4" />;
      case 'activity': return <Clock className="w-4 h-4" />;
      case 'efficiency': return <TrendingUp className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-3 h-3 text-success" />;
      case 'declining': return <TrendingDown className="w-3 h-3 text-destructive" />;
      case 'stable': return <Minus className="w-3 h-3 text-muted-foreground" />;
      default: return null;
    }
  };

  const getInsightColor = (category: string) => {
    switch (category) {
      case 'pace': return 'text-blue-400';
      case 'calories': return 'text-orange-400';
      case 'distance': return 'text-green-400';
      case 'activity': return 'text-purple-400';
      case 'efficiency': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  if (!userProfile) {
    return (
      <div className="glass-medium p-6">
        <div className="text-center space-y-4">
          <User className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <div className="tech-label text-accent mb-2">HEALTH INSIGHTS</div>
            <div className="text-sm text-muted-foreground font-mono mb-4">
              Set up your profile for personalized health insights
            </div>
            <button
              onClick={() => setShowProfileSetup(true)}
              className="btn-nothing primary"
            >
              SETUP PROFILE
            </button>
          </div>
        </div>

        {showProfileSetup && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="glass-strong p-6 max-w-md w-full">
              <div className="tech-label text-accent mb-4">PROFILE SETUP</div>
              
              <div className="space-y-4">
                <div>
                  <label className="tech-label block mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={profileForm.weight}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, weight: Number(e.target.value) }))}
                    className="input-nothing w-full"
                    min="30"
                    max="200"
                  />
                </div>

                <div>
                  <label className="tech-label block mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={profileForm.height}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, height: Number(e.target.value) }))}
                    className="input-nothing w-full"
                    min="100"
                    max="250"
                  />
                </div>

                <div>
                  <label className="tech-label block mb-2">Age</label>
                  <input
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, age: Number(e.target.value) }))}
                    className="input-nothing w-full"
                    min="13"
                    max="120"
                  />
                </div>

                <div>
                  <label className="tech-label block mb-2">Gender</label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="input-nothing w-full"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowProfileSetup(false)}
                  className="btn-nothing flex-1"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleProfileSave}
                  className="btn-nothing primary flex-1"
                >
                  SAVE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Health Metrics */}
      {currentMetrics && (
        <div className="space-y-4">
          <div className="tech-label text-accent">TODAY'S HEALTH METRICS</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-4 text-center">
              <div className="text-blue-400 mb-2">
                <Activity className="w-5 h-5 mx-auto" />
              </div>
              <div className="font-display text-xl">
                {currentMetrics.averagePace}
              </div>
              <div className="tech-label">STEPS/MIN</div>
            </div>

            <div className="glass p-4 text-center">
              <div className="text-green-400 mb-2">
                <MapPin className="w-5 h-5 mx-auto" />
              </div>
              <div className="font-display text-xl">
                {currentMetrics.totalDistance}
              </div>
              <div className="tech-label">KM</div>
            </div>

            <div className="glass p-4 text-center">
              <div className="text-orange-400 mb-2">
                <Zap className="w-5 h-5 mx-auto" />
              </div>
              <div className="font-display text-xl">
                {currentMetrics.totalCalories}
              </div>
              <div className="tech-label">CALORIES</div>
            </div>

            <div className="glass p-4 text-center">
              <div className="text-purple-400 mb-2">
                <Clock className="w-5 h-5 mx-auto" />
              </div>
              <div className="font-display text-xl">
                {currentMetrics.activeMinutes}
              </div>
              <div className="tech-label">ACTIVE MIN</div>
            </div>
          </div>

          {/* Walking Efficiency */}
          <div className="glass p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="tech-label text-accent">WALKING EFFICIENCY</div>
                <div className="font-display text-2xl">
                  {Math.round(currentMetrics.walkingEfficiency * 100)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground font-mono">
                  {currentMetrics.walkingEfficiency > 0.8 ? 'Excellent' :
                   currentMetrics.walkingEfficiency > 0.6 ? 'Good' :
                   currentMetrics.walkingEfficiency > 0.4 ? 'Fair' : 'Needs Improvement'}
                </div>
              </div>
            </div>
            
            <div className="week-bar mt-3">
              <div 
                className="week-bar-fill" 
                style={{ width: `${Math.round(currentMetrics.walkingEfficiency * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Health Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <div className="tech-label text-accent">HEALTH INSIGHTS</div>
          {insights.map((insight, index) => (
            <div key={index} className="glass p-4">
              <div className="flex items-start space-x-3">
                <div className={`mt-0.5 ${getInsightColor(insight.category)}`}>
                  {getInsightIcon(insight.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-technical text-sm">{insight.title}</span>
                      {getTrendIcon(insight.trend)}
                    </div>
                    <div className="font-display text-sm">
                      {insight.value} {insight.unit}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground font-mono mb-2">
                    {insight.description}
                  </div>
                  {insight.recommendation && (
                    <div className="text-xs text-muted-foreground/80 font-mono">
                      💡 {insight.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Profile Summary */}
      <div className="glass p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="tech-label text-accent mb-2">PROFILE</div>
            <div className="space-y-1 text-sm font-mono text-muted-foreground">
              <div>Weight: {userProfile.weight}kg</div>
              <div>Height: {userProfile.height}cm</div>
              <div>Stride: {(userProfile.strideLength || 0.7).toFixed(2)}m</div>
            </div>
          </div>
          <button
            onClick={() => setShowProfileSetup(true)}
            className="btn-nothing"
          >
            EDIT
          </button>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showProfileSetup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="glass-strong p-6 max-w-md w-full">
            <div className="tech-label text-accent mb-4">EDIT PROFILE</div>
            
            <div className="space-y-4">
              <div>
                <label className="tech-label block mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={profileForm.weight}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, weight: Number(e.target.value) }))}
                  className="input-nothing w-full"
                  min="30"
                  max="200"
                />
              </div>

              <div>
                <label className="tech-label block mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={profileForm.height}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, height: Number(e.target.value) }))}
                  className="input-nothing w-full"
                  min="100"
                  max="250"
                />
              </div>

              <div>
                <label className="tech-label block mb-2">Age</label>
                <input
                  type="number"
                  value={profileForm.age}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, age: Number(e.target.value) }))}
                  className="input-nothing w-full"
                  min="13"
                  max="120"
                />
              </div>

              <div>
                <label className="tech-label block mb-2">Gender</label>
                <select
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value as any }))}
                  className="input-nothing w-full"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowProfileSetup(false)}
                className="btn-nothing flex-1"
              >
                CANCEL
              </button>
              <button
                onClick={handleProfileSave}
                className="btn-nothing primary flex-1"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthInsights;
