/**
 * Nutrition Dashboard - Phase 2.3
 * Nothing-Style Health App - Smart Nutrition & Meal Tracking Interface
 * Comprehensive nutrition monitoring with macro analysis and meal insights
 */

import React, { useState, useEffect } from "react";
import {
  Apple,
  Target,
  Clock,
  TrendingUp,
  Plus,
  Coffee,
  Utensils,
  Settings,
  Award,
  Activity,
  PieChart,
  Edit3,
  Trash2,
  Search,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  nutritionTracker,
  NutritionStatus,
  NutritionEntry,
  NutritionInsights,
  NutritionSettings,
  NutritionGoals,
  MacroNutrients,
} from "@/lib/nutritionTracker";

interface NutritionDashboardProps {}

export const NutritionDashboard: React.FC<NutritionDashboardProps> = () => {
  const [status, setStatus] = useState<NutritionStatus | null>(null);
  const [recentEntries, setRecentEntries] = useState<NutritionEntry[]>([]);
  const [insights, setInsights] = useState<NutritionInsights | null>(null);
  const [settings, setSettings] = useState<NutritionSettings | null>(null);
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMealType, setSelectedMealType] =
    useState<NutritionEntry["mealType"]>("breakfast");

  useEffect(() => {
    loadNutritionData();

    // Update status every 5 minutes
    const statusInterval = setInterval(() => {
      setStatus(nutritionTracker.getCurrentStatus());
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  const loadNutritionData = () => {
    setStatus(nutritionTracker.getCurrentStatus());
    setRecentEntries(nutritionTracker.getNutritionHistory(7));
    setInsights(nutritionTracker.generateInsights());
    setSettings(nutritionTracker.getSettings());
    setGoals(nutritionTracker.getGoals());
  };

  const handleQuickFood = (
    foodName: string,
    mealType: NutritionEntry["mealType"]
  ) => {
    const entryId = nutritionTracker.logQuickFood(foodName, mealType);
    if (entryId) {
      loadNutritionData();
      setShowQuickAdd(false);
    }
  };

  const updateSettings = (newSettings: Partial<NutritionSettings>) => {
    nutritionTracker.updateSettings(newSettings);
    loadNutritionData();
    setShowSettings(false);
  };

  const updateGoals = (newGoals: Partial<NutritionGoals>) => {
    nutritionTracker.updateGoals(newGoals);
    loadNutritionData();
  };

  const deleteEntry = (entryId: string) => {
    nutritionTracker.deleteEntry(entryId);
    loadNutritionData();
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getCurrentMealType = (): NutritionEntry["mealType"] => {
    const hour = new Date().getHours();
    if (hour < 10) return "breakfast";
    if (hour < 15) return "lunch";
    if (hour < 20) return "dinner";
    return "snack";
  };

  const getProgressColor = (progress: number): string => {
    if (progress < 50) return "bg-red-500";
    if (progress < 80) return "bg-orange-500";
    if (progress < 100) return "bg-yellow-500";
    if (progress <= 120) return "bg-green-500";
    return "bg-blue-500";
  };

  const getMealIcon = (mealType: NutritionEntry["mealType"]) => {
    switch (mealType) {
      case "breakfast":
        return <Coffee className="w-4 h-4" />;
      case "lunch":
        return <Utensils className="w-4 h-4" />;
      case "dinner":
        return <ChefHat className="w-4 h-4" />;
      case "snack":
        return <Apple className="w-4 h-4" />;
      default:
        return <Utensils className="w-4 h-4" />;
    }
  };

  const getMealColor = (mealType: NutritionEntry["mealType"]): string => {
    switch (mealType) {
      case "breakfast":
        return "text-orange-400";
      case "lunch":
        return "text-green-400";
      case "dinner":
        return "text-blue-400";
      case "snack":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  const renderMacroRing = (
    current: number,
    target: number,
    color: string,
    label: string
  ) => {
    const percentage = Math.min((current / target) * 100, 100);
    const circumference = 2 * Math.PI * 20;
    const strokeDashoffset = circumference * (1 - percentage / 100);

    return (
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-2">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={color}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-mono text-white">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
        <div className="font-technical text-xs text-gray-400">{label}</div>
        <div className="font-mono text-sm text-white">
          {Math.round(current)}/{Math.round(target)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg text-white">NUTRITION</h1>
          <p className="text-xs text-gray-400">
            Smart tracking • Macro analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowQuickAdd(true)}
            className="bg-green-500 hover:bg-green-600 text-white text-xs"
            size="sm"
          >
            <Plus className="w-3 h-3 mr-1" />
            LOG FOOD
          </Button>
          <Button
            onClick={() => setShowSettings(true)}
            variant="outline"
            size="sm"
            className="glass border-white/10 hover:border-red-500/50"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Daily Overview */}
      {status && goals && (
        <div className="glass-medium p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-technical text-white">TODAY'S NUTRITION</h2>
            <div
              className={`px-3 py-1 rounded-full border text-xs font-technical ${
                status.nutritionScore >= 8
                  ? "text-green-400 bg-green-500/20 border-green-500/50"
                  : status.nutritionScore >= 6
                  ? "text-yellow-400 bg-yellow-500/20 border-yellow-500/50"
                  : "text-red-400 bg-red-500/20 border-red-500/50"
              }`}
            >
              SCORE: {status.nutritionScore}/10
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {renderMacroRing(
              status.macrosConsumed.calories,
              goals.dailyCalories,
              "text-blue-400",
              "CALORIES"
            )}
            {renderMacroRing(
              status.macrosConsumed.protein,
              goals.proteinTarget,
              "text-red-400",
              "PROTEIN"
            )}
            {renderMacroRing(
              status.macrosConsumed.carbs,
              goals.carbsTarget,
              "text-yellow-400",
              "CARBS"
            )}
            {renderMacroRing(
              status.macrosConsumed.fat,
              goals.fatTarget,
              "text-purple-400",
              "FAT"
            )}
          </div>

          {/* Meal Distribution */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 glass border border-white/5">
              <div className="flex items-center justify-center mb-1 text-orange-400">
                <Coffee className="w-4 h-4 mr-1" />
                <span className="font-technical text-xs">BREAKFAST</span>
              </div>
              <div className="font-mono text-lg text-white">
                {Math.round(status.mealBalance.breakfast)}
              </div>
              <div className="text-xs text-gray-400">calories</div>
            </div>

            <div className="text-center p-3 glass border border-white/5">
              <div className="flex items-center justify-center mb-1 text-green-400">
                <Utensils className="w-4 h-4 mr-1" />
                <span className="font-technical text-xs">LUNCH</span>
              </div>
              <div className="font-mono text-lg text-white">
                {Math.round(status.mealBalance.lunch)}
              </div>
              <div className="text-xs text-gray-400">calories</div>
            </div>

            <div className="text-center p-3 glass border border-white/5">
              <div className="flex items-center justify-center mb-1 text-blue-400">
                <ChefHat className="w-4 h-4 mr-1" />
                <span className="font-technical text-xs">DINNER</span>
              </div>
              <div className="font-mono text-lg text-white">
                {Math.round(status.mealBalance.dinner)}
              </div>
              <div className="text-xs text-gray-400">calories</div>
            </div>

            <div className="text-center p-3 glass border border-white/5">
              <div className="flex items-center justify-center mb-1 text-purple-400">
                <Apple className="w-4 h-4 mr-1" />
                <span className="font-technical text-xs">SNACKS</span>
              </div>
              <div className="font-mono text-lg text-white">
                {Math.round(status.mealBalance.snacks)}
              </div>
              <div className="text-xs text-gray-400">calories</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendation */}
      {status && (
        <div className="glass p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="font-technical text-xs text-green-400">
              NUTRITION AI
            </span>
          </div>
          <p className="text-sm text-green-200">{status.recommendedNextMeal}</p>
        </div>
      )}

      {/* Recent Food Entries */}
      <div className="glass p-6 border border-white/10">
        <h2 className="font-technical text-white mb-4">RECENT MEALS</h2>

        {recentEntries.length > 0 ? (
          <div className="space-y-3">
            {recentEntries.slice(0, 8).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 glass border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={getMealColor(entry.mealType)}>
                    {getMealIcon(entry.mealType)}
                  </div>
                  <div>
                    <div className="font-mono text-sm text-white">
                      {entry.foodName}
                    </div>
                    <div className="font-technical text-xs text-gray-400">
                      {entry.quantity} {entry.unit} •{" "}
                      {entry.mealType.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono text-sm text-white">
                      {Math.round(entry.macros.calories)} cal
                    </div>
                    <div className="font-technical text-xs text-gray-400">
                      P:{Math.round(entry.macros.protein)}g C:
                      {Math.round(entry.macros.carbs)}g F:
                      {Math.round(entry.macros.fat)}g
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs text-white">
                      {formatTime(entry.timestamp)}
                    </div>
                    <Button
                      onClick={() => deleteEntry(entry.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 p-1 mt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Apple className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">
              No meals logged today. Start tracking your nutrition!
            </p>
          </div>
        )}
      </div>

      {/* Nutrition Insights */}
      {insights && (
        <div className="glass p-6 border border-white/10">
          <h2 className="font-technical text-white mb-4">NUTRITION INSIGHTS</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 glass border border-white/5">
              <div className="font-technical text-xs text-gray-400 mb-1">
                WEEKLY CALORIES
              </div>
              <div className="font-display text-lg text-white">
                {Math.round(insights.weeklyAverages.calories)}
              </div>
              <div className="text-xs text-gray-400">avg per day</div>
            </div>

            <div className="text-center p-4 glass border border-white/5">
              <div className="font-technical text-xs text-gray-400 mb-1">
                CONSISTENCY
              </div>
              <div className="font-display text-lg text-white">
                {insights.consistencyScore.toFixed(1)}/10
              </div>
              <div className="text-xs text-gray-400">nutrition stability</div>
            </div>

            <div className="text-center p-4 glass border border-white/5">
              <div className="font-technical text-xs text-gray-400 mb-1">
                MACRO BALANCE
              </div>
              <div className="font-display text-sm text-white">
                {insights.macroBalance.proteinRatio}% •{" "}
                {insights.macroBalance.carbsRatio}% •{" "}
                {insights.macroBalance.fatRatio}%
              </div>
              <div className="text-xs text-gray-400">P • C • F</div>
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="mb-6">
            <div className="font-technical text-xs text-gray-400 mb-3">
              7-DAY NUTRITION TREND
            </div>
            <div className="flex items-end gap-2 h-24">
              {insights.trends.map((day, index) => (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center"
                >
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      day.score >= 8
                        ? "bg-green-500"
                        : day.score >= 6
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ height: `${(day.score / 10) * 100}%` }}
                  ></div>
                  <div className="font-technical text-xs text-gray-400 mt-1">
                    {new Date(day.date)
                      .toLocaleDateString("en-US", { weekday: "short" })
                      .substr(0, 1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Food Quality Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 glass border border-white/5">
              <div className="font-technical text-xs text-gray-400 mb-1">
                PROCESSED FOODS
              </div>
              <div
                className={`font-display text-lg ${
                  insights.foodQuality.processedFoodRatio < 30
                    ? "text-green-400"
                    : insights.foodQuality.processedFoodRatio < 50
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {insights.foodQuality.processedFoodRatio}%
              </div>
            </div>

            <div className="text-center p-4 glass border border-white/5">
              <div className="font-technical text-xs text-gray-400 mb-1">
                VEGETABLES
              </div>
              <div className="font-display text-lg text-green-400">
                {insights.foodQuality.vegetableServings}
              </div>
              <div className="text-xs text-gray-400">servings/week</div>
            </div>

            <div className="text-center p-4 glass border border-white/5">
              <div className="font-technical text-xs text-gray-400 mb-1">
                FRUITS
              </div>
              <div className="font-display text-lg text-orange-400">
                {insights.foodQuality.fruitServings}
              </div>
              <div className="text-xs text-gray-400">servings/week</div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-green-400" />
              <span className="font-technical text-xs text-green-400">
                NUTRITION TIPS
              </span>
            </div>
            <div className="space-y-1">
              {insights.recommendations.map((rec, index) => (
                <p key={index} className="text-sm text-green-200">
                  • {rec}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Food Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-strong p-6 border border-white/20 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="font-technical text-white mb-4">LOG FOOD</h2>

            <div className="space-y-4">
              {/* Meal Type Selection */}
              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  MEAL TYPE
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["breakfast", "lunch", "dinner", "snack"].map((meal) => (
                    <Button
                      key={meal}
                      onClick={() =>
                        setSelectedMealType(meal as NutritionEntry["mealType"])
                      }
                      variant={
                        selectedMealType === meal ? "default" : "outline"
                      }
                      size="sm"
                      className={
                        selectedMealType === meal
                          ? "bg-red-500 hover:bg-red-600"
                          : "glass border-white/10"
                      }
                    >
                      {meal.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Search Foods */}
              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  SEARCH FOODS
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search foods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 p-2 glass border border-white/10 text-white bg-transparent"
                  />
                </div>
              </div>

              {/* Quick Food Options */}
              <div className="border-t border-white/10 pt-4">
                <div className="font-technical text-xs text-gray-400 mb-3">
                  COMMON FOODS
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {nutritionTracker
                    .searchFoods(searchQuery || "")
                    .slice(0, 8)
                    .map((food) => (
                      <div
                        key={food.name}
                        className="flex items-center justify-between p-2 glass border border-white/5 hover:border-white/10 cursor-pointer transition-colors"
                        onClick={() =>
                          handleQuickFood(food.name, selectedMealType)
                        }
                      >
                        <div>
                          <div className="font-mono text-sm text-white">
                            {food.name}
                          </div>
                          <div className="font-technical text-xs text-gray-400">
                            {food.macros.calories} cal • {food.category}
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-green-400" />
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowQuickAdd(false)}
                variant="outline"
                className="flex-1 glass border-white/10"
              >
                CANCEL
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && settings && goals && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-strong p-6 border border-white/20 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="font-technical text-white mb-4">
              NUTRITION SETTINGS
            </h2>

            <div className="space-y-4">
              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  GOAL TYPE
                </label>
                <select
                  value={settings.goalType}
                  onChange={(e) =>
                    updateSettings({ goalType: e.target.value as any })
                  }
                  className="w-full p-2 glass border border-white/10 text-white bg-transparent"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="weight_gain">Weight Gain</option>
                  <option value="muscle_gain">Muscle Gain</option>
                </select>
              </div>

              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  ACTIVITY LEVEL
                </label>
                <select
                  value={settings.activityLevel}
                  onChange={(e) =>
                    updateSettings({ activityLevel: e.target.value as any })
                  }
                  className="w-full p-2 glass border border-white/10 text-white bg-transparent"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light Activity</option>
                  <option value="moderate">Moderate Activity</option>
                  <option value="active">Active</option>
                  <option value="very_active">Very Active</option>
                </select>
              </div>

              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  DAILY CALORIE TARGET
                </label>
                <input
                  type="number"
                  value={goals.dailyCalories}
                  onChange={(e) =>
                    updateGoals({ dailyCalories: parseInt(e.target.value) })
                  }
                  className="w-full p-2 glass border border-white/10 text-white bg-transparent"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="font-technical text-xs text-gray-400">
                  MEAL REMINDERS
                </label>
                <Button
                  onClick={() =>
                    updateSettings({ mealReminders: !settings.mealReminders })
                  }
                  variant={settings.mealReminders ? "default" : "outline"}
                  size="sm"
                  className={
                    settings.mealReminders
                      ? "bg-red-500 hover:bg-red-600"
                      : "glass border-white/10"
                  }
                >
                  {settings.mealReminders ? "ON" : "OFF"}
                </Button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                className="flex-1 glass border-white/10"
              >
                CANCEL
              </Button>
              <Button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                SAVE
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionDashboard;
