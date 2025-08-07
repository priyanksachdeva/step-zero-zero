/**
 * Mobile-Optimized Hydration Dashboard
 * Nothing-Style Health App - Simple Water Tracking Interface
 */

import React, { useState } from "react";
import { Droplets, Plus, Target, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HydrationDashboardProps {}

const HydrationDashboard: React.FC<HydrationDashboardProps> = () => {
  const [todayIntake, setTodayIntake] = useState(1250);
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const addWater = (amount: number) => {
    setTodayIntake((prev) => prev + amount);
  };

  const getHydrationStatus = () => {
    const percentage = (todayIntake / dailyGoal) * 100;
    if (percentage >= 100) return "OPTIMAL";
    if (percentage >= 75) return "GOOD";
    if (percentage >= 50) return "MODERATE";
    return "LOW";
  };

  const handleCustomAmount = () => {
    const amount = parseInt(customAmount);
    if (amount > 0) {
      addWater(amount);
      setCustomAmount("");
      setShowCustomAmount(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg text-white">HYDRATION</h1>
          <p className="text-xs text-gray-400">Smart tracking</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="glass border-white/10 hover:border-red-500/50"
        >
          <Settings className="w-3 h-3" />
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Water Intake */}
        <div className="glass p-3 border border-white/10 text-center">
          <div className="flex items-center justify-center mb-2 text-blue-400">
            <Droplets className="w-4 h-4" />
            <span className="ml-2 font-technical text-xs">TODAY</span>
          </div>
          <div className="text-2xl font-display text-white mb-1">
            {(todayIntake / 1000).toFixed(1)}L
          </div>
          <div className="text-xs text-gray-400">
            of {(dailyGoal / 1000).toFixed(1)}L goal
          </div>
          <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((todayIntake / dailyGoal) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Hydration Status */}
        <div className="glass p-3 border border-white/10 text-center">
          <div className="flex items-center justify-center mb-2 text-blue-400">
            <Target className="w-4 h-4" />
            <span className="ml-2 font-technical text-xs">STATUS</span>
          </div>
          <div className="text-lg font-display text-white mb-1">
            {getHydrationStatus()}
          </div>
          <div className="text-xs text-gray-400">Current level</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={() => addWater(250)}
          className="glass border-white/10 hover:border-blue-500/50 text-xs"
          variant="outline"
          size="sm"
        >
          <Plus className="w-3 h-3 mr-1" />
          250ml
        </Button>
        <Button
          onClick={() => addWater(500)}
          className="glass border-white/10 hover:border-blue-500/50 text-xs"
          variant="outline"
          size="sm"
        >
          <Plus className="w-3 h-3 mr-1" />
          500ml
        </Button>
        <Button
          onClick={() => setShowCustomAmount(true)}
          className="glass border-white/10 hover:border-blue-500/50 text-xs"
          variant="outline"
          size="sm"
        >
          <Plus className="w-3 h-3 mr-1" />
          Custom
        </Button>
      </div>

      {/* Today's Intake History */}
      <div className="glass p-3 border border-white/10">
        <h2 className="font-technical text-white mb-3 text-sm">
          TODAY'S INTAKE
        </h2>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 glass border border-white/5 rounded">
            <div className="text-xs text-gray-400">Morning</div>
            <div className="text-sm font-mono text-white">500ml</div>
          </div>
          <div className="text-center p-2 glass border border-white/5 rounded">
            <div className="text-xs text-gray-400">Noon</div>
            <div className="text-sm font-mono text-white">750ml</div>
          </div>
          <div className="text-center p-2 glass border border-white/5 rounded">
            <div className="text-xs text-gray-400">Evening</div>
            <div className="text-sm font-mono text-white">0ml</div>
          </div>
          <div className="text-center p-2 glass border border-white/5 rounded">
            <div className="text-xs text-gray-400">Night</div>
            <div className="text-sm font-mono text-white">0ml</div>
          </div>
        </div>
      </div>

      {/* Custom Amount Modal */}
      {showCustomAmount && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-strong p-4 border border-white/20 max-w-sm w-full mx-4">
            <h2 className="font-technical text-white mb-3 text-sm">
              CUSTOM AMOUNT
            </h2>

            <div className="space-y-3">
              <div>
                <label className="font-technical text-xs text-gray-400 block mb-2">
                  AMOUNT (ML)
                </label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount in ml"
                  className="w-full p-2 glass border border-white/10 text-white bg-transparent text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setShowCustomAmount(false)}
                variant="outline"
                className="flex-1 glass border-white/10 text-xs"
                size="sm"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleCustomAmount}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                size="sm"
              >
                ADD WATER
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HydrationDashboard;
