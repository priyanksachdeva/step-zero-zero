/**
 * Battery-Optimized Sensor Manager
 * Implements Phase 1.2 battery optimization strategies
 */

import {
  AdvancedStepDetector,
  AccelerometerData,
  checkSensorSupport,
  requestMotionPermission,
} from "./stepDetection";

export interface SensorManagerConfig {
  // Optimized sampling rate (Hz) - lower = better battery
  sampleRate: number; // default 20Hz (instead of 60Hz)
  // Batch processing interval (ms)
  batchInterval: number; // default 5000ms (5 seconds)
  // Idle detection timeout (ms)
  idleTimeout: number; // default 300000ms (5 minutes)
  // Enable sleep mode when stationary
  enableSleepMode: boolean; // default true
}

export class BatteryOptimizedSensorManager {
  private config: SensorManagerConfig;
  private stepDetector: AdvancedStepDetector;
  private isListening = false;
  private isIdle = false;
  private lastMotionTime = Date.now();
  private idleTimer?: NodeJS.Timeout;
  private batchTimer?: NodeJS.Timeout;
  private motionBuffer: AccelerometerData[] = [];
  private stepCountCallback?: (steps: number) => void;
  private onlineStatusCallback?: (online: boolean) => void;

  constructor(
    stepDetector: AdvancedStepDetector,
    config: Partial<SensorManagerConfig> = {}
  ) {
    this.stepDetector = stepDetector;
    this.config = {
      sampleRate: 20, // Optimized from typical 50-60Hz
      batchInterval: 5000,
      idleTimeout: 300000, // 5 minutes
      enableSleepMode: true,
      ...config,
    };
  }

  /**
   * Start sensor monitoring with battery optimization
   */
  async startMonitoring(
    stepCallback: (steps: number) => void,
    statusCallback?: (online: boolean) => void
  ): Promise<boolean> {
    try {
      // Check sensor support
      const isSupported = await checkSensorSupport();
      if (!isSupported) {
        console.warn("Motion sensors not supported on this device");
        return false;
      }

      // Request permissions if needed
      const hasPermission = await requestMotionPermission();
      if (!hasPermission) {
        console.warn("Motion sensor permission denied");
        return false;
      }

      this.stepCountCallback = stepCallback;
      this.onlineStatusCallback = statusCallback;

      // Start listening with optimized settings
      this.startSensorListening();
      this.startBatchProcessing();
      this.startIdleDetection();

      this.isListening = true;
      this.onlineStatusCallback?.(true);

      console.log("Sensor monitoring started with battery optimization");
      return true;
    } catch (error) {
      console.error("Failed to start sensor monitoring:", error);
      return false;
    }
  }

  /**
   * Stop all sensor monitoring
   */
  stopMonitoring(): void {
    this.isListening = false;

    // Remove event listener
    window.removeEventListener("devicemotion", this.handleDeviceMotion);

    // Clear timers
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    this.onlineStatusCallback?.(false);
    console.log("Sensor monitoring stopped");
  }

  /**
   * Start listening to device motion with throttling
   */
  private startSensorListening(): void {
    // Calculate throttle interval based on desired sample rate
    const throttleInterval = 1000 / this.config.sampleRate;
    let lastProcessTime = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const now = Date.now();

      // Throttle to desired sample rate
      if (now - lastProcessTime < throttleInterval) {
        return;
      }
      lastProcessTime = now;

      // Skip if in sleep mode and no significant motion
      if (this.isIdle && this.config.enableSleepMode) {
        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration) return;

        const magnitude = Math.sqrt(
          (acceleration.x || 0) ** 2 +
            (acceleration.y || 0) ** 2 +
            (acceleration.z || 0) ** 2
        );

        // Only wake up if significant motion detected
        if (magnitude < 1.5) return;

        this.wakeFromIdle();
      }

      this.handleDeviceMotion(event);
    };

    // Bind the handler and start listening
    this.handleDeviceMotion = this.handleDeviceMotion.bind(this);
    window.addEventListener("devicemotion", handleMotion, { passive: true });
  }

  /**
   * Handle device motion events
   */
  private handleDeviceMotion = (event: DeviceMotionEvent): void => {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const data: AccelerometerData = {
      x: acceleration.x || 0,
      y: acceleration.y || 0,
      z: acceleration.z || 0,
      timestamp: Date.now(),
    };

    // Add to batch buffer instead of processing immediately
    this.motionBuffer.push(data);
    this.lastMotionTime = Date.now();

    // Limit buffer size to prevent memory issues
    if (this.motionBuffer.length > 200) {
      this.motionBuffer.shift();
    }
  };

  /**
   * Process motion data in batches for better battery performance
   */
  private startBatchProcessing(): void {
    this.batchTimer = setInterval(() => {
      if (this.motionBuffer.length === 0) return;

      let stepDetected = false;
      const bufferCopy = [...this.motionBuffer];
      this.motionBuffer = [];

      // Process all buffered motion data
      for (const data of bufferCopy) {
        const isStep = this.stepDetector.processAccelerometerData(data);
        if (isStep) {
          stepDetected = true;
        }
      }

      // Callback with updated step count if steps were detected
      if (stepDetected) {
        this.stepCountCallback?.(this.stepDetector.getStepCount());
      }
    }, this.config.batchInterval);
  }

  /**
   * Implement idle detection for sleep mode
   */
  private startIdleDetection(): void {
    const checkIdle = () => {
      const timeSinceMotion = Date.now() - this.lastMotionTime;

      if (timeSinceMotion > this.config.idleTimeout && !this.isIdle) {
        this.enterIdleMode();
      }

      // Continue checking
      this.idleTimer = setTimeout(checkIdle, 60000); // Check every minute
    };

    this.idleTimer = setTimeout(checkIdle, this.config.idleTimeout);
  }

  /**
   * Enter power-saving idle mode
   */
  private enterIdleMode(): void {
    this.isIdle = true;
    console.log("Entering idle mode for battery conservation");

    // Could implement additional power saving measures here:
    // - Reduce sensor polling frequency
    // - Pause non-essential background tasks
    // - Notify UI of idle state
  }

  /**
   * Wake from idle mode when motion detected
   */
  private wakeFromIdle(): void {
    if (!this.isIdle) return;

    this.isIdle = false;
    this.lastMotionTime = Date.now();
    console.log("Waking from idle mode");

    // Resume normal operation
  }

  /**
   * Get current battery optimization status
   */
  getOptimizationStatus() {
    return {
      isListening: this.isListening,
      isIdle: this.isIdle,
      sampleRate: this.config.sampleRate,
      bufferSize: this.motionBuffer.length,
      lastMotionTime: this.lastMotionTime,
      stepCount: this.stepDetector.getStepCount(),
    };
  }

  /**
   * Update configuration for runtime optimization
   */
  updateConfiguration(newConfig: Partial<SensorManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart monitoring with new settings if currently active
    if (this.isListening && this.stepCountCallback) {
      this.stopMonitoring();
      this.startMonitoring(this.stepCountCallback, this.onlineStatusCallback);
    }
  }

  /**
   * Get power consumption estimate (relative scale)
   */
  getPowerConsumptionEstimate(): number {
    let consumption = 1.0; // Base consumption

    // Sample rate impact
    consumption *= this.config.sampleRate / 20; // 20Hz as baseline

    // Idle mode savings
    if (this.isIdle) {
      consumption *= 0.1; // 90% reduction in idle
    }

    // Batch processing efficiency
    consumption *= 0.8; // 20% reduction from batching

    return Math.max(0.1, consumption);
  }
}
