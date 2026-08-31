import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, ShieldAlert } from "lucide-react";

export default function RiskGradePanel({ threshold }: { threshold: number }) {
  const [data, setData] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";
        const res = await fetch(`${apiUrl}/risk-grade?threshold=${threshold}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {
        console.error("Failed to fetch risk grade", e);
      }
    };
    fetchData();
  }, [threshold]);

  if (!data) return null;

  const { overall_score, letter_grade, breakdown } = data;

  let colorClass = "text-emerald-400";
  let bgClass = "bg-emerald-500/10 border-emerald-500/30";
  
  if (letter_grade === "C") {
    colorClass = "text-yellow-400";
    bgClass = "bg-yellow-500/10 border-yellow-500/30";
  } else if (letter_grade === "D") {
    colorClass = "text-red-400";
    bgClass = "bg-red-500/10 border-red-500/30";
  }

  return (
    <div className={`rounded-2xl border p-6 flex flex-col justify-center items-center shadow-xl transition-all ${bgClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert size={18} className={colorClass} />
        <h3 className="text-gray-300 font-semibold tracking-wide uppercase text-sm">System Risk Grade</h3>
      </div>
      
      <div className={`text-6xl font-black mb-1 drop-shadow-md ${colorClass}`}>
        {letter_grade}
      </div>
      
      <div className="text-xl font-bold text-white mb-4">
        {overall_score} <span className="text-gray-500 text-sm font-normal">/ 100</span>
      </div>

      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-700/50"
      >
        View Breakdown {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && breakdown && (
        <div className="mt-4 w-full text-sm space-y-2 border-t border-gray-700/50 pt-4 px-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Recall (35%)</span>
            <span className="text-gray-200 font-medium">{breakdown.recall}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Precision (25%)</span>
            <span className="text-gray-200 font-medium">{breakdown.precision}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Drift Score (25%)</span>
            <span className="text-gray-200 font-medium">{breakdown.drift_score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Spike Stability (15%)</span>
            <span className="text-gray-200 font-medium">{breakdown.spike_health}% ({breakdown.spike_ratio})</span>
          </div>
        </div>
      )}
    </div>
  );
}
