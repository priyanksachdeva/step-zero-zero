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
  private motionListener?: (event: DeviceMotionEvent) => void; // store actual listener for proper removal

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

    // Remove correct event listener
    if (this.motionListener) {
      window.removeEventListener("devicemotion", this.motionListener);
      this.motionListener = undefined;
    }

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
    // Simple low-pass gravity estimate
    let gravity = { x: 0, y: 0, z: 0 };
    const alpha = 0.8; // gravity smoothing factor

    this.motionListener = (event: DeviceMotionEvent) => {
      const now = Date.now();
      if (now - lastProcessTime < throttleInterval) return;
      lastProcessTime = now;

      const accG = event.accelerationIncludingGravity;
      const acc = event.acceleration; // linear acceleration if provided
      if (!accG && !acc) return;

      // If idle mode, quick wake check
      if (this.isIdle && this.config.enableSleepMode && accG) {
        const magnitude = Math.sqrt(
          (accG.x || 0) ** 2 + (accG.y || 0) ** 2 + (accG.z || 0) ** 2
        );
        if (magnitude < 1.5) return; // still idle
        this.wakeFromIdle();
      }

      // Prefer linear acceleration if available; else derive by removing gravity
      let x: number, y: number, z: number;
      if (acc && (acc.x !== null || acc.y !== null || acc.z !== null)) {
        x = acc.x || 0;
        y = acc.y || 0;
        z = acc.z || 0;
      } else if (accG) {
        // Update gravity estimate
        gravity.x = alpha * gravity.x + (1 - alpha) * (accG.x || 0);
        gravity.y = alpha * gravity.y + (1 - alpha) * (accG.y || 0);
        gravity.z = alpha * gravity.z + (1 - alpha) * (accG.z || 0);
        x = (accG.x || 0) - gravity.x;
        y = (accG.y || 0) - gravity.y;
        z = (accG.z || 0) - gravity.z;
      } else {
        return;
      }

      const data: AccelerometerData = { x, y, z, timestamp: now };
      this.motionBuffer.push(data);
      this.lastMotionTime = now;
      if (this.motionBuffer.length > 200) this.motionBuffer.shift();
    };

    window.addEventListener("devicemotion", this.motionListener, {
      passive: true,
    });
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
