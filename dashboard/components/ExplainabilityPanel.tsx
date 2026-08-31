"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface FeatureImportance {
  feature: string;
  importance: number;
}

export default function ExplainabilityPanel() {
  const [data, setData] = useState<FeatureImportance[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExplain = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";
        const res = await fetch(`${apiUrl}/explain`);
        if (!res.ok) throw new Error("Failed to fetch feature importance");
        const json = await res.json();
        // Calculate max importance for relative percentage, or just show raw
        // Let's sort ascending for re-charts horizontal layout (bottom to top)
        const sorted = json.sort((a: FeatureImportance, b: FeatureImportance) => a.importance - b.importance);
        setData(sorted);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchExplain();
  }, []);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data.length) return <div className="text-gray-400 p-4">Loading explanation data...</div>;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-xl">
          <p className="text-gray-300 font-semibold mb-1">Feature: {payload[0].payload.feature}</p>
          <p className="text-blue-400 text-sm">Importance Score: {payload[0].value.toFixed(1)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg w-full h-80">
      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Why Transactions Get Flagged</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
          <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} fontSize={12} />
          <YAxis type="category" dataKey="feature" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} width={60} fontSize={12} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#1F2937', opacity: 0.4}} />
          <Bar dataKey="importance" fill="#3B82F6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
