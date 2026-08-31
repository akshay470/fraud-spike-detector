import React from "react";

export default function ThresholdSlider({ threshold, setThreshold }: { threshold: number, setThreshold: (val: number) => void }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg flex flex-col justify-center">
      <div className="flex justify-between items-center mb-4">
        <label htmlFor="threshold" className="text-white font-medium">Model Probability Threshold</label>
        <span className="text-blue-400 font-bold bg-blue-900/30 px-3 py-1 rounded-full">
          {threshold.toFixed(2)}
        </span>
      </div>
      
      <input
        id="threshold"
        type="range"
        min="0.1"
        max="0.9"
        step="0.05"
        value={threshold}
        onChange={(e) => setThreshold(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      
      <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
        <span>0.1 (Catch All)</span>
        <span>0.9 (Strict)</span>
      </div>
    </div>
  );
}
