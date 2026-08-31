"use client";

import React, { useState, useEffect, useRef } from "react";
import FraudTimeline from "@/components/FraudTimeline";
import MetricsPanel from "@/components/MetricsPanel";
import ThresholdSlider from "@/components/ThresholdSlider";
import ExplainabilityPanel from "@/components/ExplainabilityPanel";
import AutomatedSimulationPanel from "@/components/AutomatedSimulationPanel";
import DriftPanel from "@/components/DriftPanel";
import TransactionLookupPanel from "@/components/TransactionLookupPanel";
import RiskGradePanel from "@/components/RiskGradePanel";
import FraudTrendsChart from "@/components/FraudTrendsChart";
import WhatIfSimulator from "@/components/WhatIfSimulator";
import Footer from "@/components/Footer";

import { useRouter } from "next/navigation";
import { LogOut, Search } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(0.5);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [selectedSpike, setSelectedSpike] = useState<any>(null);
  
  useEffect(() => {
    // Auth Check
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) {
      router.push("/signin");
      return;
    }
    setUserEmail(storedEmail);
    
    const fetchMetrics = async () => {
      console.log("FETCH METRICS TRIGGERED", threshold);
      try {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";
        console.log("FETCH URL", `${apiUrl}/metrics?threshold=${threshold}`);
        const res = await fetch(`${apiUrl}/metrics?threshold=${threshold}`);
        console.log("FETCH RES OK?", res.ok);
        if (res.ok) {
          const data = await res.json();
          console.log("FETCH DATA", data);
          if (data && data.confusion_matrix) setMetricsData(data);
        }
      } catch (e) {
        console.error("Failed to fetch metrics", e);
      }
    };
    fetchMetrics();
  }, [threshold]);

  return (
    <div className="min-h-screen transparent text-gray-200 p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">AI Risk Manager</h1>
            <p className="text-gray-500 mt-1">Live Fraud-Spike Detector & Cost Analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-emerald-900/40 text-emerald-400 border border-emerald-900/50 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">
              Defense-Only System
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-500 text-sm font-medium tracking-wide">System Live</span>
            </div>
            
            {userEmail && (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-800">
                <span className="text-sm text-gray-400">
                  Signed in as: <span className="text-gray-200 font-medium">{userEmail}</span>
                </span>
                <button 
                  onClick={() => {
                    localStorage.removeItem("userEmail");
                    router.push("/signin");
                  }}
                  className="flex items-center gap-1.5 text-xs bg-gray-900 border border-gray-700 hover:bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
            
          </div>
        </header>

        {/* Hero Welcome Banner */}
        <section 
          className="relative rounded-2xl overflow-hidden mb-8 border border-gray-800 shadow-2xl"
          style={{ 
            backgroundImage: "url('/hero-background.png')", 
            backgroundSize: "cover", 
            backgroundPosition: "center" 
          }}
        >
          {/* Dark semi-transparent overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-900/80 to-transparent"></div>
          
          <div className="relative z-10 px-8 py-10 sm:p-12 max-w-2xl">
            <h3 className="text-blue-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">Live Risk Console</h3>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Welcome back, {userEmail ? userEmail.split('@')[0] : 'Analyst'} 👋
            </h2>
            <p className="text-lg text-gray-300 font-medium mb-3">
              Real-time fraud detection, explained — not just flagged.
            </p>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Every spike is caught, every decision is explainable, every response is simulated before it's real.
            </p>
            
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold bg-indigo-950/30 w-fit px-4 py-2 rounded-full border border-indigo-500/20">
              <Search size={16} />
              <span>Start with Transaction Lookup below — see exactly why any transaction gets flagged.</span>
            </div>
          </div>
        </section>

        {/* Impact Summary Hero (Derived from Metrics) */}
        {metricsData && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <RiskGradePanel threshold={threshold} />
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-extrabold text-white mb-2">
                {metricsData.confusion_matrix[0].toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Frauds Caught</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/40 to-gray-900 p-6 rounded-2xl border border-emerald-900/50 shadow-xl flex flex-col items-center justify-center text-center ring-1 ring-emerald-500/20">
              <div className="text-4xl font-extrabold text-emerald-400 mb-2">
                ${(metricsData.financials?.net_savings || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              <div className="text-xs text-emerald-500/80 uppercase tracking-wider font-bold">Realized Net Savings</div>
            </div>
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-extrabold text-blue-400 mb-2">
                {(metricsData.recall * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Detection Accuracy</div>
            </div>
          </section>
        )}

        {/* Top: Timeline */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-3 px-1">
            <h2 className="text-xl font-semibold text-white">Live Discovery (10m Windows)</h2>
            <span className="text-sm text-gray-400 font-medium">💡 Hint: <span className="text-red-400">Red bands</span> = detected fraud spikes. Click a spike for details.</span>
          </div>
          <FraudTimeline onSpikeClick={(spike) => setSelectedSpike(spike)} />
        </section>

        {/* Analytics: Fraud Trends Chart */}
        <section className="mb-8 mt-8">
          <FraudTrendsChart threshold={threshold} />
        </section>

        {/* Feature Row: Explainability, Drift, and Auto Simulation */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ExplainabilityPanel />
          <DriftPanel />
          <AutomatedSimulationPanel spike={selectedSpike} />
        </section>

        {/* Bottom: Settings & Metrics */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-2">Defense Controls</h2>
            <ThresholdSlider threshold={threshold} setThreshold={setThreshold} />
            <p className="text-xs text-gray-500 italic px-1 pt-1 mb-2">💡 Hint: Drag to see how stricter thresholds trade off precision vs recall.</p>
            <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl">
              <p className="text-sm text-blue-200/80 leading-relaxed">
                Adjusting the probability threshold updates the confusion matrix live against historical data. 
                Higher threshold means less false positives, but potentially missing subtle frauds.
              </p>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-2">Financial Impact & Accuracy Simulator</h2>
            <MetricsPanel data={metricsData} />
          </div>
        </section>

        {/* Hypothetical Sandbox Sandbox */}
        <section className="mb-10">
          <WhatIfSimulator threshold={threshold} />
        </section>

        {/* Transaction Level Explainability */}
        <section className="mb-8">
          <TransactionLookupPanel />
        </section>

        <Footer />
      </div>
    </div>
  );
}
