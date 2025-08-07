/**
 * Heart Rate Dashboard - Phase 1.2
 * Nothing-Style Health App - Heart Rate Monitoring
 * Camera-based HR detection with zones and trends
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Camera,
  Zap,
  Target,
  TrendingUp,
  Play,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HeartRateMonitor,
  HeartRateReading,
  HeartRateZones,
} from "@/lib/heartRateMonitor";

interface HeartRateDashboardProps {
  userAge: number;
  onUserAgeUpdate: (age: number) => void;
}

const HeartRateDashboard: React.FC<HeartRateDashboardProps> = ({
  userAge,
  onUserAgeUpdate,
}) => {
  const [monitor] = useState(() => new HeartRateMonitor(userAge));
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentReading, setCurrentReading] = useState<HeartRateReading | null>(
    null
  );
  const [readings, setReadings] = useState<HeartRateReading[]>([]);
  const [monitoringStatus, setMonitoringStatus] = useState({
    duration: 0,
    measurementCount: 0,
    quality: "poor" as "poor" | "fair" | "good" | "excellent",
  });
  const [error, setError] = useState<string | null>(null);
  const [zones, setZones] = useState<HeartRateZones>(
    monitor.getHeartRateZones()
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const statusIntervalRef = useRef<number | null>(null);

  // Update zones when age changes
  useEffect(() => {
    monitor.updateUserAge(userAge);
    setZones(monitor.getHeartRateZones());
  }, [userAge, monitor]);

  // Load stored readings
  useEffect(() => {
    const storedReadings = localStorage.getItem("heartRateReadings");
    if (storedReadings) {
      try {
        const parsed = JSON.parse(storedReadings).map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp),
        }));
        setReadings(parsed);
      } catch (error) {
        console.error("Failed to load heart rate readings:", error);
      }
    }
  }, []);

  // Save readings to localStorage
  useEffect(() => {
    if (readings.length > 0) {
      localStorage.setItem("heartRateReadings", JSON.stringify(readings));
    }
  }, [readings]);

  const startMonitoring = async () => {
    if (!videoRef.current) return;

    setError(null);
    const success = await monitor.startMonitoring(
      videoRef.current,
      (reading) => {
        setCurrentReading(reading);
        setReadings((prev) => [...prev.slice(-99), reading]); // Keep last 100 readings
      }
    );

    if (success) {
      setIsMonitoring(true);
      // Update status every second
      statusIntervalRef.current = window.setInterval(() => {
        setMonitoringStatus(monitor.getMonitoringStatus());
      }, 1000);
    } else {
      setError(
        "Failed to access camera. Please ensure camera permission is granted."
      );
    }
  };

  const stopMonitoring = () => {
    monitor.stopMonitoring();
    setIsMonitoring(false);
    setCurrentReading(null);

    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case "resting":
        return "text-muted-foreground";
      case "fatBurn":
        return "text-blue-400";
      case "cardio":
        return "text-green-400";
      case "peak":
        return "text-yellow-400";
      case "maximum":
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "text-green-400";
      case "good":
        return "text-blue-400";
      case "fair":
        return "text-yellow-400";
      case "poor":
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentZone = currentReading
    ? monitor.getHeartRateZone(currentReading.bpm)
    : "resting";
  const restingHR =
    readings.length > 0
      ? monitor.estimateRestingHeartRate(readings)
      : zones.resting;
  const recentAverage =
    readings.length > 0
      ? Math.round(
          readings.slice(-10).reduce((sum, r) => sum + r.bpm, 0) /
            Math.min(10, readings.length)
        )
      : 0;

  const isSupported = HeartRateMonitor.isSupported();

  if (!isSupported) {
    return (
      <div className="space-y-6">
        <div className="glass-medium p-6 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <div className="tech-label text-accent mb-2">HEART RATE MONITOR</div>
          <div className="text-sm text-muted-foreground font-mono">
            Camera access not available on this device
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Camera Interface */}
      <div className="glass-medium p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="tech-label">HEART RATE MONITOR</div>
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              {isMonitoring ? "ACTIVE" : "READY"}
            </span>
          </div>
        </div>

        {/* Video Element */}
        <div className="relative bg-black rounded aspect-video overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Finger placement guide */}
          {isMonitoring && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-accent rounded-full animate-pulse">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-accent/20 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* Instructions overlay */}
          {!isMonitoring && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <Heart className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm font-mono">PLACE FINGER ON CAMERA</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Cover lens with fingertip
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex space-x-3">
          {!isMonitoring ? (
            <Button
              onClick={startMonitoring}
              className="btn-nothing primary flex-1 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>START MEASUREMENT</span>
            </Button>
          ) : (
            <Button
              onClick={stopMonitoring}
              className="btn-nothing flex-1 flex items-center justify-center space-x-2"
            >
              <Square className="w-4 h-4" />
              <span>STOP</span>
            </Button>
          )}
        </div>

        {/* Monitoring Status */}
        {isMonitoring && (
          <div className="border-t border-border pt-3">
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="text-center">
                <div className="text-muted-foreground">TIME</div>
                <div className="tabular-nums">
                  {formatDuration(monitoringStatus.duration)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">SAMPLES</div>
                <div className="tabular-nums">
                  {monitoringStatus.measurementCount}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">QUALITY</div>
                <div className={`${getQualityColor(monitoringStatus.quality)}`}>
                  {monitoringStatus.quality.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded">
            <div className="text-sm text-destructive font-mono">{error}</div>
          </div>
        )}
      </div>

      {/* Current Reading */}
      {currentReading && (
        <div className="glass-medium p-6 text-center">
          <div className="tech-label mb-2">CURRENT HEART RATE</div>
          <div className="font-display text-5xl mb-2 tabular-nums">
            {currentReading.bpm}
          </div>
          <div className="text-sm text-muted-foreground font-mono mb-4">
            BEATS PER MINUTE
          </div>

          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className={`${getZoneColor(currentZone)}`}>
              {currentZone.toUpperCase()} ZONE
            </div>
            <div className="text-muted-foreground">•</div>
            <div className={`${getQualityColor(currentReading.quality)}`}>
              {currentReading.quality.toUpperCase()} SIGNAL
            </div>
          </div>
        </div>
      )}

      {/* Heart Rate Zones */}
      <div className="glass p-4">
        <div className="tech-label mb-4">HEART RATE ZONES</div>
        <div className="space-y-3">
          {[
            {
              name: "RESTING",
              range: `< ${zones.resting + 10}`,
              zone: "resting",
              color: "text-muted-foreground",
            },
            {
              name: "FAT BURN",
              range: `${zones.fatBurn[0]}-${zones.fatBurn[1]}`,
              zone: "fatBurn",
              color: "text-blue-400",
            },
            {
              name: "CARDIO",
              range: `${zones.cardio[0]}-${zones.cardio[1]}`,
              zone: "cardio",
              color: "text-green-400",
            },
            {
              name: "PEAK",
              range: `${zones.peak[0]}-${zones.peak[1]}`,
              zone: "peak",
              color: "text-yellow-400",
            },
            {
              name: "MAX",
              range: `${zones.maximum}+`,
              zone: "maximum",
              color: "text-accent",
            },
          ].map((zoneInfo) => (
            <div
              key={zoneInfo.zone}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    currentZone === zoneInfo.zone
                      ? "bg-current animate-pulse"
                      : "bg-muted-foreground/30"
                  } ${zoneInfo.color}`}
                />
                <span className="text-sm font-mono">{zoneInfo.name}</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                {zoneInfo.range} BPM
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Heart Rate Statistics */}
      {readings.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-4 text-center">
            <Heart className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <div className="tech-label mb-1">RESTING HR</div>
            <div className="font-display text-2xl tabular-nums">
              {restingHR}
            </div>
            <div className="text-xs text-muted-foreground font-mono">BPM</div>
          </div>

          <div className="glass p-4 text-center">
            <TrendingUp className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <div className="tech-label mb-1">RECENT AVG</div>
            <div className="font-display text-2xl tabular-nums">
              {recentAverage}
            </div>
            <div className="text-xs text-muted-foreground font-mono">BPM</div>
          </div>
        </div>
      )}

      {/* Recent Readings */}
      {readings.length > 0 && (
        <div className="glass p-4">
          <div className="tech-label mb-4">RECENT READINGS</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {readings
              .slice(-10)
              .reverse()
              .map((reading, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-muted-foreground">
                    {reading.timestamp.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="tabular-nums">{reading.bpm} BPM</span>
                  <span className={`${getQualityColor(reading.quality)}`}>
                    {reading.quality.charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Age Setting */}
      <div className="glass p-4">
        <div className="tech-label mb-3">USER AGE (FOR HR ZONES)</div>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            value={userAge}
            onChange={(e) => onUserAgeUpdate(parseInt(e.target.value) || 25)}
            className="input-nothing flex-1"
            min="13"
            max="100"
          />
          <span className="text-xs text-muted-foreground font-mono">YEARS</span>
        </div>
        <div className="text-xs text-muted-foreground mt-2 font-mono">
          Max HR: {zones.maximum} BPM (220 - {userAge})
        </div>
      </div>
    </div>
  );
};

export default HeartRateDashboard;
