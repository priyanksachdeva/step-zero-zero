/**
 * Data Persistence & Reliability Layer
 * Implements Phase 1.3 data persistence improvements
 */

export interface StepData {
  date: string; // YYYY-MM-DD format
  steps: number;
  distance: number; // kilometers
  calories: number;
  activeTime: number; // minutes
  goalAchieved: boolean;
  hourlyData?: HourlyStepData[];
}

export interface HourlyStepData {
  hour: number; // 0-23
  steps: number;
}

export interface WeeklyData {
  weekStart: string; // YYYY-MM-DD format
  days: StepData[];
  totalSteps: number;
  averageSteps: number;
  goalsAchieved: number;
}

export interface UserSettings {
  dailyGoal: number;
  weight: number; // kg for calorie calculation
  strideLength: number; // cm
  sensitivity: number;
  notificationsEnabled: boolean;
  theme: "dark" | "light";
}

export class DataPersistenceManager {
  private readonly STORAGE_KEYS = {
    DAILY_DATA: "stepzero_daily_data",
    WEEKLY_DATA: "stepzero_weekly_data",
    USER_SETTINGS: "stepzero_settings",
    CURRENT_SESSION: "stepzero_session",
    BACKUP_DATA: "stepzero_backup",
  };

  private readonly MAX_DAILY_RECORDS = 365; // Keep 1 year of data
  private readonly BACKUP_INTERVAL = 300000; // 5 minutes

  private backupTimer?: NodeJS.Timeout;

  constructor() {
    this.startPeriodicBackup();
    this.validateAndRepairData();
  }

  /**
   * Save daily step data with validation
   */
  async saveDailyData(data: StepData): Promise<boolean> {
    try {
      // Validate data before saving
      if (!this.validateStepData(data)) {
        console.error("Invalid step data provided:", data);
        return false;
      }

      // Get existing daily data
      const existingData = this.getDailyDataHistory();

      // Update or add today's data
      const updatedData = existingData.filter((d) => d.date !== data.date);
      updatedData.push(data);

      // Sort by date and limit records
      updatedData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      if (updatedData.length > this.MAX_DAILY_RECORDS) {
        updatedData.splice(0, updatedData.length - this.MAX_DAILY_RECORDS);
      }

      // Save to localStorage
      localStorage.setItem(
        this.STORAGE_KEYS.DAILY_DATA,
        JSON.stringify(updatedData)
      );

      // Update weekly data
      await this.updateWeeklyData(data);

      console.log("Daily data saved successfully");
      return true;
    } catch (error) {
      console.error("Failed to save daily data:", error);
      return false;
    }
  }

  /**
   * Get daily data history with error handling
   */
  getDailyDataHistory(): StepData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.DAILY_DATA);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to load daily data history:", error);
      return [];
    }
  }

  /**
   * Get data for specific date
   */
  getDailyData(date: string): StepData | null {
    const history = this.getDailyDataHistory();
    return history.find((d) => d.date === date) || null;
  }

  /**
   * Get today's data or create new entry
   */
  getTodayData(): StepData {
    const today = new Date().toISOString().split("T")[0];
    const existing = this.getDailyData(today);

    if (existing) {
      return existing;
    }

    // Create new day entry
    const settings = this.getUserSettings();
    return {
      date: today,
      steps: 0,
      distance: 0,
      calories: 0,
      activeTime: 0,
      goalAchieved: false,
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        steps: 0,
      })),
    };
  }

  /**
   * Update weekly data aggregation
   */
  private async updateWeeklyData(dayData: StepData): Promise<void> {
    try {
      const weekStart = this.getWeekStart(new Date(dayData.date));
      const weekKey = weekStart.toISOString().split("T")[0];

      const existingWeekly = this.getWeeklyDataHistory();
      let weekData = existingWeekly.find((w) => w.weekStart === weekKey);

      if (!weekData) {
        weekData = {
          weekStart: weekKey,
          days: [],
          totalSteps: 0,
          averageSteps: 0,
          goalsAchieved: 0,
        };
      }

      // Update the specific day
      weekData.days = weekData.days.filter((d) => d.date !== dayData.date);
      weekData.days.push(dayData);
      weekData.days.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Recalculate aggregates
      weekData.totalSteps = weekData.days.reduce((sum, d) => sum + d.steps, 0);
      weekData.averageSteps = Math.round(
        weekData.totalSteps / weekData.days.length
      );
      weekData.goalsAchieved = weekData.days.filter(
        (d) => d.goalAchieved
      ).length;

      // Update weekly data array
      const updatedWeekly = existingWeekly.filter(
        (w) => w.weekStart !== weekKey
      );
      updatedWeekly.push(weekData);

      localStorage.setItem(
        this.STORAGE_KEYS.WEEKLY_DATA,
        JSON.stringify(updatedWeekly)
      );
    } catch (error) {
      console.error("Failed to update weekly data:", error);
    }
  }

  /**
   * Get weekly data history
   */
  getWeeklyDataHistory(): WeeklyData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.WEEKLY_DATA);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to load weekly data:", error);
      return [];
    }
  }

  /**
   * Save and load user settings
   */
  saveUserSettings(settings: UserSettings): boolean {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.USER_SETTINGS,
        JSON.stringify(settings)
      );
      return true;
    } catch (error) {
      console.error("Failed to save user settings:", error);
      return false;
    }
  }

  getUserSettings(): UserSettings {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.USER_SETTINGS);
      if (data) {
        return { ...this.getDefaultSettings(), ...JSON.parse(data) };
      }
    } catch (error) {
      console.error("Failed to load user settings:", error);
    }

    return this.getDefaultSettings();
  }

  private getDefaultSettings(): UserSettings {
    return {
      dailyGoal: 10000,
      weight: 70, // kg
      strideLength: 75, // cm
      sensitivity: 1.0,
      notificationsEnabled: true,
      theme: "dark",
    };
  }

  /**
   * Session management for crash recovery
   */
  saveCurrentSession(stepCount: number, sessionStart: number): void {
    try {
      const sessionData = {
        stepCount,
        sessionStart,
        lastSaved: Date.now(),
        date: new Date().toISOString().split("T")[0],
      };

      localStorage.setItem(
        this.STORAGE_KEYS.CURRENT_SESSION,
        JSON.stringify(sessionData)
      );
    } catch (error) {
      console.error("Failed to save session data:", error);
    }
  }

  getCurrentSession() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to load session data:", error);
      return null;
    }
  }

  clearCurrentSession(): void {
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION);
  }

  /**
   * Export user data as JSON
   */
  exportUserData(): string {
    const exportData = {
      dailyData: this.getDailyDataHistory(),
      weeklyData: this.getWeeklyDataHistory(),
      settings: this.getUserSettings(),
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import user data from JSON
   */
  async importUserData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);

      // Validate import data structure
      if (!data.dailyData || !Array.isArray(data.dailyData)) {
        throw new Error("Invalid import data format");
      }

      // Create backup before import
      await this.createBackup();

      // Import data
      if (data.dailyData) {
        localStorage.setItem(
          this.STORAGE_KEYS.DAILY_DATA,
          JSON.stringify(data.dailyData)
        );
      }

      if (data.weeklyData) {
        localStorage.setItem(
          this.STORAGE_KEYS.WEEKLY_DATA,
          JSON.stringify(data.weeklyData)
        );
      }

      if (data.settings) {
        this.saveUserSettings(data.settings);
      }

      console.log("Data imported successfully");
      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }

  /**
   * Create backup of all data
   */
  private async createBackup(): Promise<void> {
    try {
      const backupData = {
        timestamp: Date.now(),
        data: this.exportUserData(),
      };

      localStorage.setItem(
        this.STORAGE_KEYS.BACKUP_DATA,
        JSON.stringify(backupData)
      );
    } catch (error) {
      console.error("Failed to create backup:", error);
    }
  }

  /**
   * Start periodic backup system
   */
  private startPeriodicBackup(): void {
    this.backupTimer = setInterval(async () => {
      await this.createBackup();
    }, this.BACKUP_INTERVAL);
  }

  /**
   * Validate step data
   */
  private validateStepData(data: StepData): boolean {
    return (
      typeof data.steps === "number" &&
      data.steps >= 0 &&
      data.steps <= 100000 && // Reasonable upper limit
      typeof data.distance === "number" &&
      data.distance >= 0 &&
      typeof data.calories === "number" &&
      data.calories >= 0 &&
      typeof data.activeTime === "number" &&
      data.activeTime >= 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.date)
    );
  }

  /**
   * Validate and repair corrupted data
   */
  private validateAndRepairData(): void {
    try {
      // Check and repair daily data
      const dailyData = this.getDailyDataHistory();
      const validDaily = dailyData.filter((d) => this.validateStepData(d));

      if (validDaily.length !== dailyData.length) {
        console.warn("Repaired corrupted daily data");
        localStorage.setItem(
          this.STORAGE_KEYS.DAILY_DATA,
          JSON.stringify(validDaily)
        );
      }

      // Validate settings
      const settings = this.getUserSettings();
      if (
        !settings.dailyGoal ||
        settings.dailyGoal < 1000 ||
        settings.dailyGoal > 50000
      ) {
        console.warn("Repaired invalid daily goal setting");
        this.saveUserSettings({ ...settings, dailyGoal: 10000 });
      }
    } catch (error) {
      console.error("Failed to validate data:", error);
    }
  }

  /**
   * Get start of week (Monday) for a given date
   */
  private getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
    }
  }
}
