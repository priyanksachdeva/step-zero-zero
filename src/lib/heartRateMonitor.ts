/**
 * Heart Rate Monitor - Phase 1.2
 * Nothing-Style Health App - Camera-based HR detection
 * Uses phone camera + flashlight to detect heart rate via fingertip
 */

export interface HeartRateReading {
  timestamp: Date;
  bpm: number;
  quality: "poor" | "fair" | "good" | "excellent";
  confidence: number; // 0-1
}

export interface HeartRateZones {
  resting: number;
  fatBurn: [number, number];
  cardio: [number, number];
  peak: [number, number];
  maximum: number;
}

export interface HeartRateData {
  currentBpm: number;
  restingBpm: number;
  maxBpm: number;
  zones: HeartRateZones;
  recentReadings: HeartRateReading[];
  isMonitoring: boolean;
  measurementDuration: number; // seconds
}

export class HeartRateMonitor {
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;
  private isMonitoring: boolean = false;
  private measurements: number[] = [];
  private startTime: number = 0;
  private intervalId: number | null = null;
  private onReading: ((reading: HeartRateReading) => void) | null = null;
  private userAge: number = 25;

  constructor(userAge: number = 25) {
    this.userAge = userAge;
  }

  /**
   * Start heart rate monitoring
   */
  async startMonitoring(
    videoElement: HTMLVideoElement,
    onReading: (reading: HeartRateReading) => void
  ): Promise<boolean> {
    try {
      this.videoElement = videoElement;
      this.onReading = onReading;

      // Create canvas for processing
      this.canvas = document.createElement("canvas");
      this.canvas.width = 640;
      this.canvas.height = 480;
      this.context = this.canvas.getContext("2d");

      // Request camera access with rear camera and flashlight
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Rear camera
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      // Enable flashlight
      await this.enableFlashlight();

      // Start monitoring
      this.isMonitoring = true;
      this.startTime = Date.now();
      this.measurements = [];

      // Process frames every 100ms
      this.intervalId = window.setInterval(() => {
        this.processFrame();
      }, 100);

      return true;
    } catch (error) {
      console.error("Failed to start heart rate monitoring:", error);
      this.stopMonitoring();
      return false;
    }
  }

  /**
   * Stop heart rate monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.stream) {
      // Disable flashlight
      this.disableFlashlight();

      // Stop camera
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.measurements = [];
  }

  /**
   * Enable camera flashlight
   */
  private async enableFlashlight(): Promise<void> {
    if (!this.stream) return;

    try {
      const track = this.stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;

      if ("torch" in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: true } as any],
        });
      }
    } catch (error) {
      console.warn("Could not enable flashlight:", error);
    }
  }

  /**
   * Disable camera flashlight
   */
  private async disableFlashlight(): Promise<void> {
    if (!this.stream) return;

    try {
      const track = this.stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;

      if ("torch" in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: false } as any],
        });
      }
    } catch (error) {
      console.warn("Could not disable flashlight:", error);
    }
  }

  /**
   * Process video frame to detect heart rate
   */
  private processFrame(): void {
    if (
      !this.videoElement ||
      !this.canvas ||
      !this.context ||
      !this.isMonitoring
    ) {
      return;
    }

    // Draw video frame to canvas
    this.context.drawImage(
      this.videoElement,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    // Get image data from center area (where finger should be)
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const sampleSize = 50; // 50x50 pixel area

    const imageData = this.context.getImageData(
      centerX - sampleSize / 2,
      centerY - sampleSize / 2,
      sampleSize,
      sampleSize
    );

    // Calculate average red value (blood absorption)
    let redSum = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      redSum += imageData.data[i]; // Red channel
    }
    const avgRed = redSum / (imageData.data.length / 4);

    // Store measurement
    this.measurements.push(avgRed);

    // Keep only last 15 seconds of data (150 measurements at 100ms intervals)
    if (this.measurements.length > 150) {
      this.measurements.shift();
    }

    // Calculate heart rate if we have enough data (at least 5 seconds)
    if (this.measurements.length >= 50) {
      const bpm = this.calculateHeartRate();
      const quality = this.assessMeasurementQuality();
      const confidence = this.calculateConfidence();

      if (bpm > 0 && this.onReading) {
        this.onReading({
          timestamp: new Date(),
          bpm,
          quality,
          confidence,
        });
      }
    }
  }

  /**
   * Calculate heart rate from red channel variations
   */
  private calculateHeartRate(): number {
    if (this.measurements.length < 50) return 0;

    // Apply simple high-pass filter to remove slow trends
    const filtered = this.measurements.map((value, index) => {
      if (index === 0) return 0;
      return value - this.measurements[index - 1];
    });

    // Find peaks in the filtered signal
    const peaks: number[] = [];
    const threshold = this.calculateThreshold(filtered);

    for (let i = 1; i < filtered.length - 1; i++) {
      if (
        filtered[i] > filtered[i - 1] &&
        filtered[i] > filtered[i + 1] &&
        filtered[i] > threshold
      ) {
        peaks.push(i);
      }
    }

    // Calculate intervals between peaks
    if (peaks.length < 2) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }

    // Convert to BPM
    const avgInterval =
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const intervalInSeconds = (avgInterval * 100) / 1000; // 100ms per measurement
    const bpm = 60 / intervalInSeconds;

    // Validate BPM range (40-200 BPM)
    if (bpm < 40 || bpm > 200) return 0;

    return Math.round(bpm);
  }

  /**
   * Calculate threshold for peak detection
   */
  private calculateThreshold(data: number[]): number {
    const sorted = [...data].sort((a, b) => a - b);
    const q75Index = Math.floor(sorted.length * 0.75);
    return sorted[q75Index];
  }

  /**
   * Assess measurement quality based on signal consistency
   */
  private assessMeasurementQuality(): "poor" | "fair" | "good" | "excellent" {
    if (this.measurements.length < 100) return "poor";

    // Calculate signal to noise ratio
    const signal = this.measurements.slice(-100); // Last 10 seconds
    const mean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
    const variance =
      signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      signal.length;
    const snr = mean / Math.sqrt(variance);

    if (snr > 10) return "excellent";
    if (snr > 7) return "good";
    if (snr > 4) return "fair";
    return "poor";
  }

  /**
   * Calculate confidence in measurement
   */
  private calculateConfidence(): number {
    if (this.measurements.length < 100) return 0;

    // Base confidence on signal quality and consistency
    const recentMeasurements = this.measurements.slice(-50);
    const mean =
      recentMeasurements.reduce((sum, val) => sum + val, 0) /
      recentMeasurements.length;
    const variance =
      recentMeasurements.reduce(
        (sum, val) => sum + Math.pow(val - mean, 2),
        0
      ) / recentMeasurements.length;
    const cv = Math.sqrt(variance) / mean; // Coefficient of variation

    // Lower coefficient of variation = higher confidence
    const confidence = Math.max(0, Math.min(1, 1 - cv * 2));
    return confidence;
  }

  /**
   * Calculate heart rate zones based on age
   */
  getHeartRateZones(): HeartRateZones {
    const maxHR = 220 - this.userAge;

    return {
      resting: 60, // Will be updated with actual measurements
      fatBurn: [Math.round(maxHR * 0.5), Math.round(maxHR * 0.69)],
      cardio: [Math.round(maxHR * 0.7), Math.round(maxHR * 0.84)],
      peak: [Math.round(maxHR * 0.85), Math.round(maxHR * 0.94)],
      maximum: maxHR,
    };
  }

  /**
   * Determine heart rate zone for given BPM
   */
  getHeartRateZone(
    bpm: number
  ): "resting" | "fatBurn" | "cardio" | "peak" | "maximum" {
    const zones = this.getHeartRateZones();

    if (bpm <= zones.resting + 10) return "resting";
    if (bpm >= zones.fatBurn[0] && bpm <= zones.fatBurn[1]) return "fatBurn";
    if (bpm >= zones.cardio[0] && bpm <= zones.cardio[1]) return "cardio";
    if (bpm >= zones.peak[0] && bpm <= zones.peak[1]) return "peak";
    return "maximum";
  }

  /**
   * Update user age for zone calculations
   */
  updateUserAge(age: number): void {
    this.userAge = age;
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(): {
    isMonitoring: boolean;
    duration: number;
    measurementCount: number;
    quality: "poor" | "fair" | "good" | "excellent";
  } {
    return {
      isMonitoring: this.isMonitoring,
      duration: this.isMonitoring ? (Date.now() - this.startTime) / 1000 : 0,
      measurementCount: this.measurements.length,
      quality: this.assessMeasurementQuality(),
    };
  }

  /**
   * Check if device supports heart rate monitoring
   */
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      HTMLCanvasElement.prototype.getContext
    );
  }

  /**
   * Get estimated resting heart rate from historical data
   */
  estimateRestingHeartRate(readings: HeartRateReading[]): number {
    if (readings.length === 0) return 60;

    // Filter for high-quality readings
    const qualityReadings = readings.filter(
      (reading) => reading.quality === "good" || reading.quality === "excellent"
    );

    if (qualityReadings.length === 0) return 60;

    // Take the lowest 10% of readings as resting HR estimate
    const sortedBpm = qualityReadings.map((r) => r.bpm).sort((a, b) => a - b);
    const restingCount = Math.max(1, Math.floor(sortedBpm.length * 0.1));
    const restingValues = sortedBpm.slice(0, restingCount);

    return Math.round(
      restingValues.reduce((sum, bpm) => sum + bpm, 0) / restingValues.length
    );
  }
}
