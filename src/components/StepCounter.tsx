import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface StepCounterProps {
  steps: number;
  className?: string;
}

export const StepCounter = ({ steps, className }: StepCounterProps) => {
  const [displaySteps, setDisplaySteps] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 800;
    const startSteps = displaySteps;
    const stepDiff = steps - startSteps;

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentSteps = Math.floor(startSteps + (stepDiff * easeOut));
      
      setDisplaySteps(currentSteps);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplaySteps(steps);
      }
    };

    if (stepDiff !== 0) {
      requestAnimationFrame(updateCounter);
    }
  }, [steps, displaySteps]);

  // Format number with commas for readability
  const formatSteps = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className={cn("text-center", className)}>
      <div className="step-display animate-counter-up">
        {formatSteps(displaySteps)}
      </div>
      <div className="tech-label mt-2">
        STEPS TODAY
      </div>
    </div>
  );
};