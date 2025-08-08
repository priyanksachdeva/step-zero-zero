import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, Download, Upload, Battery, Smartphone } from "@/components/icons/NothingIcon";

interface UserSettings {
  dailyGoal: number;
  weight: number;
  strideLength: number;
  sensitivity: number;
  notificationsEnabled: boolean;
  theme: "dark" | "light";
}

interface SettingsProps {
  settings: UserSettings;
  onSettingsChange: (newSettings: Partial<UserSettings>) => void;
  onExportData: () => string;
  onImportData: (data: string) => Promise<boolean>;
  calibrationData?: {
    currentThreshold: number;
    sensitivity: number;
    averageActivity: number;
    stepCount: number;
  };
  batteryOptimized: boolean;
  sensorSupported: boolean | null;
}

export const SettingsPanel = ({
  settings,
  onSettingsChange,
  onExportData,
  onImportData,
  calibrationData,
  batteryOptimized,
  sensorSupported,
}: SettingsProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [importData, setImportData] = useState("");

  const handleGoalChange = (value: string) => {
    const goal = parseInt(value);
    if (goal >= 1000 && goal <= 50000) {
      onSettingsChange({ dailyGoal: goal });
    }
  };

  const handleWeightChange = (value: string) => {
    const weight = parseFloat(value);
    if (weight >= 30 && weight <= 200) {
      onSettingsChange({ weight });
    }
  };

  const handleStrideLengthChange = (value: string) => {
    const stride = parseFloat(value);
    if (stride >= 50 && stride <= 120) {
      onSettingsChange({ strideLength: stride });
    }
  };

  const handleSensitivityChange = (value: number[]) => {
    onSettingsChange({ sensitivity: value[0] });
  };

  const handleExport = () => {
    const data = onExportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stepzero-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (importData.trim()) {
      const success = await onImportData(importData.trim());
      if (success) {
        setImportData("");
        alert("Data imported successfully!");
      } else {
        alert("Failed to import data. Please check the format.");
      }
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <Settings className="w-6 h-6 text-accent" />
        <h1 className="font-display text-2xl">SETTINGS</h1>
      </div>

      {/* System Status */}
      <Card className="glass border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 tech-label">
            <Smartphone className="w-4 h-4" />
            <span>SYSTEM STATUS</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Motion Sensors</span>
            <span
              className={`tech-label text-xs ${
                sensorSupported === true
                  ? "text-success"
                  : sensorSupported === false
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {sensorSupported === true
                ? "SUPPORTED"
                : sensorSupported === false
                ? "NOT SUPPORTED"
                : "CHECKING..."}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Battery Optimization</span>
            <div className="flex items-center space-x-2">
              <Battery
                className={`w-4 h-4 ${
                  batteryOptimized ? "text-success" : "text-muted-foreground"
                }`}
              />
              <span
                className={`tech-label text-xs ${
                  batteryOptimized ? "text-success" : "text-muted-foreground"
                }`}
              >
                {batteryOptimized ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          </div>

          {calibrationData && (
            <div className="space-y-2 pt-2 border-t border-muted/20">
              <div className="flex justify-between text-xs">
                <span>Detection Threshold</span>
                <span className="font-mono">
                  {calibrationData.currentThreshold.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Average Activity</span>
                <span className="font-mono">
                  {calibrationData.averageActivity.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Settings */}
      <Card className="glass border-muted/20">
        <CardHeader>
          <CardTitle className="tech-label">PERSONAL SETTINGS</CardTitle>
          <CardDescription>
            Customize your goals and physical parameters for accurate tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="daily-goal" className="tech-label">
              DAILY STEP GOAL
            </Label>
            <Input
              id="daily-goal"
              type="number"
              value={settings.dailyGoal}
              onChange={(e) => handleGoalChange(e.target.value)}
              min="1000"
              max="50000"
              step="500"
              className="glass"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 8,000-12,000 steps per day
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight" className="tech-label">
              WEIGHT (KG)
            </Label>
            <Input
              id="weight"
              type="number"
              value={settings.weight}
              onChange={(e) => handleWeightChange(e.target.value)}
              min="30"
              max="200"
              step="0.5"
              className="glass"
            />
            <p className="text-xs text-muted-foreground">
              Used for accurate calorie calculation
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stride" className="tech-label">
              STRIDE LENGTH (CM)
            </Label>
            <Input
              id="stride"
              type="number"
              value={settings.strideLength}
              onChange={(e) => handleStrideLengthChange(e.target.value)}
              min="50"
              max="120"
              step="1"
              className="glass"
            />
            <p className="text-xs text-muted-foreground">
              Average adult: 70-80cm. Measure by walking 10 steps.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="glass border-muted/20">
        <CardHeader>
          <CardTitle
            className="tech-label cursor-pointer flex items-center justify-between"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            ADVANCED SETTINGS
            <span className="text-xs text-muted-foreground">
              {showAdvanced ? "HIDE" : "SHOW"}
            </span>
          </CardTitle>
        </CardHeader>

        {showAdvanced && (
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="tech-label">DETECTION SENSITIVITY</Label>
              <Slider
                value={[settings.sensitivity]}
                onValueChange={handleSensitivityChange}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Less Sensitive</span>
                <span className="font-mono">
                  {settings.sensitivity.toFixed(1)}
                </span>
                <span>More Sensitive</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Adjust if steps are being missed or false steps detected
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label className="tech-label">NOTIFICATIONS</Label>
                <p className="text-xs text-muted-foreground">
                  Goal reminders and achievements
                </p>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) =>
                  onSettingsChange({ notificationsEnabled: checked })
                }
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Data Management */}
      <Card className="glass border-muted/20">
        <CardHeader>
          <CardTitle className="tech-label">DATA MANAGEMENT</CardTitle>
          <CardDescription>
            Export your data or import from a backup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleExport}
            variant="outline"
            className="w-full glass border-accent/20 hover:border-accent/40"
          >
            <Download className="w-4 h-4 mr-2" />
            EXPORT DATA
          </Button>

          <div className="space-y-2">
            <Label htmlFor="import-data" className="tech-label">
              IMPORT DATA
            </Label>
            <textarea
              id="import-data"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste exported JSON data here..."
              className="w-full h-24 px-3 py-2 text-sm bg-background border border-muted/20 rounded-md resize-none glass"
            />
            <Button
              onClick={handleImport}
              disabled={!importData.trim()}
              variant="outline"
              className="w-full glass border-muted/20 hover:border-accent/40"
            >
              <Upload className="w-4 h-4 mr-2" />
              IMPORT DATA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Warning */}
      <div className="text-center pt-4">
        <p className="text-xs text-muted-foreground">
          All data is stored locally on your device for privacy.
          <br />
          Regular exports are recommended as backup.
        </p>
      </div>
    </div>
  );
};
