import { useState, useEffect, useCallback, useRef } from "react";
import { AdvancedStepDetector } from "@/lib/stepDetection";
import { BatteryOptimizedSensorManager } from "@/lib/sensorManager";
import { DataPersistenceManager } from "@/lib/dataPersistence";
import { nativeSensorManager, NativeMotionData } from "@/lib/nativeSensors";

export const usePedometer = () => {
  // Core managers
  const stepDetectorRef = useRef<AdvancedStepDetector | null>(null);
  const sensorManagerRef = useRef<BatteryOptimizedSensorManager | null>(null);
  const dataManagerRef = useRef<DataPersistenceManager | null>(null);

  // State
  const [currentSteps, setCurrentSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [sensorSupported, setSensorSupported] = useState<boolean | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null
  );
  const [batteryOptimized, setBatteryOptimized] = useState(true);

  // Initialize managers
  useEffect(() => {
    if (!dataManagerRef.current) {
      dataManagerRef.current = new DataPersistenceManager();
    }

    if (!stepDetectorRef.current) {
      const settings = dataManagerRef.current.getUserSettings();
      stepDetectorRef.current = new AdvancedStepDetector({
        sensitivity: settings.sensitivity,
        minStepInterval: 300,
        sampleRate: 20, // Battery optimized
        filterWindowSize: 10,
      });
    }

    if (!sensorManagerRef.current && stepDetectorRef.current) {
      sensorManagerRef.current = new BatteryOptimizedSensorManager(
        stepDetectorRef.current,
        {
          sampleRate: 20, // Battery optimized from 50Hz
          batchInterval: 5000,
          idleTimeout: 300000, // 5 minutes
          enableSleepMode: true,
        }
      );
    }

    // Load today's data and restore session if needed
    loadTodayData();
    restoreSessionIfNeeded();

    return () => {
      if (sensorManagerRef.current) {
        sensorManagerRef.current.stopMonitoring();
      }
      if (dataManagerRef.current) {
        dataManagerRef.current.destroy();
      }
    };
  }, []);

  // Load today's data from persistence
  const loadTodayData = useCallback(() => {
    if (!dataManagerRef.current) return;

    const todayData = dataManagerRef.current.getTodayData();
    setCurrentSteps(todayData.steps);
  }, []);

  // Restore session after app restart/crash
  const restoreSessionIfNeeded = useCallback(() => {
    if (!dataManagerRef.current) return;

    const session = dataManagerRef.current.getCurrentSession();
    if (session) {
      const today = new Date().toISOString().split("T")[0];

      // Only restore if it's the same day and recent (within 1 hour)
      if (session.date === today && Date.now() - session.lastSaved < 3600000) {
        setCurrentSteps(session.stepCount);
        console.log("Session restored after restart");
      } else {
        dataManagerRef.current.clearCurrentSession();
      }
    }
  }, []);

  // Step detection callback
  const handleStepDetected = useCallback((newStepCount: number) => {
    setCurrentSteps(newStepCount);

    // Save session data for crash recovery
    if (dataManagerRef.current) {
      dataManagerRef.current.saveCurrentSession(newStepCount, Date.now());
    }

    // Auto-save every 50 steps to prevent data loss
    if (newStepCount % 50 === 0) {
      saveTodayData(newStepCount);
    }
  }, []);

  // Sensor status callback
  const handleSensorStatus = useCallback((online: boolean) => {
    setIsTracking(online);
  }, []);

  // Save today's data
  const saveTodayData = useCallback(
    async (steps: number = currentSteps) => {
      if (!dataManagerRef.current) return;

      const settings = dataManagerRef.current.getUserSettings();
      const todayData = {
        date: new Date().toISOString().split("T")[0],
        steps,
        distance: (steps * settings.strideLength) / 100000, // Convert cm to km
        calories: Math.floor(steps * 0.04 * (settings.weight / 70)), // Adjust for weight
        activeTime: Math.floor(steps / 120), // Rough calculation
        goalAchieved: steps >= settings.dailyGoal,
      };

      await dataManagerRef.current.saveDailyData(todayData);
    },
    [currentSteps]
  );

  // Start tracking with native sensors
  const startNativeTracking = useCallback(async () => {
    try {
      // Check if we're on a native platform
      const isNative = nativeSensorManager.isNativePlatform();
      console.log("Platform check:", isNative ? "Native" : "Web");

      // Provide haptic feedback
      await nativeSensorManager.vibrate("light");

      // Start motion monitoring with native sensors
      const success = await nativeSensorManager.startMotionMonitoring(
        (motionData: NativeMotionData) => {
          if (!stepDetectorRef.current) return;

          // Convert native motion data to our format
          const accelerometerData = {
            x: motionData.accelerationIncludingGravity.x,
            y: motionData.accelerationIncludingGravity.y,
            z: motionData.accelerationIncludingGravity.z,
            timestamp: Date.now(),
          };

          // Process with step detector
          const stepDetected =
            stepDetectorRef.current.processAccelerometerData(accelerometerData);

          if (stepDetected) {
            const newStepCount = stepDetectorRef.current.getStepCount();
            handleStepDetected(newStepCount);

            // Provide haptic feedback for step
            nativeSensorManager.vibrate("light");
          }
        }
      );

      if (success) {
        setIsTracking(true);
        setSensorSupported(true);
        setPermissionGranted(true);
        console.log("Native step tracking started successfully");
        return true;
      } else {
        // Fallback to regular tracking
        return startTracking();
      }
    } catch (error) {
      console.error("Failed to start native tracking:", error);
      // Fallback to regular tracking
      return startTracking();
    }
  }, [handleStepDetected]);

  // Start tracking
  const startTracking = useCallback(async () => {
    if (!sensorManagerRef.current) return false;

    try {
      const success = await sensorManagerRef.current.startMonitoring(
        handleStepDetected,
        handleSensorStatus
      );

      if (success) {
        setIsTracking(true);
        setSensorSupported(true);
        setPermissionGranted(true);
        console.log("Step tracking started successfully");
      } else {
        setSensorSupported(false);
        setPermissionGranted(false);
      }

      return success;
    } catch (error) {
      console.error("Failed to start tracking:", error);
      return false;
    }
  }, [handleStepDetected, handleSensorStatus]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    // Stop native sensors
    nativeSensorManager.stopMotionMonitoring();

    // Stop regular sensors
    if (sensorManagerRef.current) {
      sensorManagerRef.current.stopMonitoring();
    }

    setIsTracking(false);

    // Save data when stopping
    saveTodayData();
  }, [saveTodayData]);

  // Toggle tracking with native support
  const toggleTracking = useCallback(async () => {
    if (isTracking) {
      stopTracking();
    } else {
      // Try native tracking first, fallback to regular tracking
      await startNativeTracking();
    }
  }, [isTracking, startNativeTracking, stopTracking]);

  // Reset daily steps
  const resetDailySteps = useCallback(() => {
    if (stepDetectorRef.current) {
      stepDetectorRef.current.resetStepCount();
    }

    setCurrentSteps(0);

    if (dataManagerRef.current) {
      dataManagerRef.current.clearCurrentSession();
    }
  }, []);

  // Calculate derived values
  const settings = dataManagerRef.current?.getUserSettings() || {
    dailyGoal: 10000,
    weight: 70,
    strideLength: 75,
    sensitivity: 1.0,
    notificationsEnabled: true,
    theme: "dark",
  };

  const progress = currentSteps / settings.dailyGoal;
  const distance = ((currentSteps * settings.strideLength) / 100000).toFixed(1); // km
  const calories = Math.floor(currentSteps * 0.04 * (settings.weight / 70));
  const activeTime = Math.floor(currentSteps / 120); // minutes

  // Generate week data from persistence
  const generateWeekData = useCallback(() => {
    if (!dataManagerRef.current) return [];

    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayData = dataManagerRef.current.getDailyData(dateStr);
      const isToday = i === 0;

      weekData.push({
        day: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date.getDay()],
        steps: isToday ? currentSteps : dayData?.steps || 0,
        goal: settings.dailyGoal,
        isToday,
      });
    }

    return weekData;
  }, [currentSteps, settings.dailyGoal]);

  // Auto-start tracking on mount if supported
  useEffect(() => {
    const autoStart = async () => {
      if (sensorSupported === null) {
        // Try to start tracking to check support
        const success = await startTracking();
        if (!success) {
          console.warn("Falling back to manual step entry mode");
        }
      }
    };

    autoStart();
  }, [sensorSupported, startTracking]);

  // Periodic data saving
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      saveTodayData();
    }, 60000); // Save every minute while tracking

    return () => clearInterval(interval);
  }, [isTracking, saveTodayData]);

  return {
    // Core data
    currentSteps,
    progress,
    dailyGoal: settings.dailyGoal,
    distance,
    calories,
    activeTime,
    weekData: generateWeekData(),

    // Status
    isTracking,
    sensorSupported,
    permissionGranted,
    batteryOptimized,

    // Actions
    toggleTracking,
    resetDailySteps,
    startTracking,
    stopTracking,

    // Settings
    settings,
    updateSettings: (newSettings: Partial<typeof settings>) => {
      if (dataManagerRef.current) {
        dataManagerRef.current.saveUserSettings({
          ...settings,
          ...newSettings,
        });
      }
    },

    // Data management
    exportData: () => dataManagerRef.current?.exportUserData() || "",
    importData: async (jsonData: string): Promise<boolean> => {
      if (dataManagerRef.current) {
        return await dataManagerRef.current.importUserData(jsonData);
      }
      return false;
    },
  };
};
