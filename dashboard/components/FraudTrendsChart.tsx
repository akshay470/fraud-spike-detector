"use client";
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Info } from "lucide-react";

export default function FraudTrendsChart({ threshold }: { threshold: number }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";
        const res = await fetch(`${apiUrl}/trends/hourly?threshold=${threshold}`);
        if (!res.ok) throw new Error("Failed to fetch trends");
        const json = await res.json();
        
        // Ensure all 24 hours are represented
        const fullDay = Array.from({ length: 24 }, (_, i) => {
          const match = json.find((d: any) => d.hour === i);
          return match ? match : { hour: i, fraud_count: 0, fraud_rate: 0, total_transactions: 0 };
        });
        
        setData(fullDay as any);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrends();
  }, [threshold]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-gray-200 font-semibold text-lg flex items-center gap-2">
            Fraud Distribution by Relative Hour (24h cycle)
          </h3>
          <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
            <Info size={12} className="text-gray-400" />
            Hour derived from dataset's relative time field, not actual clock time.
          </p>
        </div>
      </div>
      
      <div className="h-[250px] w-full">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center text-gray-500">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="hour" 
                stroke="#6B7280" 
                tick={{fill: '#9CA3AF', fontSize: 12}}
                tickFormatter={(val) => `${val}:00`}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#6B7280" 
                tick={{fill: '#9CA3AF', fontSize: 12}}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#F3F4F6' }}
                itemStyle={{ color: '#60A5FA' }}
                labelStyle={{ color: '#9CA3AF', marginBottom: '0.25rem' }}
                formatter={(value: any, name: any, props: any) => {
                  if (name === "fraud_count") return [value, "Fraudulent Transactions"];
                  return [value, name];
                }}
                labelFormatter={(label) => `Relative Hour: ${label}:00`}
              />
              <Bar 
                dataKey="fraud_count" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
