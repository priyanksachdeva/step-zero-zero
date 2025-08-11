import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings, Activity } from "@/components/icons/NothingIcon";
import React from "react";

interface AppHeaderProps {
  currentDate: string;
  currentTime: string;
  onOpenSettings: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentDate,
  currentTime,
  onOpenSettings,
}) => {
  return (
    <div className="px-3 py-3 border-b border-border/20 bg-background/95 backdrop-blur-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            <Activity className="w-2 h-2 mr-1" />
            STEPS
          </Badge>
          <div className="font-mono text-xs text-muted-foreground">
            {currentDate}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="font-display text-lg tabular-nums">
              {currentTime}
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onOpenSettings}
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6 btn-nothing hover:bg-accent/10 transition-all duration-200"
                aria-label="Open settings"
              >
                <Settings className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Open settings</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
