import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "@/components/icons/NothingIcon";
import { SettingsPanel } from "@/components/SettingsPanel";

interface SettingsOverlayProps {
  open: boolean;
  onClose: () => void;
  settings: any;
  onSettingsChange: (v: any) => void;
  onExportData: () => string; // corrected signature
  onImportData: (data: string) => Promise<boolean>; // corrected signature
  batteryOptimized: boolean;
  sensorSupported: boolean;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
  open,
  onClose,
  settings,
  onSettingsChange,
  onExportData,
  onImportData,
  batteryOptimized,
  sensorSupported,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="w-full max-w-[320px] mx-auto p-3 min-h-screen">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="tech-label text-accent text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                SETTINGS
              </CardTitle>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="btn-nothing text-xs hover:bg-accent/10"
              >
                <span>CLOSE</span>
              </Button>
            </div>
          </CardHeader>
        </Card>
        <SettingsPanel
          settings={settings}
          onSettingsChange={onSettingsChange}
          onExportData={onExportData}
          onImportData={onImportData}
          batteryOptimized={batteryOptimized}
          sensorSupported={sensorSupported}
        />
      </div>
    </div>
  );
};
