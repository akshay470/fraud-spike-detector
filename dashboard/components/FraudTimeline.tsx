"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from "recharts";

interface SpikeBucket {
  window_start: number;
  fraud_rate: number;
  rolling_mean: number;
  rolling_std: number;
  spike_threshold: number;
  is_spike: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-xl max-w-xs z-50 relative">
        <p className="text-gray-300 font-semibold mb-2">{label}</p>
        <p className="text-blue-400 text-sm">Fraud Rate: {(data.fraud_rate * 100).toFixed(2)}%</p>
        <p className="text-amber-400 text-sm mb-2">Threshold: {(data.spike_threshold * 100).toFixed(2)}%</p>
        
        {data.is_spike && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <span className="inline-block bg-red-900/50 text-red-500 text-xs font-black px-2 py-1 rounded border border-red-500/50 mb-2 shadow-sm animate-pulse">
              ⚠️ SPIKE DETECTED
            </span>
            <p className="text-red-300 text-xs leading-relaxed">
              Active attack vector flagged. Rate surpassed moving anomaly bounds.
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function FraudTimeline({ onSpikeClick }: { onSpikeClick?: (spike: SpikeBucket) => void }) {
  const [data, setData] = useState<SpikeBucket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSpike, setHoveredSpike] = useState<SpikeBucket | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/spikes`);
        if (!res.ok) throw new Error("Failed to fetch spikes");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data.length) return <div className="text-gray-400">Loading timeline...</div>;

  // Format data for Recharts
  const chartData = data.map((d) => ({
    ...d,
    timeLabel: new Date(d.window_start * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <div className="w-full h-80 bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg shadow-gray-950">
      <h2 className="text-white font-semibold mb-4 text-lg">Live Discovery (10m Windows)</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          onMouseMove={(state: any) => {
            if (state && state.activePayload && state.activePayload.length > 0) {
              setHoveredSpike(state.activePayload[0].payload);
            }
          }}
          onMouseLeave={() => setHoveredSpike(null)}
          onClick={(state: any) => {
            // First try to use the direct click state payload
            if (state && state.activePayload && state.activePayload.length > 0) {
              const d = state.activePayload[0].payload;
              if (onSpikeClick) onSpikeClick(d);
            } 
            // Fallback to the last reliably hovered node (when they click the tooltip or nearby)
            else if (hoveredSpike && onSpikeClick) {
              onSpikeClick(hoveredSpike);
            }
          }}
          className="cursor-pointer"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="timeLabel" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
          <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#1F2937', opacity: 0.4}} />

          {/* Highlight Spike Windows */}
          {chartData.map((d, index) => {
            if (d.is_spike) {
              return (
                <ReferenceArea
                  key={index}
                  x1={d.timeLabel}
                  x2={chartData[index + 1]?.timeLabel || d.timeLabel}
                  fill="#Ef4444"
                  fillOpacity={0.2}
                  ifOverflow="visible"
                  className="cursor-pointer hover:fill-opacity-40"
                  style={{ cursor: "pointer", pointerEvents: "all" }}
                  onClick={() => {
                    if (onSpikeClick) onSpikeClick(d);
                  }}
                />
              );
            }
            return null;
          })}

          <Line
            type="monotone"
            dataKey="fraud_rate"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ r: 2, fill: '#3B82F6', cursor: 'pointer', onClick: (e: any) => { if (e && e.payload && onSpikeClick) onSpikeClick(e.payload); } }}
            activeDot={{ r: 8, fill: '#3B82F6', stroke: '#1D4ED8', cursor: 'pointer', onClick: (e: any) => { if (e && e.payload && onSpikeClick) onSpikeClick(e.payload); } }}
            name="Fraud Rate"
          />
          <Line
            type="monotone"
            dataKey="spike_threshold"
            stroke="#F59E0B"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            name="Threshold (Mean + 2*Std)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
