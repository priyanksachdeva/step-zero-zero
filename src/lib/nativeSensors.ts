/**
 * Native Sensor Manager for Capacitor
 * Enhanced implementation with proper Android sensor access
 */

import { Device } from "@capacitor/device";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

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

export class NativeSensorManager {
  private isNative: boolean = false;
  private motionListeners: Array<(data: NativeMotionData) => void> = [];
  private isListening: boolean = false;
  private motionHandler: ((event: DeviceMotionEvent) => void) | null = null;

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

    try {
      this.motionHandler = (event: DeviceMotionEvent) => {
        console.log(
          "Motion event received!",
          event.accelerationIncludingGravity
        );

        if (!event.accelerationIncludingGravity) {
          console.log("No acceleration data in event");
          return;
        }

        const motionData: NativeMotionData = {
          accelerationIncludingGravity: {
            x: event.accelerationIncludingGravity.x || 0,
            y: event.accelerationIncludingGravity.y || 0,
            z: event.accelerationIncludingGravity.z || 0,
          },
          acceleration: {
            x: event.acceleration?.x || 0,
            y: event.acceleration?.y || 0,
            z: event.acceleration?.z || 0,
          },
          rotationRate: {
            alpha: event.rotationRate?.alpha || 0,
            beta: event.rotationRate?.beta || 0,
            gamma: event.rotationRate?.gamma || 0,
          },
          interval: event.interval || 16,
        };

        this.motionListeners.forEach((listener) => {
          try {
            listener(motionData);
          } catch (error) {
            console.error("Motion listener error:", error);
          }
        });
      };

      console.log("Adding devicemotion event listener...");
      window.addEventListener("devicemotion", this.motionHandler, true);
      this.isListening = true;
      console.log("Motion monitoring started successfully");

      // Test if events are firing
      setTimeout(() => {
        console.log("Motion monitoring status after 3 seconds:", {
          isListening: this.isListening,
          listenersCount: this.motionListeners.length,
        });
      }, 3000);

      return true;
    } catch (error) {
      console.error("Failed to start motion monitoring:", error);
      return false;
    }
  }

  stopMotionMonitoring(): void {
    if (this.motionHandler) {
      window.removeEventListener("devicemotion", this.motionHandler, true);
      this.motionHandler = null;
    }
    this.isListening = false;
    this.motionListeners = [];
    console.log("Motion monitoring stopped");
  }

  async vibrate(style: "light" | "medium" | "heavy" = "light"): Promise<void> {
    try {
      if (this.isNative) {
        const impactStyle =
          style === "light"
            ? ImpactStyle.Light
            : style === "medium"
            ? ImpactStyle.Medium
            : ImpactStyle.Heavy;
        await Haptics.impact({ style: impactStyle });
      } else {
        if ("vibrate" in navigator) {
          const duration =
            style === "light" ? 50 : style === "medium" ? 100 : 200;
          navigator.vibrate(duration);
        }
      }
    } catch (error) {
      console.error("Vibration error:", error);
    }
  }

  isNativePlatform(): boolean {
    return this.isNative;
  }

  getSensorStatus(): any {
    return {
      isNative: this.isNative,
      isListening: this.isListening,
      listenersCount: this.motionListeners.length,
      hasDeviceMotion: typeof DeviceMotionEvent !== "undefined",
      hasPermissionAPI:
        typeof (DeviceMotionEvent as any)?.requestPermission === "function",
    };
  }
}

export const nativeSensorManager = new NativeSensorManager();
