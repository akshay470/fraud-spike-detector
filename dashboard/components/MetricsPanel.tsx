import React from "react";
import { ShieldAlert, Banknote, Fingerprint, Activity } from "lucide-react";

interface MetricsData {
  precision: number;
  recall: number;
  f1: number;
  total_cost: number;
  confusion_matrix: number[];
  optimal_threshold: number;
}

export default function MetricsPanel({ data }: { data: MetricsData | null }) {
  if (!data) return <div className="text-gray-400 p-4">Loading metrics...</div>;

  const [tp, fp, tn, fn] = data.confusion_matrix;

  const StatCard = ({ title, value, icon, sub }: any) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className="text-gray-500">{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-100">{value}</div>
        {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-4">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Precision" 
          value={`${(data.precision * 100).toFixed(2)}%`}
          icon={<ShieldAlert size={18} />}
          sub="TP / (TP + FP)"
        />
        <StatCard 
          title="Recall" 
          value={`${(data.recall * 100).toFixed(2)}%`}
          icon={<Fingerprint size={18} />}
          sub="TP / (TP + FN)"
        />
        <StatCard 
          title="F1 Score" 
          value={`${(data.f1 * 100).toFixed(2)}%`}
          icon={<Activity size={18} />}
          sub="Harmonic Mean"
        />
        <StatCard 
          title="Total Cost" 
          value={`$${data.total_cost.toLocaleString()}`}
          icon={<Banknote size={18} className="text-red-400" />}
          sub="FP=50, FN=5000"
        />
      </div>

      {/* Confusion Matrix (2x2 grid) */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Confusion Matrix</h3>
        <div className="grid grid-cols-2 gap-2 text-center text-sm font-mono">
          <div className="p-3 bg-green-900/20 border border-green-900/50 rounded-lg">
            <div className="text-green-500 mb-1">True Positive</div>
            <div className="text-xl text-green-100">{tp}</div>
          </div>
          <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
            <div className="text-red-500 mb-1">False Positive</div>
            <div className="text-xl text-red-100">{fp}</div>
          </div>
          <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
            <div className="text-red-500 mb-1">False Negative</div>
            <div className="text-xl text-red-100">{fn}</div>
          </div>
          <div className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
            <div className="text-gray-400 mb-1">True Negative</div>
            <div className="text-xl text-gray-200">{tn}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
