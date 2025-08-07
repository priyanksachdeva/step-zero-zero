/**
 * Nutrition Tracker - Phase 2.3
 * Nothing-Style Health App - Smart Meal & Nutrition Monitoring
 * Intelligent nutrition tracking with macronutrient analysis and dietary insights
 */

export interface MacroNutrients {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // mg
}

export interface MicroNutrients {
  vitaminC: number; // mg
  vitaminD: number; // IU
  calcium: number; // mg
  iron: number; // mg
  potassium: number; // mg
  magnesium: number; // mg
}

export interface NutritionEntry {
  id: string;
  timestamp: Date;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "drink";
  foodName: string;
  quantity: number;
  unit: "grams" | "cups" | "pieces" | "tablespoons" | "ml" | "oz";
  macros: MacroNutrients;
  micros?: Partial<MicroNutrients>;
  source: "manual" | "barcode" | "photo" | "recipe" | "quick_add";
  tags?: string[]; // e.g., 'homemade', 'restaurant', 'organic', 'processed'
  location?: string;
  mood?: "satisfied" | "still_hungry" | "too_full" | "neutral";
}

export interface NutritionGoals {
  dailyCalories: number;
  proteinTarget: number; // grams
  carbsTarget: number; // grams
  fatTarget: number; // grams
  fiberTarget: number; // grams
  sodiumLimit: number; // mg
  sugarLimit: number; // grams
  waterTarget: number; // ml (integrated with hydration)
}

export interface NutritionStatus {
  dailyCalories: number;
  macrosConsumed: MacroNutrients;
  goalsProgress: {
    calories: number; // percentage
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  mealBalance: {
    breakfast: number; // calories
    lunch: number;
    dinner: number;
    snacks: number;
  };
  nutritionScore: number; // 1-10 based on balance and quality
  recommendedNextMeal: string;
  caloriesBurned?: number; // if integrated with fitness
  netCalories: number;
}

export interface NutritionInsights {
  weeklyAverages: MacroNutrients;
  consistencyScore: number; // 1-10
  macroBalance: {
    proteinRatio: number; // percentage of calories
    carbsRatio: number;
    fatRatio: number;
  };
  mealTiming: {
    averageBreakfastTime: string;
    averageLunchTime: string;
    averageDinnerTime: string;
  };
  foodQuality: {
    processedFoodRatio: number;
    vegetableServings: number;
    fruitServings: number;
  };
  trends: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    score: number;
  }>;
  recommendations: string[];
}

export interface NutritionSettings {
  trackingMethod: "detailed" | "simple" | "macro_only";
  mealReminders: boolean;
  reminderTimes: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  goalType:
    | "maintenance"
    | "weight_loss"
    | "weight_gain"
    | "muscle_gain"
    | "custom";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  dietaryRestrictions: string[]; // 'vegetarian', 'vegan', 'gluten_free', 'dairy_free', etc.
  allergens: string[];
  preferredUnits: "metric" | "imperial";
  autoSuggestMeals: boolean;
}

// Common food database for quick logging
interface FoodItem {
  name: string;
  category: string;
  serving: { amount: number; unit: string };
  macros: MacroNutrients;
  micros?: Partial<MicroNutrients>;
  tags: string[];
}

const COMMON_FOODS: FoodItem[] = [
  {
    name: "Banana (Medium)",
    category: "Fruits",
    serving: { amount: 1, unit: "pieces" },
    macros: {
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      fiber: 3.1,
      sugar: 14,
      sodium: 1,
    },
    micros: { vitaminC: 10, potassium: 422 },
    tags: ["natural", "fruit", "potassium"],
  },
  {
    name: "Chicken Breast (Grilled)",
    category: "Protein",
    serving: { amount: 100, unit: "grams" },
    macros: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
    },
    micros: { iron: 1 },
    tags: ["lean", "protein", "low_carb"],
  },
  {
    name: "Brown Rice (Cooked)",
    category: "Grains",
    serving: { amount: 1, unit: "cups" },
    macros: {
      calories: 218,
      protein: 4.5,
      carbs: 45,
      fat: 1.6,
      fiber: 3.5,
      sugar: 0.7,
      sodium: 2,
    },
    tags: ["whole_grain", "complex_carbs"],
  },
  {
    name: "Avocado (Half)",
    category: "Fats",
    serving: { amount: 0.5, unit: "pieces" },
    macros: {
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      fiber: 6.7,
      sugar: 0.7,
      sodium: 7,
    },
    micros: { potassium: 487, magnesium: 29 },
    tags: ["healthy_fat", "fiber", "potassium"],
  },
  {
    name: "Greek Yogurt (Plain)",
    category: "Dairy",
    serving: { amount: 170, unit: "grams" },
    macros: {
      calories: 100,
      protein: 17,
      carbs: 6,
      fat: 0,
      fiber: 0,
      sugar: 6,
      sodium: 65,
    },
    micros: { calcium: 200 },
    tags: ["protein", "probiotic", "low_fat"],
  },
  {
    name: "Spinach (Fresh)",
    category: "Vegetables",
    serving: { amount: 100, unit: "grams" },
    macros: {
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2,
      sugar: 0.4,
      sodium: 79,
    },
    micros: { vitaminC: 28, iron: 2.7, calcium: 99 },
    tags: ["leafy_green", "iron", "low_calorie"],
  },
  {
    name: "Oatmeal (Cooked)",
    category: "Grains",
    serving: { amount: 1, unit: "cups" },
    macros: {
      calories: 147,
      protein: 5.9,
      carbs: 25,
      fat: 2.4,
      fiber: 4,
      sugar: 0.6,
      sodium: 2,
    },
    tags: ["whole_grain", "fiber", "breakfast"],
  },
  {
    name: "Almonds",
    category: "Nuts",
    serving: { amount: 28, unit: "grams" },
    macros: {
      calories: 164,
      protein: 6,
      carbs: 6.1,
      fat: 14.2,
      fiber: 3.5,
      sugar: 1.2,
      sodium: 1,
    },
    micros: { magnesium: 76, vitaminD: 0 },
    tags: ["healthy_fat", "protein", "magnesium"],
  },
];

class NutritionTracker {
  private entries: NutritionEntry[] = [];
  private goals: NutritionGoals;
  private settings: NutritionSettings;
  private storageKey = "nothing_nutrition_data";
  private settingsKey = "nothing_nutrition_settings";
  private goalsKey = "nothing_nutrition_goals";

  constructor() {
    this.loadData();
    this.settings = this.loadSettings();
    this.goals = this.loadGoals();
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
      console.error("Error loading nutrition data:", error);
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
      console.error("Error saving nutrition data:", error);
    }
  }

  private loadGoals(): NutritionGoals {
    try {
      const stored = localStorage.getItem(this.goalsKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading nutrition goals:", error);
    }

    return this.calculateDefaultGoals();
  }

  private saveGoals(): void {
    try {
      localStorage.setItem(this.goalsKey, JSON.stringify(this.goals));
    } catch (error) {
      console.error("Error saving nutrition goals:", error);
    }
  }

  private loadSettings(): NutritionSettings {
    try {
      const stored = localStorage.getItem(this.settingsKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading nutrition settings:", error);
    }

    return {
      trackingMethod: "detailed",
      mealReminders: true,
      reminderTimes: {
        breakfast: "08:00",
        lunch: "12:30",
        dinner: "18:30",
      },
      goalType: "maintenance",
      activityLevel: "moderate",
      dietaryRestrictions: [],
      allergens: [],
      preferredUnits: "metric",
      autoSuggestMeals: true,
    };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    } catch (error) {
      console.error("Error saving nutrition settings:", error);
    }
  }

  private calculateDefaultGoals(): NutritionGoals {
    // Base calculation for average adult (can be personalized)
    const baseCalories =
      this.calculateBasalMetabolicRate() * this.getActivityMultiplier();

    return {
      dailyCalories: Math.round(baseCalories),
      proteinTarget: Math.round((baseCalories * 0.25) / 4), // 25% of calories from protein
      carbsTarget: Math.round((baseCalories * 0.45) / 4), // 45% from carbs
      fatTarget: Math.round((baseCalories * 0.3) / 9), // 30% from fat
      fiberTarget: 25, // recommended daily fiber
      sodiumLimit: 2300, // mg per day
      sugarLimit: 50, // grams per day
      waterTarget: 2500, // ml (integrated with hydration tracker)
    };
  }

  private calculateBasalMetabolicRate(): number {
    // Simplified BMR calculation (Mifflin-St Jeor Equation for average adult)
    // In real app, would use user's actual age, weight, height, gender
    return 1800; // Base BMR for average adult
  }

  private getActivityMultiplier(): number {
    switch (this.settings.activityLevel) {
      case "sedentary":
        return 1.2;
      case "light":
        return 1.375;
      case "moderate":
        return 1.55;
      case "active":
        return 1.725;
      case "very_active":
        return 1.9;
      default:
        return 1.55;
    }
  }

  logFood(
    foodName: string,
    quantity: number,
    unit: NutritionEntry["unit"],
    mealType: NutritionEntry["mealType"],
    macros: MacroNutrients,
    micros?: Partial<MicroNutrients>,
    tags?: string[]
  ): string {
    const entry: NutritionEntry = {
      id: `nutrition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      mealType,
      foodName,
      quantity,
      unit,
      macros,
      micros,
      source: "manual",
      tags,
    };

    this.entries.push(entry);
    this.saveData();

    return entry.id;
  }

  logQuickFood(
    foodName: string,
    mealType: NutritionEntry["mealType"]
  ): string | null {
    const food = COMMON_FOODS.find((f) =>
      f.name.toLowerCase().includes(foodName.toLowerCase())
    );

    if (food) {
      return this.logFood(
        food.name,
        food.serving.amount,
        food.serving.unit as NutritionEntry["unit"],
        mealType,
        food.macros,
        food.micros,
        food.tags
      );
    }

    return null;
  }

  getCurrentStatus(): NutritionStatus {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const todayEntries = this.entries.filter(
      (entry) => entry.timestamp >= startOfDay
    );

    const macrosConsumed = todayEntries.reduce(
      (total, entry) => ({
        calories: total.calories + entry.macros.calories,
        protein: total.protein + entry.macros.protein,
        carbs: total.carbs + entry.macros.carbs,
        fat: total.fat + entry.macros.fat,
        fiber: total.fiber + entry.macros.fiber,
        sugar: total.sugar + entry.macros.sugar,
        sodium: total.sodium + entry.macros.sodium,
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }
    );

    const goalsProgress = {
      calories: (macrosConsumed.calories / this.goals.dailyCalories) * 100,
      protein: (macrosConsumed.protein / this.goals.proteinTarget) * 100,
      carbs: (macrosConsumed.carbs / this.goals.carbsTarget) * 100,
      fat: (macrosConsumed.fat / this.goals.fatTarget) * 100,
      fiber: (macrosConsumed.fiber / this.goals.fiberTarget) * 100,
    };

    const mealBalance = this.calculateMealBalance(todayEntries);
    const nutritionScore = this.calculateNutritionScore(
      macrosConsumed,
      todayEntries
    );
    const recommendedNextMeal = this.getNextMealRecommendation(
      mealBalance,
      macrosConsumed
    );

    return {
      dailyCalories: macrosConsumed.calories,
      macrosConsumed,
      goalsProgress,
      mealBalance,
      nutritionScore,
      recommendedNextMeal,
      netCalories: macrosConsumed.calories, // TODO: subtract calories burned from exercise
    };
  }

  private calculateMealBalance(entries: NutritionEntry[]) {
    return entries.reduce(
      (balance, entry) => ({
        ...balance,
        [entry.mealType]: balance[entry.mealType] + entry.macros.calories,
      }),
      { breakfast: 0, lunch: 0, dinner: 0, snacks: 0, drink: 0 }
    );
  }

  private calculateNutritionScore(
    macros: MacroNutrients,
    entries: NutritionEntry[]
  ): number {
    let score = 5; // Start at neutral

    // Check macro balance
    const totalCalories = macros.calories;
    if (totalCalories > 0) {
      const proteinRatio = (macros.protein * 4) / totalCalories;
      const carbsRatio = (macros.carbs * 4) / totalCalories;
      const fatRatio = (macros.fat * 9) / totalCalories;

      // Ideal ratios: 20-30% protein, 40-50% carbs, 25-35% fat
      if (proteinRatio >= 0.2 && proteinRatio <= 0.3) score += 1;
      if (carbsRatio >= 0.4 && carbsRatio <= 0.5) score += 1;
      if (fatRatio >= 0.25 && fatRatio <= 0.35) score += 1;
    }

    // Check fiber intake
    if (macros.fiber >= this.goals.fiberTarget * 0.8) score += 1;

    // Check food quality (less processed foods)
    const wholeFoodsCount = entries.filter(
      (e) =>
        e.tags?.includes("natural") ||
        e.tags?.includes("whole_grain") ||
        e.tags?.includes("lean")
    ).length;
    const totalFoods = entries.length;
    if (totalFoods > 0 && wholeFoodsCount / totalFoods >= 0.6) score += 1;

    // Check meal distribution
    const balance = this.calculateMealBalance(entries);
    const isBalanced =
      balance.breakfast > 0 && balance.lunch > 0 && balance.dinner > 0;
    if (isBalanced) score += 1;

    return Math.min(10, Math.max(1, score));
  }

  private getNextMealRecommendation(
    balance: any,
    macros: MacroNutrients
  ): string {
    const now = new Date();
    const hour = now.getHours();

    // Determine current meal time
    let currentMeal: string;
    if (hour < 10) currentMeal = "breakfast";
    else if (hour < 15) currentMeal = "lunch";
    else if (hour < 20) currentMeal = "dinner";
    else currentMeal = "evening";

    // Calculate remaining macros needed
    const remainingProtein = Math.max(
      0,
      this.goals.proteinTarget - macros.protein
    );
    const remainingCarbs = Math.max(0, this.goals.carbsTarget - macros.carbs);
    const remainingFiber = Math.max(0, this.goals.fiberTarget - macros.fiber);

    if (currentMeal === "breakfast" && balance.breakfast === 0) {
      return "Start your day with protein and complex carbs - try oatmeal with Greek yogurt";
    } else if (currentMeal === "lunch" && balance.lunch === 0) {
      if (remainingProtein > 15) {
        return "Focus on lean protein for lunch - grilled chicken with vegetables";
      }
      return "Balanced lunch with protein, carbs, and vegetables";
    } else if (currentMeal === "dinner" && balance.dinner === 0) {
      if (remainingFiber > 10) {
        return "Add fiber-rich foods for dinner - quinoa with roasted vegetables";
      }
      return "Light but complete dinner with protein and vegetables";
    } else {
      if (remainingProtein > 10) return "Consider a protein-rich snack";
      if (remainingFiber > 5) return "Add some fruit or nuts for fiber";
      return "You're on track with your nutrition goals";
    }
  }

  getNutritionHistory(days: number = 7): NutritionEntry[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.entries
      .filter((entry) => entry.timestamp >= cutoffDate)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getDailyMacros(date: Date): MacroNutrients {
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const dayEntries = this.entries.filter(
      (entry) => entry.timestamp >= startOfDay && entry.timestamp < endOfDay
    );

    return dayEntries.reduce(
      (total, entry) => ({
        calories: total.calories + entry.macros.calories,
        protein: total.protein + entry.macros.protein,
        carbs: total.carbs + entry.macros.carbs,
        fat: total.fat + entry.macros.fat,
        fiber: total.fiber + entry.macros.fiber,
        sugar: total.sugar + entry.macros.sugar,
        sodium: total.sodium + entry.macros.sodium,
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }
    );
  }

  generateInsights(): NutritionInsights {
    const last7Days = this.getLast7DaysData();
    const weeklyAverages = this.calculateWeeklyAverages(last7Days);
    const consistency = this.calculateNutritionConsistency(last7Days);

    return {
      weeklyAverages,
      consistencyScore: consistency,
      macroBalance: this.calculateMacroBalance(weeklyAverages),
      mealTiming: this.analyzeMealTiming(),
      foodQuality: this.analyzeFoodQuality(),
      trends: last7Days,
      recommendations: this.generateRecommendations(last7Days, consistency),
    };
  }

  private getLast7DaysData() {
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const macros = this.getDailyMacros(date);

      // Calculate nutrition score for the day
      const dayEntries = this.entries.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.toDateString() === date.toDateString();
      });
      const score = this.calculateNutritionScore(macros, dayEntries);

      trends.push({
        date: date.toISOString().split("T")[0],
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        score,
      });
    }
    return trends;
  }

  private calculateWeeklyAverages(trends: any[]): MacroNutrients {
    const totals = trends.reduce(
      (sum, day) => ({
        calories: sum.calories + day.calories,
        protein: sum.protein + day.protein,
        carbs: sum.carbs + day.carbs,
        fat: sum.fat + day.fat,
        fiber: sum.fiber + (day.fiber || 0),
        sugar: sum.sugar + (day.sugar || 0),
        sodium: sum.sodium + (day.sodium || 0),
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }
    );

    return {
      calories: Math.round(totals.calories / 7),
      protein: Math.round(totals.protein / 7),
      carbs: Math.round(totals.carbs / 7),
      fat: Math.round(totals.fat / 7),
      fiber: Math.round(totals.fiber / 7),
      sugar: Math.round(totals.sugar / 7),
      sodium: Math.round(totals.sodium / 7),
    };
  }

  private calculateNutritionConsistency(trends: any[]): number {
    if (trends.length < 2) return 5;

    const calories = trends.map((t) => t.calories);
    const mean = calories.reduce((sum, c) => sum + c, 0) / calories.length;
    const variance =
      calories.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) /
      calories.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to 1-10 scale (lower deviation = higher consistency)
    const consistency = Math.max(1, Math.min(10, 10 - standardDeviation / 200));
    return Math.round(consistency * 10) / 10;
  }

  private calculateMacroBalance(averages: MacroNutrients) {
    const totalCalories = averages.calories;
    if (totalCalories === 0) {
      return { proteinRatio: 0, carbsRatio: 0, fatRatio: 0 };
    }

    return {
      proteinRatio: Math.round(((averages.protein * 4) / totalCalories) * 100),
      carbsRatio: Math.round(((averages.carbs * 4) / totalCalories) * 100),
      fatRatio: Math.round(((averages.fat * 9) / totalCalories) * 100),
    };
  }

  private analyzeMealTiming() {
    // Simplified analysis - in real app would analyze actual meal times
    return {
      averageBreakfastTime: "08:15",
      averageLunchTime: "12:45",
      averageDinnerTime: "18:30",
    };
  }

  private analyzeFoodQuality() {
    const recentEntries = this.getNutritionHistory(7);
    const totalEntries = recentEntries.length;

    if (totalEntries === 0) {
      return { processedFoodRatio: 0, vegetableServings: 0, fruitServings: 0 };
    }

    const processedFoods = recentEntries.filter(
      (e) => e.tags?.includes("processed") || e.tags?.includes("fast_food")
    ).length;

    const vegetables = recentEntries.filter(
      (e) => e.tags?.includes("vegetable") || e.tags?.includes("leafy_green")
    ).length;

    const fruits = recentEntries.filter((e) =>
      e.tags?.includes("fruit")
    ).length;

    return {
      processedFoodRatio: Math.round((processedFoods / totalEntries) * 100),
      vegetableServings: vegetables,
      fruitServings: fruits,
    };
  }

  private generateRecommendations(
    trends: any[],
    consistency: number
  ): string[] {
    const recommendations = [];
    const avgCalories =
      trends.reduce((sum, t) => sum + t.calories, 0) / trends.length;
    const avgScore =
      trends.reduce((sum, t) => sum + t.score, 0) / trends.length;

    if (avgCalories < this.goals.dailyCalories * 0.8) {
      recommendations.push(
        "Increase daily calorie intake to meet your energy needs"
      );
    } else if (avgCalories > this.goals.dailyCalories * 1.2) {
      recommendations.push(
        "Consider reducing portion sizes or choosing lower-calorie options"
      );
    }

    if (consistency < 6) {
      recommendations.push("Focus on consistent meal timing and portion sizes");
    }

    if (avgScore < 6) {
      recommendations.push(
        "Improve food quality by choosing more whole, unprocessed foods"
      );
    }

    const proteinTrend = trends.slice(-3);
    const avgProtein =
      proteinTrend.reduce((sum, t) => sum + t.protein, 0) / proteinTrend.length;
    if (avgProtein < this.goals.proteinTarget * 0.8) {
      recommendations.push(
        "Increase protein intake with lean meats, eggs, or plant-based options"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Great nutrition habits! Keep maintaining your balanced approach"
      );
    }

    return recommendations;
  }

  updateGoals(newGoals: Partial<NutritionGoals>): void {
    this.goals = { ...this.goals, ...newGoals };
    this.saveGoals();
  }

  updateSettings(newSettings: Partial<NutritionSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    // Recalculate goals if activity level or goal type changed
    if (newSettings.activityLevel || newSettings.goalType) {
      this.goals = this.calculateDefaultGoals();
      this.saveGoals();
    }
  }

  getSettings(): NutritionSettings {
    return { ...this.settings };
  }

  getGoals(): NutritionGoals {
    return { ...this.goals };
  }

  getCommonFoods(): FoodItem[] {
    return COMMON_FOODS;
  }

  searchFoods(query: string): FoodItem[] {
    const lowercaseQuery = query.toLowerCase();
    return COMMON_FOODS.filter(
      (food) =>
        food.name.toLowerCase().includes(lowercaseQuery) ||
        food.category.toLowerCase().includes(lowercaseQuery) ||
        food.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  deleteEntry(entryId: string): boolean {
    const initialLength = this.entries.length;
    this.entries = this.entries.filter((entry) => entry.id !== entryId);

    if (this.entries.length < initialLength) {
      this.saveData();
      return true;
    }

    return false;
  }

  editEntry(entryId: string, updates: Partial<NutritionEntry>): boolean {
    const entryIndex = this.entries.findIndex((entry) => entry.id === entryId);

    if (entryIndex !== -1) {
      this.entries[entryIndex] = { ...this.entries[entryIndex], ...updates };
      this.saveData();
      return true;
    }

    return false;
  }

  // Quick meal logging methods
  logBreakfast(foodName: string): string | null {
    return this.logQuickFood(foodName, "breakfast");
  }

  logLunch(foodName: string): string | null {
    return this.logQuickFood(foodName, "lunch");
  }

  logDinner(foodName: string): string | null {
    return this.logQuickFood(foodName, "dinner");
  }

  logSnack(foodName: string): string | null {
    return this.logQuickFood(foodName, "snack");
  }
}

// Export singleton instance
export const nutritionTracker = new NutritionTracker();
export default nutritionTracker;
