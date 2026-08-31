"use client";

import React from "react";
import { AlertTriangle, Clock, Users, Slash } from "lucide-react";

interface SpikeBucket {
  window_start: number;
  fraud_rate: number;
  rolling_mean: number;
  rolling_std: number;
  spike_threshold: number;
  is_spike: boolean;
  transaction_count?: number; // Optional if we had it
}

export default function AutomatedSimulationPanel({ spike }: { spike: SpikeBucket | null }) {
  if (!spike) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg w-full h-80 flex flex-col justify-center items-center text-center">
        <h3 className="text-white font-semibold mb-2 text-sm uppercase tracking-wider text-gray-400">Automated Response Simulation</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          Click a spike on the Fraud Timeline to preview how the automated risk engine would respond.
        </p>
      </div>
    );
  }

  const timeLabel = new Date(spike.window_start * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fraudRate = (spike.fraud_rate * 100).toFixed(1);

  // Simple heuristic simulation rules
  let severity = "LOW";
  let actions = [];
  
  if (!spike.is_spike) {
    severity = "NOMINAL";
    actions.push("No action required. Traffic is within normal bounds.");
  } else if (spike.fraud_rate > 0.05) {
    severity = "CRITICAL";
    actions.push("🔴 Halt auto-approvals for all transactions above ₹10,000.");
    actions.push("🔴 Flag top 5% of risk scores for manual manual review.");
    actions.push("🔴 Page incident response team immediately.");
  } else {
    severity = "ELEVATED";
    actions.push("🟠 Require Additional OTP Confirmation for high risk MCCs.");
    actions.push("🟠 Flag all transactions exceeding ₹50,000 for review.");
  }

  return (
    <div className="bg-gray-900 border border-red-900/40 rounded-xl p-4 shadow-lg w-full h-80 flex flex-col justify-between ring-1 ring-red-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-red-900/60 text-red-300 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
        Simulated Response
      </div>
      
      <div>
        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          Action Plan Preview
        </h3>
        
        <div className="mb-4 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-400 text-xs">Window Vector</span>
            <span className="text-gray-300 text-xs font-mono">{timeLabel}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Anomaly Rate</span>
            <span className="text-red-400 text-xs font-bold">{fraudRate}% (&gt;{(spike.spike_threshold * 100).toFixed(1)}%)</span>
          </div>
        </div>

        <div className="space-y-2">
          {actions.map((action, i) => (
            <div key={i} className="flex gap-2 items-start text-sm text-gray-300 bg-red-900/10 p-2 rounded border border-red-900/20">
              <Slash size={14} className="text-red-500 mt-0.5 shrink-0" />
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
        <Clock size={12} />
        <span>Est. Mitigation Time: &lt; 2 minutes</span>
      </div>
    </div>
  );
}
