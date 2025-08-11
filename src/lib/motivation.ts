export function getMotivationalMessage(
  progress: number,
  timeOfDay: "morning" | "afternoon" | "evening" | "night"
) {
  const pct = Math.round(progress * 100);
  if (pct === 0)
    return timeOfDay === "morning"
      ? "Ready to start your day?"
      : "Time to get moving";
  if (pct < 25) return "Every step counts";
  if (pct < 50) return "Building momentum";
  if (pct < 75) return "Over halfway there";
  if (pct < 100) return "Almost at your goal";
  return "Goal achieved! 🎯";
}
