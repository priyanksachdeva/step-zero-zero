import { useState, useEffect, useRef, memo } from "react";
import { cn } from "@/lib/utils";

interface StepCounterProps {
  steps: number;
  className?: string;
  showAnimation?: boolean;
  showLabel?: boolean;
  size?: "small" | "medium" | "large";
}

export const StepCounter = memo(
  ({
    steps,
    className,
    showAnimation = true,
    showLabel = true,
    size = "large",
  }: StepCounterProps) => {
    const [displaySteps, setDisplaySteps] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [digits, setDigits] = useState<string[]>([]);
    const prevStepsRef = useRef(0);

    // Split number into individual digits for Nothing-style digit animation
    const splitIntoDigits = (num: number): string[] => {
      const formattedNum = num.toLocaleString("en-US");
      return formattedNum.split("");
    };

    useEffect(() => {
      if (!showAnimation) {
        setDisplaySteps(steps);
        setDigits(splitIntoDigits(steps));
        return;
      }

      const startTime = Date.now();
      const duration = steps > prevStepsRef.current + 10 ? 1200 : 600; // Longer animation for big jumps
      const startSteps = displaySteps;
      const stepDiff = steps - startSteps;

      if (Math.abs(stepDiff) > 0) {
        setIsAnimating(true);
      }

      const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Nothing-style easing - precise and technical
        const easeOut =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const currentSteps = Math.floor(startSteps + stepDiff * easeOut);

        setDisplaySteps(currentSteps);
        setDigits(splitIntoDigits(currentSteps));

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          setDisplaySteps(steps);
          setDigits(splitIntoDigits(steps));
          setIsAnimating(false);
          prevStepsRef.current = steps;
        }
      };

      if (stepDiff !== 0) {
        requestAnimationFrame(updateCounter);
      } else {
        setDigits(splitIntoDigits(steps));
      }
    }, [steps, displaySteps, showAnimation]);

    // Get size classes
    const getSizeClasses = () => {
      switch (size) {
        case "small":
          return "text-3xl md:text-4xl";
        case "medium":
          return "text-5xl md:text-6xl";
        case "large":
        default:
          return "text-6xl md:text-8xl lg:text-9xl";
      }
    };

    // Check for milestone achievements
    const getMilestoneStatus = () => {
      const milestones = [1000, 5000, 10000, 15000, 20000, 25000];
      const currentMilestone = milestones.find(
        (m) => prevStepsRef.current < m && displaySteps >= m
      );
      return currentMilestone;
    };

    const milestone = getMilestoneStatus();

    return (
      <div className={cn("text-center", className)}>
        <div aria-live="polite" aria-atomic="true">
          {/* Main step counter */}
          <div
            className={cn(
              "step-display transition-nothing",
              getSizeClasses(),
              isAnimating && "animate-pulse-subtle",
              milestone && "animate-milestone"
            )}
          >
            {/* Individual digit animation containers */}
            <div className="flex justify-center items-center">
              {digits.map((digit, index) => (
                <span
                  key={`${index}-${digit}`}
                  className={cn(
                    "inline-block transition-all duration-300",
                    digit === "," && "mx-1 opacity-60",
                    isAnimating && "animate-scale-in"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step label */}
        {showLabel && (
          <div className="tech-label mt-4 transition-nothing">
            {milestone ? (
              <span className="text-success animate-pulse">
                MILESTONE: {milestone.toLocaleString()} STEPS!
              </span>
            ) : (
              "STEPS TODAY"
            )}
          </div>
        )}

        {/* Nothing-style progress indicators */}
        <div className="flex justify-center mt-2 space-x-1">
          {[1000, 5000, 10000, 15000, 20000].map((target) => (
            <div
              key={target}
              className={cn(
                "w-1 h-1 rounded-full transition-all duration-500",
                displaySteps >= target
                  ? "bg-accent shadow-glow"
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>

        {/* Real-time step rate indicator */}
        {displaySteps > 0 && (
          <div className="mt-3 text-center">
            <div className="tech-label text-muted-foreground/70">
              {/* Calculate steps per minute based on time of day */}
              AVG:{" "}
              {Math.round(
                (displaySteps / (new Date().getHours() + 1)) * 60
              )}{" "}
              STEPS/HR
            </div>
          </div>
        )}
      </div>
    );
  }
);

StepCounter.displayName = "StepCounter";
