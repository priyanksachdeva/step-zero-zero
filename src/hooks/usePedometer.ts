import { useState, useEffect } from 'react';

// Mock data generator for demonstration
const generateMockData = () => {
  const now = new Date();
  const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Simulate realistic step progression throughout the day
  const baseSteps = Math.floor(Math.random() * 3000) + 7000; // 7K-10K base
  const timeProgress = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
  const currentSteps = Math.floor(baseSteps * timeProgress * (1 + Math.random() * 0.3));
  
  // Generate week data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (today - 6 + i + 7) % 7; // Start from 7 days ago
    const isToday = i === 6;
    const daySteps = isToday ? currentSteps : Math.floor(Math.random() * 8000) + 4000;
    
    return {
      day: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dayIndex],
      steps: daySteps,
      goal: 10000,
      isToday
    };
  });
  
  return {
    currentSteps,
    weekData,
    dailyGoal: 10000,
    distance: (currentSteps * 0.0008).toFixed(1), // Rough km calculation
    calories: Math.floor(currentSteps * 0.04),
    activeTime: Math.floor(currentSteps / 120) // Rough minutes calculation
  };
};

export const usePedometer = () => {
  const [data, setData] = useState(generateMockData());
  const [isTracking, setIsTracking] = useState(true);

  // Simulate step counting with gradual increases
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setData(prevData => {
        // Small random increment to simulate real step counting
        const increment = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;
        const newSteps = prevData.currentSteps + increment;
        
        // Update current day in week data
        const newWeekData = prevData.weekData.map(day => 
          day.isToday ? { ...day, steps: newSteps } : day
        );
        
        return {
          ...prevData,
          currentSteps: newSteps,
          weekData: newWeekData,
          distance: (newSteps * 0.0008).toFixed(1),
          calories: Math.floor(newSteps * 0.04),
          activeTime: Math.floor(newSteps / 120)
        };
      });
    }, 3000); // Update every 3 seconds for demo

    return () => clearInterval(interval);
  }, [isTracking]);

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  const resetDailySteps = () => {
    setData(prevData => ({
      ...prevData,
      currentSteps: 0,
      distance: "0.0",
      calories: 0,
      activeTime: 0,
      weekData: prevData.weekData.map(day => 
        day.isToday ? { ...day, steps: 0 } : day
      )
    }));
  };

  return {
    ...data,
    isTracking,
    toggleTracking,
    resetDailySteps,
    progress: data.currentSteps / data.dailyGoal
  };
};