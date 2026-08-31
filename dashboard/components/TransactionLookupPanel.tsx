"use client";

import React, { useState } from "react";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";

interface FeatureInsight {
  feature: string;
  value: number;
  shap_contribution: number;
}

interface TransactionInsights {
  transaction_id: number;
  predicted_probability: number;
  predicted_label: number;
  actual_label: number;
  top_features: FeatureInsight[];
}

export default function TransactionLookupPanel() {
  const [txId, setTxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TransactionInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId) return;
    
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";
      const res = await fetch(`${apiUrl}/transaction/${txId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Transaction not found in test predictions timeframe.");
        throw new Error("Failed to fetch transaction insights.");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl w-full text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-800 gap-4">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Transaction Inspector
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Deep-dive explanation of individual transactions via SHAP ML weights.
          </p>
        </div>
        
        <form onSubmit={handleLookup} className="flex gap-2">
          <input
            type="number"
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            placeholder="Try: 227845 (Legit) or 229711 (Fraud)"
            className="bg-gray-950 border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-2 w-72 focus:outline-none focus:border-indigo-500"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Search size={16} />
            {loading ? "Searching..." : "Lookup"}
          </button>
        </form>
      </div>

      {error && (
        <div className="text-red-400 bg-red-900/20 border border-red-900/50 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Verdict Scorecard */}
          <div className="lg:col-span-4 bg-gray-950/50 border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            {data.predicted_label === 1 ? (
              <ShieldAlert size={48} className="text-red-500 mb-4" />
            ) : (
              <ShieldCheck size={48} className="text-green-500 mb-4" />
            )}
            
            <h3 className={`text-2xl font-black tracking-wider uppercase mb-1 ${data.predicted_label === 1 ? 'text-red-500' : 'text-green-500'}`}>
              {data.predicted_label === 1 ? "FLAGGED: FRAUD" : "VERDICT: CLEAR"}
            </h3>
            
            <p className="text-gray-400 text-sm mb-6">
              AI Risk Score: <strong className="text-white text-lg">{(data.predicted_probability * 100).toFixed(2)}%</strong>
            </p>
            
            <div className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-left">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-mono text-gray-300">{data.transaction_id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Actual Label (History)</span>
                <span className="font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                  {data.actual_label === 1 ? "Fraud" : "Legitimate"}
                </span>
              </div>
            </div>
          </div>

          {/* Explainability Breakdown */}
          <div className="lg:col-span-8">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              SHAP Anomaly Signatures
            </h3>
            
            {data.top_features.length > 0 ? (
              <div className="space-y-5">
                {data.top_features.map((f, i) => {
                  const isPushingFraud = f.shap_contribution > 0;
                  // Max visual width ~2.5 typical max shap 
                  const w = Math.min(Math.abs(f.shap_contribution) * 20, 100);
                  
                  return (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-mono text-gray-300">
                          {f.feature} <span className="text-gray-600">[{f.value.toFixed(4)}]</span>
                        </span>
                        <span className={isPushingFraud ? 'text-red-400' : 'text-green-400'}>
                          {isPushingFraud ? '+' : ''}{f.shap_contribution.toFixed(4)}
                        </span>
                      </div>
                      
                      <div className="relative w-full h-2 bg-gray-800 rounded-full flex items-center justify-center">
                        {/* Center midpoint mark */}
                        <div className="absolute w-[1px] h-4 bg-gray-600 z-10"></div>
                        
                        {/* Bi-directional bar */}
                        <div className="w-full h-full flex">
                          <div className="w-1/2 flex justify-end">
                            {!isPushingFraud && (
                              <div className="h-full bg-green-500 rounded-l-full" style={{ width: `${w}%` }}></div>
                            )}
                          </div>
                          <div className="w-1/2 flex justify-start">
                            {isPushingFraud && (
                              <div className="h-full bg-red-500 rounded-r-full" style={{ width: `${w}%` }}></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 italic p-4">SHAP feature baseline unavailable for this node.</div>
            )}
            
            <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-800">
              * Bars pointing right (Red) increase the probability of fraud. Bars pointing left (Green) decrease the probability. Values are localized SHAP unit distributions isolated to this specific transaction.
            </p>
          </div>
          
        </div>
      )}
    </section>
  );
}
