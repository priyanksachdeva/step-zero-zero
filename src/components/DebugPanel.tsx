/**
 * Debug Panel for Step Detection
 * Shows sensor status and step detection debugging info
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { nativeSensorManager } from "@/lib/nativeSensors";
import { Activity, Smartphone, Zap } from "lucide-react";

export const DebugPanel = () => {
  const [sensorStatus, setSensorStatus] = useState<any>({});
  const [motionData, setMotionData] = useState<any>(null);
  const [stepCount, setStepCount] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const refreshStatus = () => {
    setSensorStatus(nativeSensorManager.getSensorStatus());
  };

  const startDebugMonitoring = async () => {
    try {
      console.log("User clicked Start Debug button");

      // Add vibration to indicate user interaction
      await nativeSensorManager.vibrate("medium");

      const success = await nativeSensorManager.startMotionMonitoring(
        (data) => {
          setMotionData(data);
          console.log("Motion data received:", data);

          // Simple step detection based on acceleration magnitude
          const magnitude = Math.sqrt(
            data.accelerationIncludingGravity.x ** 2 +
              data.accelerationIncludingGravity.y ** 2 +
              data.accelerationIncludingGravity.z ** 2
          );

          console.log("Motion magnitude:", magnitude);

          if (magnitude > 12) {
            // Simple threshold
            console.log("Step detected! Magnitude:", magnitude);
            setStepCount((prev) => prev + 1);
            nativeSensorManager.vibrate("light");
          }
        }
      );

      if (success) {
        setIsMonitoring(true);
        console.log("Debug monitoring started successfully");

        // Immediate status refresh
        setTimeout(() => {
          refreshStatus();
        }, 500);
      } else {
        console.error("Failed to start debug monitoring");
        alert("Failed to start motion monitoring. Check console for details.");
      }
    } catch (error) {
      console.error("Debug monitoring failed:", error);
      alert(`Debug failed: ${error.message}`);
    }
  };

  const stopDebugMonitoring = () => {
    nativeSensorManager.stopMotionMonitoring();
    setIsMonitoring(false);
    console.log("Debug monitoring stopped");
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Sensor Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Platform Info */}
          <div className="grid grid-cols-2 gap-2">
            <Badge variant={sensorStatus.isNative ? "default" : "secondary"}>
              <Smartphone className="w-3 h-3 mr-1" />
              {sensorStatus.isNative ? "Native App" : "Web App"}
            </Badge>
            <Badge
              variant={sensorStatus.hasDeviceMotion ? "default" : "destructive"}
            >
              <Zap className="w-3 h-3 mr-1" />
              Motion API:{" "}
              {sensorStatus.hasDeviceMotion ? "Available" : "Missing"}
            </Badge>
          </div>

          {/* Sensor Status */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Listening: {sensorStatus.isListening ? "✅" : "❌"}
            </p>
            <p className="text-sm text-muted-foreground">
              Listeners: {sensorStatus.listenersCount || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Permission API:{" "}
              {sensorStatus.hasPermissionAPI ? "iOS" : "Android/Web"}
            </p>
          </div>

          {/* Motion Status */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Motion Events:</span>
              <span className="text-sm">
                {motionData ? "🟢 Active" : "🔴 No Data"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Device Motion:</span>
              <span className="text-sm">
                {typeof DeviceMotionEvent !== "undefined"
                  ? "🟢 Supported"
                  : "🔴 Not Supported"}
              </span>
            </div>
          </div>

          {/* Debug Controls */}
          <div className="flex gap-2">
            <Button
              onClick={
                isMonitoring ? stopDebugMonitoring : startDebugMonitoring
              }
              variant={isMonitoring ? "destructive" : "default"}
              size="sm"
            >
              {isMonitoring ? "Stop Debug" : "Start Debug"}
            </Button>
            <Button onClick={refreshStatus} variant="outline" size="sm">
              Refresh Status
            </Button>
          </div>

          {/* Motion Data */}
          {motionData && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Motion Data:</h4>
              <div className="text-xs font-mono space-y-1">
                <p>
                  X:{" "}
                  {motionData.accelerationIncludingGravity.x?.toFixed(2) || 0}
                </p>
                <p>
                  Y:{" "}
                  {motionData.accelerationIncludingGravity.y?.toFixed(2) || 0}
                </p>
                <p>
                  Z:{" "}
                  {motionData.accelerationIncludingGravity.z?.toFixed(2) || 0}
                </p>
                <p>
                  Magnitude:{" "}
                  {Math.sqrt(
                    (motionData.accelerationIncludingGravity.x || 0) ** 2 +
                      (motionData.accelerationIncludingGravity.y || 0) ** 2 +
                      (motionData.accelerationIncludingGravity.z || 0) ** 2
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Debug Step Count */}
          <div className="text-center p-4 border rounded">
            <p className="text-2xl font-bold">{stepCount}</p>
            <p className="text-sm text-muted-foreground">Debug Steps</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
