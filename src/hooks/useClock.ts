import { useState, useEffect } from "react";

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

interface ClockState {
  dateLabel: string; // e.g. MON 12 AUG
  timeLabel: string; // HH:MM
  timeOfDay: TimeOfDay;
}

export function useClock(): ClockState {
  const make = (): ClockState => {
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay: TimeOfDay = "morning";
    if (hour < 6) timeOfDay = "night";
    else if (hour < 12) timeOfDay = "morning";
    else if (hour < 18) timeOfDay = "afternoon";
    else timeOfDay = "evening";
    const dateLabel = now
      .toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
      .toUpperCase();
    const timeLabel = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return { dateLabel, timeLabel, timeOfDay };
  };
  const [state, setState] = useState<ClockState>(make);
  useEffect(() => {
    const id = setInterval(() => setState(make()), 60_000); // update every minute
    return () => clearInterval(id);
  }, []);
  return state;
}
