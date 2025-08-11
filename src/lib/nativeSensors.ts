/**
 * Native Sensor Manager for Capacitor
 * Enhanced implementation with proper Android sensor access
 */

import { Device } from "@capacitor/device";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Motion } from "@capacitor/motion";
import { Capacitor } from "@capacitor/core";
import { registerPlugin } from "@capacitor/core";

// polling state for native step service
let servicePollingInterval: ReturnType<typeof setInterval> | null = null;
let lastNativeSteps = 0;

export interface NativeMotionData {
  accelerationIncludingGravity: {
    x: number;
    y: number;
    z: number;
  };
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  rotationRate: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  interval: number;
}

// Capacitor plugin interface
interface StepServicePlugin {
  startService(): Promise<{ started: boolean }>;
  stopService(): Promise<{ stopped: boolean }>;
  getStepCount(): Promise<{ steps: number }>;
}

const StepService = registerPlugin<StepServicePlugin>("StepService", {});

export class NativeSensorManager {
  private isNative: boolean = false;
  private motionListeners: Array<(data: NativeMotionData) => void> = [];
  private isListening: boolean = false;
  private motionHandler: ((event: DeviceMotionEvent) => void) | null = null;
  private usingCapacitorMotion: boolean = false;
  private accelListener: any = null;
  private lastEventTimestamp: number = 0;
  private sampleIntervalMs = 50; // ~20Hz default
  private lastDispatch = 0;
  private gravity = { x: 0, y: 0, z: 0 };
  private readonly gravityAlpha = 0.8; // low‑pass filter factor

  constructor() {
    this.checkPlatform();
  }

  private async checkPlatform() {
    try {
      const info = await Device.getInfo();
      this.isNative = info.platform !== "web";
      console.log(
        "Platform detected:",
        info.platform,
        "Native:",
        this.isNative
      );
    } catch (error) {
      console.log("Device info error:", error);
      this.isNative = false;
    }
  }

  async requestMotionPermissions(): Promise<boolean> {
    console.log("Requesting motion permissions...");

    if (!this.isNative) {
      return this.requestWebMotionPermission();
    }

    try {
      if (typeof DeviceMotionEvent !== "undefined") {
        console.log("Motion sensors available on native platform");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Motion permission error:", error);
      return false;
    }
  }

  private async requestWebMotionPermission(): Promise<boolean> {
    if (typeof DeviceMotionEvent === "undefined") {
      console.log("DeviceMotionEvent not supported");
      return false;
    }

    if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        console.log("iOS motion permission:", permission);
        return permission === "granted";
      } catch (error) {
        console.error("iOS permission error:", error);
        return false;
      }
    }

    console.log("Motion available without permission (Android web)");
    return true;
  }

  async startMotionMonitoring(
    callback: (data: NativeMotionData) => void
  ): Promise<boolean> {
    console.log("Starting motion monitoring...");
    console.log("Current platform:", this.isNative ? "Native" : "Web");
    console.log(
      "DeviceMotionEvent available:",
      typeof DeviceMotionEvent !== "undefined"
    );

    if (this.isListening) {
      this.motionListeners.push(callback);
      console.log("Added listener to existing monitoring");
      return true;
    }

    const hasPermission = await this.requestMotionPermissions();
    if (!hasPermission) {
      console.error("Motion permission denied");
      return false;
    }

    this.motionListeners.push(callback);

    // Try Capacitor Motion plugin first on native
    if (this.isNative) {
      try {
        this.usingCapacitorMotion = true;
        this.accelListener = await Motion.addListener("accel", (event: any) => {
          this.lastEventTimestamp = Date.now();
          this.dispatchMotionEvent(event);
        });
        this.isListening = true;
        console.log("Using Capacitor Motion plugin for accelerometer data");

        // Health check fallback if no events arrive
        setTimeout(() => {
          if (this.isListening && Date.now() - this.lastEventTimestamp > 3000) {
            console.warn(
              "No Motion plugin events received, falling back to devicemotion"
            );
            this.stopMotionMonitoring();
            this.startWebFallback();
          }
        }, 3500);
        return true;
      } catch (err) {
        console.warn(
          "Capacitor Motion plugin failed, fallback to devicemotion",
          err
        );
        this.usingCapacitorMotion = false;
      }
    }

    // Fallback path
    return this.startWebFallback();
  }

  private startWebFallback(): boolean {
    try {
      this.motionHandler = (event: DeviceMotionEvent) => {
        this.lastEventTimestamp = Date.now();
        if (!event.accelerationIncludingGravity && !event.acceleration) {
          return;
        }
        const converted: any = {
          accelerationIncludingGravity: event.accelerationIncludingGravity || {
            x: 0,
            y: 0,
            z: 0,
          },
          acceleration: event.acceleration || { x: 0, y: 0, z: 0 },
          rotationRate: event.rotationRate || { alpha: 0, beta: 0, gamma: 0 },
          interval: event.interval || 16,
        };
        this.dispatchMotionEvent(converted);
      };

      console.log("Adding devicemotion event listener (fallback)...");
      window.addEventListener("devicemotion", this.motionHandler, true);
      this.isListening = true;

      // Health check
      setTimeout(() => {
        if (this.isListening && Date.now() - this.lastEventTimestamp > 3000) {
          console.warn(
            "No devicemotion events received (fallback path). Device may block sensors."
          );
        }
      }, 3500);
      return true;
    } catch (error) {
      console.error("Failed to start web fallback motion monitoring:", error);
      return false;
    }
  }

  private dispatchMotionEvent(raw: any) {
    // Throttle to target sample interval
    const now = Date.now();
    if (now - this.lastDispatch < this.sampleIntervalMs) return;
    this.lastDispatch = now;

    const ag = raw.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
    const lin = raw.acceleration || { x: 0, y: 0, z: 0 };

    // If linear accel not provided, derive by low‑pass filtering gravity
    let linX = lin.x,
      linY = lin.y,
      linZ = lin.z;
    if ((linX === 0 && linY === 0 && linZ === 0) || linX === undefined) {
      this.gravity.x =
        this.gravityAlpha * this.gravity.x +
        (1 - this.gravityAlpha) * (ag.x || 0);
      this.gravity.y =
        this.gravityAlpha * this.gravity.y +
        (1 - this.gravityAlpha) * (ag.y || 0);
      this.gravity.z =
        this.gravityAlpha * this.gravity.z +
        (1 - this.gravityAlpha) * (ag.z || 0);
      linX = (ag.x || 0) - this.gravity.x;
      linY = (ag.y || 0) - this.gravity.y;
      linZ = (ag.z || 0) - this.gravity.z;
    }

    const motionData: NativeMotionData = {
      accelerationIncludingGravity: {
        x: ag.x || 0,
        y: ag.y || 0,
        z: ag.z || 0,
      },
      acceleration: {
        x: linX || 0,
        y: linY || 0,
        z: linZ || 0,
      },
      rotationRate: {
        alpha: raw.rotationRate?.alpha || 0,
        beta: raw.rotationRate?.beta || 0,
        gamma: raw.rotationRate?.gamma || 0,
      },
      interval: raw.interval || this.sampleIntervalMs,
    };

    this.motionListeners.forEach((listener) => {
      try {
        listener(motionData);
      } catch (error) {
        console.error("Motion listener error:", error);
      }
    });
  }

  stopMotionMonitoring(): void {
    if (this.accelListener) {
      try {
        this.accelListener.remove();
      } catch (_) {}
      this.accelListener = null;
    }
    if (this.motionHandler) {
      window.removeEventListener("devicemotion", this.motionHandler, true);
      this.motionHandler = null;
    }
    this.isListening = false;
    this.motionListeners = [];
    this.usingCapacitorMotion = false;
    console.log("Motion monitoring stopped");
  }

  setSampleRate(hz: number) {
    this.sampleIntervalMs = Math.max(10, Math.min(200, 1000 / hz));
  }

  getSensorStatus(): any {
    return {
      isNative: this.isNative,
      isListening: this.isListening,
      listenersCount: this.motionListeners.length,
      hasDeviceMotion: typeof DeviceMotionEvent !== "undefined",
      usingCapacitorMotion: this.usingCapacitorMotion,
      sampleIntervalMs: this.sampleIntervalMs,
      lastEventAgeMs: this.lastEventTimestamp
        ? Date.now() - this.lastEventTimestamp
        : -1,
    };
  }

  async startNativeForegroundService(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) return;
      await StepService.startService();
      // start polling for step count every 10s and dispatch synthetic motion event if increased
      if (servicePollingInterval) clearInterval(servicePollingInterval);
      servicePollingInterval = setInterval(async () => {
        try {
          const { steps } = await StepService.getStepCount();
          if (steps > lastNativeSteps) {
            const delta = steps - lastNativeSteps;
            lastNativeSteps = steps;
            // We could dispatch a custom event or integrate with persistence directly
            window.dispatchEvent(
              new CustomEvent("nativeStepUpdate", { detail: { steps, delta } })
            );
          }
        } catch (e) {
          // silent
        }
      }, 10000);
    } catch (e) {
      console.warn("Failed to start native step service", e);
    }
  }
  async stopNativeForegroundService(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) return;
      await StepService.stopService();
      if (servicePollingInterval) {
        clearInterval(servicePollingInterval);
        servicePollingInterval = null;
      }
    } catch (e) {
      console.warn("Failed to stop native step service", e);
    }
  }
}

export const nativeSensorManager = new NativeSensorManager();
