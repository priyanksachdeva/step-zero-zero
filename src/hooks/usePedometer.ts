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
        sampleRate: 20,
        filterWindowSize: 10,
      });
    }

    if (!sensorManagerRef.current && stepDetectorRef.current) {
      sensorManagerRef.current = new BatteryOptimizedSensorManager(
        stepDetectorRef.current,
        {
          sampleRate: 20,
          batchInterval: 5000,
          idleTimeout: 300000,
          enableSleepMode: true,
        }
      );
    }

    // Load today's data and restore session if needed
    loadTodayData();
    restoreSessionIfNeeded();

    return () => {
      if (sensorManagerRef.current) sensorManagerRef.current.stopMonitoring();
      if (dataManagerRef.current) dataManagerRef.current.destroy();
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
    if (!dataManagerRef.current || !stepDetectorRef.current) return;
    const session = dataManagerRef.current.getCurrentSession();
    if (session) {
      const today = new Date().toISOString().split("T")[0];
      if (session.date === today && Date.now() - session.lastSaved < 3600000) {
        setCurrentSteps(session.stepCount);
        if (session.calibration) {
          stepDetectorRef.current.restoreCalibration({
            currentThreshold: session.calibration.threshold,
            averageActivity: session.calibration.averageActivity,
          });
        }
        console.log("Session restored with calibration");
      } else {
        dataManagerRef.current.clearCurrentSession();
      }
    }
  }, []);

  // Move saveTodayData earlier to avoid temporal dead zone
  const saveTodayData = useCallback(
    async (steps: number = currentSteps) => {
      if (!dataManagerRef.current) return;
      const settings = dataManagerRef.current.getUserSettings();
      const todayData = {
        date: new Date().toISOString().split("T")[0],
        steps,
        distance: (steps * settings.strideLength) / 100000,
        calories: Math.floor(steps * 0.04 * (settings.weight / 70)),
        activeTime: Math.floor(steps / 120),
        goalAchieved: steps >= settings.dailyGoal,
      };
      await dataManagerRef.current.saveDailyData(todayData);
    },
    [currentSteps]
  );

  // Step detection callback
  const handleStepDetected = useCallback(
    (newStepCount: number) => {
      setCurrentSteps(newStepCount);
      if (dataManagerRef.current && stepDetectorRef.current) {
        const calib = stepDetectorRef.current.getCalibrationData();
        dataManagerRef.current.saveCurrentSession(newStepCount, Date.now(), {
          threshold: calib.currentThreshold,
          averageActivity: calib.averageActivity,
        });
      }
      if (newStepCount % 50 === 0) saveTodayData(newStepCount);
    },
    [saveTodayData]
  );

  // Sensor status callback
  const handleSensorStatus = useCallback((online: boolean) => {
    setIsTracking(online);
  }, []);

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

  // Start tracking with native sensors
  const startNativeTracking = useCallback(async () => {
    try {
      const isNative = (nativeSensorManager as any).isNativePlatform
        ? (nativeSensorManager as any).isNativePlatform()
        : true;
      console.log("Platform check:", isNative ? "Native" : "Web");
      if ((nativeSensorManager as any).vibrate)
        await (nativeSensorManager as any).vibrate("light");
      if (sensorManagerRef.current)
        sensorManagerRef.current.updateConfiguration({ batchInterval: 1000 });
      const success = await nativeSensorManager.startMotionMonitoring(
        (motionData: NativeMotionData) => {
          if (!stepDetectorRef.current) return;
          const accelerometerData = {
            x: motionData.acceleration.x,
            y: motionData.acceleration.y,
            z: motionData.acceleration.z,
            timestamp: Date.now(),
          };
          const stepDetected =
            stepDetectorRef.current.processAccelerometerData(accelerometerData);
          if (stepDetected) {
            const newStepCount = stepDetectorRef.current.getStepCount();
            handleStepDetected(newStepCount);
            if ((nativeSensorManager as any).vibrate)
              (nativeSensorManager as any).vibrate("light");
          }
        }
      );
      if (success) {
        setIsTracking(true);
        setSensorSupported(true);
        setPermissionGranted(true);
        console.log("Native step tracking started successfully");
        return true;
      }
      return startTracking();
    } catch (error) {
      console.error("Failed to start native tracking:", error);
      return startTracking();
    }
  }, [handleStepDetected, startTracking]);

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
      const nativeOk = await startNativeTracking();
      if (!nativeOk) await startTracking();
    }
  }, [isTracking, startNativeTracking, startTracking, stopTracking]);

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
