import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Home, Heart, BarChart3, Target } from "@/components/icons/NothingIcon";

export type MainTab = "home" | "health" | "insights" | "profile";

interface BottomNavProps {
  active: MainTab;
  onChange: (tab: MainTab) => void;
}

interface TabMeta {
  id: MainTab;
  label: string;
  icon: any;
}

const tabs: TabMeta[] = [
  { id: "home", label: "HOME", icon: Home },
  { id: "health", label: "HEALTH", icon: Heart },
  { id: "insights", label: "DATA", icon: BarChart3 },
  { id: "profile", label: "PROFILE", icon: Target },
];

export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg"
      role="tablist"
      aria-label="Primary"
    >
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-4 px-1 py-1">
          {tabs.map(({ id, label, icon: Icon }) => {
            const activeState = id === active;
            return (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <button
                    role="tab"
                    aria-selected={activeState}
                    aria-label={`Switch to ${label.toLowerCase()} tab`}
                    onClick={() => onChange(id)}
                    className={`flex flex-col items-center justify-center p-2 transition-all duration-200 rounded-sm relative ${
                      activeState
                        ? "text-accent bg-accent/10 scale-105"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mb-1 transition-transform duration-200 ${
                        activeState ? "scale-110" : ""
                      }`}
                    />
                    <span className="tech-label text-[10px] leading-none">
                      {label}
                    </span>
                    {activeState && (
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs capitalize">{label.toLowerCase()}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
