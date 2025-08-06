/**
 * Advanced Step Detection Algorithm
 * Implements the improvements outlined in Phase 1.1 of the roadmap
 */

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface StepDetectionConfig {
  // Configurable sensitivity for different user patterns
  sensitivity: number; // 0.5 to 2.0, default 1.0
  // Minimum time between steps (ms) to prevent false positives
  minStepInterval: number; // default 300ms
  // Sample rate for sensor data (Hz)
  sampleRate: number; // default 50Hz
  // Window size for filtering
  filterWindowSize: number; // default 10 samples
}

export class AdvancedStepDetector {
  private config: StepDetectionConfig;
  private dataBuffer: AccelerometerData[] = [];
  private lastStepTime = 0;
  private stepCount = 0;
  private threshold = 1.2; // Dynamic threshold
  private userActivityHistory: number[] = [];

  constructor(config: Partial<StepDetectionConfig> = {}) {
    this.config = {
      sensitivity: 1.0,
      minStepInterval: 300,
      sampleRate: 50,
      filterWindowSize: 10,
      ...config,
    };
  }

  /**
   * Process new accelerometer data and detect steps
   */
  processAccelerometerData(data: AccelerometerData): boolean {
    // Add to buffer
    this.dataBuffer.push(data);

    // Maintain buffer size
    if (this.dataBuffer.length > this.config.filterWindowSize * 2) {
      this.dataBuffer.shift();
    }

    // Need minimum samples for filtering
    if (this.dataBuffer.length < this.config.filterWindowSize) {
      return false;
    }

    // Apply filtering and step detection
    const filteredMagnitude = this.applyFiltering(data);
    const isStep = this.detectStep(filteredMagnitude, data.timestamp);

    return isStep;
  }

  /**
   * Apply Butterworth-style low-pass filter to reduce noise
   */
  private applyFiltering(currentData: AccelerometerData): number {
    // Calculate magnitude
    const magnitude = Math.sqrt(
      currentData.x ** 2 + currentData.y ** 2 + currentData.z ** 2
    );

    // Simple moving average filter (can be enhanced with proper Butterworth)
    const recentData = this.dataBuffer.slice(-this.config.filterWindowSize);
    const magnitudes = recentData.map((d) =>
      Math.sqrt(d.x ** 2 + d.y ** 2 + d.z ** 2)
    );

    // Low-pass filter: average of recent magnitudes
    const filtered =
      magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length;

    return filtered;
  }

  /**
   * Dynamic threshold calculation based on user activity patterns
   */
  private calculateDynamicThreshold(): number {
    if (this.userActivityHistory.length === 0) {
      return 1.2 * this.config.sensitivity;
    }

    // Calculate baseline from recent activity
    const recentActivity = this.userActivityHistory.slice(-50); // Last 50 samples
    const mean =
      recentActivity.reduce((sum, val) => sum + val, 0) / recentActivity.length;
    const variance =
      recentActivity.reduce((sum, val) => sum + (val - mean) ** 2, 0) /
      recentActivity.length;
    const stdDev = Math.sqrt(variance);

    // Adaptive threshold: mean + (stdDev * sensitivity factor)
    return Math.max(0.8, mean + stdDev * 1.5 * this.config.sensitivity);
  }

  /**
   * Peak detection with false positive filtering
   */
  private detectStep(magnitude: number, timestamp: number): boolean {
    // Update activity history for threshold calculation
    this.userActivityHistory.push(magnitude);
    if (this.userActivityHistory.length > 100) {
      this.userActivityHistory.shift();
    }

    // Update dynamic threshold
    this.threshold = this.calculateDynamicThreshold();

    // Minimum interval check
    if (timestamp - this.lastStepTime < this.config.minStepInterval) {
      return false;
    }

    // Simple peak detection
    if (this.dataBuffer.length < 3) return false;

    const recent = this.dataBuffer.slice(-3);
    const [prev, curr, next] = recent.map((d) =>
      Math.sqrt(d.x ** 2 + d.y ** 2 + d.z ** 2)
    );

    // Peak detection: current value is higher than neighbors and above threshold
    const isPeak = curr > prev && curr > next && curr > this.threshold;

    if (isPeak) {
      // Additional validation: check if pattern looks like walking
      if (this.validateStepPattern(magnitude)) {
        this.lastStepTime = timestamp;
        this.stepCount++;
        return true;
      }
    }

    return false;
  }

  /**
   * Validate that detected peak represents actual walking motion
   */
  private validateStepPattern(magnitude: number): boolean {
    // Check for reasonable magnitude range (filter out hand gestures, vehicle movement)
    if (magnitude < 0.5 || magnitude > 4.0) {
      return false;
    }

    // Check for consistent step timing (basic pattern recognition)
    const recentSteps = this.dataBuffer.slice(-20);
    if (recentSteps.length < 10) return true; // Not enough data yet

    // Could add more sophisticated pattern recognition here
    // For now, accept if basic magnitude check passes
    return true;
  }

  /**
   * Get current step count
   */
  getStepCount(): number {
    return this.stepCount;
  }

  /**
   * Reset step count (for daily reset)
   */
  resetStepCount(): void {
    this.stepCount = 0;
    this.lastStepTime = 0;
  }

  /**
   * Update sensitivity settings
   */
  updateSensitivity(sensitivity: number): void {
    this.config.sensitivity = Math.max(0.5, Math.min(2.0, sensitivity));
  }

  /**
   * Get calibration data for user-specific adjustment
   */
  getCalibrationData() {
    return {
      currentThreshold: this.threshold,
      sensitivity: this.config.sensitivity,
      averageActivity:
        this.userActivityHistory.length > 0
          ? this.userActivityHistory.reduce((sum, val) => sum + val, 0) /
            this.userActivityHistory.length
          : 0,
      stepCount: this.stepCount,
    };
  }
}

/**
 * Utility function to check if device supports motion sensors
 */
export const checkSensorSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof DeviceMotionEvent === "undefined") {
      resolve(false);
      return;
    }

    // Check if permission is required (iOS 13+)
    if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
      resolve(true); // Permission request will be handled separately
    } else {
      resolve(true); // Permission not required (Android, older iOS)
    }
  });
};

/**
 * Request motion sensor permissions (iOS 13+)
 */
export const requestMotionPermission = async (): Promise<boolean> => {
  if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
    try {
      const permission = await (DeviceMotionEvent as any).requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting motion permission:", error);
      return false;
    }
  }
  return true; // Permission not required
};
