"use client";

import React, { useState, useEffect } from "react";
import { Activity, Beaker, ShieldAlert, BadgeCheck, AlertTriangle } from "lucide-react";

interface WhatIfResponse {
  probability: number;
  verdict: "FLAGGED" | "CLEAR";
  top_factors: { feature: string; value: number; contribution: number }[];
}

export default function WhatIfSimulator({ threshold }: { threshold: number }) {
  const [amount, setAmount] = useState<number>(22.0);
  const [v14, setV14] = useState<number>(0.05);
  const [v4, setV4] = useState<number>(-0.02);
  const [v12, setV12] = useState<number>(0.14);
  const [v8, setV8] = useState<number>(0.02);

  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8888"}/whatif`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount, v14, v4, v12, v8, threshold
          })
        });

        if (res.ok) {
          const data = await res.json();
          setResult(data);
        }
      } catch (err) {
        console.error("Failed to run what-if simulation", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchPrediction();
    }, 300);

    return () => clearTimeout(debounce);
  }, [amount, v14, v4, v12, v8, threshold]);

  const SliderControl = ({ label, value, setter, min, max, step }: any) => (
    <div className="flex flex-col space-y-2 pb-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className="text-blue-400 font-mono bg-blue-900/20 px-2 py-0.5 rounded border border-blue-800/30">
          {value.toFixed(step < 1 ? 2 : 0)}
        </span>
      </div>
      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setter(parseFloat(e.target.value))}
        className="w-full accent-blue-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );

  return (
    <div className="w-full bg-gray-900 border border-indigo-900/50 rounded-2xl shadow-2xl overflow-hidden relative">
      
      {/* Disclaimer Banner */}
      <div className="absolute top-0 w-full bg-indigo-950/40 border-b border-indigo-900/50 py-1.5 flex items-center justify-center gap-2">
        <Beaker size={14} className="text-indigo-400" />
        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300">Hypothetical Scenario — Not a Real Transaction</span>
      </div>

      <div className="p-6 pt-12 md:p-10 md:pt-14 grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Controls Column */}
        <div className="space-y-2">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-blue-500" />
              Custom Vector Input
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Test specific variables. Hidden variables are defaulted to their real-world medians.
            </p>
          </div>
          
          <SliderControl label="Transaction Amount (₹)" value={amount} setter={setAmount} min={0} max={25000} step={10} />
          <SliderControl label="Feature V14 (Critical Component)" value={v14} setter={setV14} min={-19.2} max={10.5} step={0.1} />
          <SliderControl label="Feature V4" value={v4} setter={setV4} min={-5.6} max={16.8} step={0.1} />
          <SliderControl label="Feature V12" value={v12} setter={setV12} min={-18.6} max={7.8} step={0.1} />
          <SliderControl label="Feature V8" value={v8} setter={setV8} min={-73.2} max={20.0} step={0.1} />
        </div>

        {/* Prediction Results Column */}
        <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-800 pt-8 md:pt-0 md:pl-10 relative">
          
          <div className="text-center mb-8">
            <h4 className="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-2">Live AI Prediction</h4>
            
            <div className="flex items-center justify-center gap-4">
              <div className="text-6xl font-extrabold font-mono text-white tracking-tight">
                {result ? (
                  (result.probability * 100) < 0.1 
                    ? "<0.1" 
                    : (result.probability * 100).toFixed(1)
                ) : "..."}
                <span className="text-3xl text-gray-500">%</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              {result && result.verdict === "FLAGGED" ? (
                <div className="flex items-center gap-2 bg-red-950/40 border border-red-900/60 text-red-500 px-5 py-2.5 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <AlertTriangle size={20} />
                  TRANSACTION FLAGGED
                </div>
              ) : result && result.verdict === "CLEAR" ? (
                <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/60 text-emerald-500 px-5 py-2.5 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <BadgeCheck size={20} />
                  TRANSACTION CLEAR
                </div>
              ) : (
                <div className="h-11"></div> // Placeholder
              )}
            </div>
          </div>

          {/* Top Contributing Factors from SHAP */}
          {result && result.top_factors && (
            <div className="bg-gray-950/50 rounded-xl p-5 border border-gray-800 shadow-inner">
              <h5 className="text-xs text-gray-400 font-semibold tracking-wider uppercase border-b border-gray-800 pb-2 mb-3">
                Input Triggers (SHAP impact)
              </h5>
              <div className="space-y-3">
                {result.top_factors.map((factor, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300 font-mono bg-gray-800 px-2 py-0.5 rounded">
                      {factor.feature}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {factor.contribution > 0 ? (
                        <span className="text-red-400 text-xs">Pushed Risk UP ↗</span>
                      ) : (
                        <span className="text-emerald-400 text-xs">Pushed Risk DOWN ↘</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
