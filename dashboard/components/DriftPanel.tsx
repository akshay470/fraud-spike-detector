"use client";

import React, { useEffect, useState } from "react";
import { Activity, AlertOctagon, CheckCircle2 } from "lucide-react";

interface DriftFeature {
  feature: string;
  psi: number;
}

interface DriftReport {
  overall_status: string;
  max_psi: number;
  features: DriftFeature[];
}

export default function DriftPanel() {
  const [data, setData] = useState<DriftReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrift = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";
        const res = await fetch(`${apiUrl}/drift`);
        if (!res.ok) throw new Error("Failed to fetch drift report");
        const json = await res.json();
        
        // Sort features by PSI descending
        json.features.sort((a: DriftFeature, b: DriftFeature) => b.psi - a.psi);
        setData(json);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchDrift();
  }, []);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-gray-400 p-4">Loading drift data...</div>;

  const isStable = data.overall_status === "Stable";
  const isModerate = data.overall_status === "Moderate Drift";
  const isSignificant = data.overall_status === "Significant Drift";

  // Determine colors based on status
  let badgeColor = "bg-green-900/40 text-green-400 border-green-800";
  let Icon = CheckCircle2;
  if (isModerate) {
    badgeColor = "bg-yellow-900/40 text-yellow-400 border-yellow-800";
    Icon = Activity;
  } else if (isSignificant) {
    badgeColor = "bg-red-900/40 text-red-400 border-red-800";
    Icon = AlertOctagon;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg w-full h-80 flex flex-col relative overflow-hidden">
      <h3 className="text-white font-semibold mb-2 text-sm uppercase tracking-wider text-gray-400 flex justify-between items-center">
        Model Drift Monitor
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${badgeColor}`}>
          <Icon size={12} />
          {data.overall_status}
        </div>
      </h3>
      
      <p className="text-gray-500 text-xs mb-4 italic">
        Monitors whether live transaction patterns are diverging from training data — critical for catching model decay before it causes missed fraud.
      </p>

      <div className="flex-grow overflow-y-auto pr-2 space-y-3">
        {data.features.map((f, i) => {
          // PSI interpretation
          const w = Math.min((f.psi / 0.3) * 100, 100); 
          let barColor = "bg-green-500";
          if (f.psi > 0.1) barColor = "bg-yellow-500";
          if (f.psi > 0.25) barColor = "bg-red-500";

          return (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300 font-medium">Feature: {f.feature}</span>
                <span className="text-gray-400">PSI: <strong className={f.psi > 0.25 ? "text-red-400" : f.psi > 0.1 ? "text-yellow-400" : "text-green-400"}>{f.psi.toFixed(4)}</strong></span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${barColor} rounded-full`}
                  style={{ width: `${w}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
