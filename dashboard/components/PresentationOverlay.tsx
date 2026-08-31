"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, ShieldAlert, ShieldCheck, Activity, Shield } from "lucide-react";

interface PresentationOverlayProps {
  onClose: () => void;
  txId?: number;
}

export default function PresentationOverlay({ onClose, txId = 229711 }: PresentationOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Data State
  const [dataLoaded, setDataLoaded] = useState(false);
  const [txData, setTxData] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [driftData, setDriftData] = useState<any>(null);
  
  // Animation counting state
  const [displayProb, setDisplayProb] = useState(0);
  const probRef = useRef({ val: 0 });
  const [displayAmount, setDisplayAmount] = useState(0);
  const amountRef = useRef({ val: 0 });

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";
        
        const [txnRes, riskRes, driftRes] = await Promise.all([
          fetch(`${apiUrl}/transaction/${txId}`),
          fetch(`${apiUrl}/risk-grade?threshold=0.5`),
          fetch(`${apiUrl}/drift`)
        ]);

        if (txnRes.ok && riskRes.ok && driftRes.ok && active) {
          const txn = await txnRes.json();
          const risk = await riskRes.json();
          const drift = await driftRes.json();
          
          setTxData(txn);
          setRiskData(risk);
          setDriftData(drift);
          setDataLoaded(true);
        }
      } catch (err) {
        console.error("Presentation fetch threw error:", err);
      }
    };
    fetchData();
    return () => { 
      active = false; 
    };
  }, [txId]);

  useEffect(() => {
    if (!dataLoaded || !containerRef.current) return;
    
    // Scoped GSAP Context to ensure animation isolation & perfect cleanup
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Setup initial states
      gsap.set(".scene", { opacity: 0, y: 30, display: "none" });
      gsap.set(".scanner-line", { top: "-10%" });
      
      const probTarget = (txData?.predicted_probability || 0) * 100;
      const amtTarget = txData?.amount || 0;

      // Initial Intro fade
      tl.to("#scene-container", { duration: 0.5, opacity: 1, ease: "power2.inOut" })
      
      // Scene 1: Arrival
      .set("#scene-1", { display: "flex" })
      .to("#scene-1", { duration: 0.8, opacity: 1, y: 0, ease: "back.out(1.7)" })
      .to({}, { duration: 1.5 }) // Hold
      .to("#scene-1", { duration: 0.5, opacity: 0, y: -30 })
      .set("#scene-1", { display: "none" })

      // Scene 2: AI Analyzes
      .set("#scene-2", { display: "flex" })
      .to("#scene-2", { duration: 0.5, opacity: 1, y: 0 })
      .to(".scanner-line", { duration: 1.5, top: "110%", ease: "power1.inOut", repeat: 1, yoyo: true }, "<")
      .to(probRef.current, {
        val: probTarget,
        duration: 2.5,
        ease: "power2.out",
        onUpdate: () => setDisplayProb(probRef.current.val)
      }, "<")
      .to({}, { duration: 1 }) // Hold
      .to("#scene-2", { duration: 0.5, opacity: 0, scale: 1.1 })
      .set("#scene-2", { display: "none" })

      // Scene 3: Verdict
      .set("#scene-3", { display: "flex", scale: 0.8 })
      .to("#scene-3", { duration: 0.5, opacity: 1, scale: 1, ease: "elastic.out(1, 0.5)" })
      .to({}, { duration: 1.5 }) // Hold
      .to("#scene-3", { duration: 0.4, opacity: 0, y: -20 })
      .set("#scene-3", { display: "none" })

      // Scene 4: SHAP Breakdown
      .set("#scene-4", { display: "flex" })
      .to("#scene-4", { duration: 0.5, opacity: 1, y: 0 })
      .from(".shap-bar", { duration: 0.8, width: 0, stagger: 0.1, ease: "power2.out" })
      .to({}, { duration: 2.5 }) // Hold
      .to("#scene-4", { duration: 0.4, opacity: 0, x: -30 })
      .set("#scene-4", { display: "none" })

      // Scene 5: Health Monitor
      .set("#scene-5", { display: "flex" })
      .to("#scene-5", { duration: 0.6, opacity: 1, y: 0, ease: "back.out(1.2)" })
      .to({}, { duration: 2 }) // Hold
      .to("#scene-5", { duration: 0.4, opacity: 0, scale: 0.9 })
      .set("#scene-5", { display: "none" })

      // Scene 6: Recommended Action
      .set("#scene-6", { display: "flex" })
      .to("#scene-6", { duration: 0.6, opacity: 1, y: 0 })
      .to({}, { duration: 2.5 }) // Hold
      .to("#scene-6", { duration: 0.4, opacity: 0, y: -20 })
      .set("#scene-6", { display: "none" })
      
      // Scene 7 & 8: Blocked & Lost Prevented
      .set("#scene-7", { display: "flex", scale: 0.5 })
      .to("#scene-7", { duration: 0.6, opacity: 1, scale: 1, ease: "elastic.out(1, 0.5)" })
      .to({}, { duration: 0.5 })
      .to(amountRef.current, {
        val: amtTarget,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => setDisplayAmount(amountRef.current.val)
      })
      .to({}, { duration: 3 }); // Final Hold

    }, containerRef);
    
    // Cleanup GSAP context to absolutely prevent hook-order ghosting
    return () => ctx.revert();
  }, [dataLoaded, txData]);

  // Derived Logic
  const isFraud = (txData?.predicted_probability || 0) >= 0.5;
  const isCritical = (txData?.predicted_probability || 0) >= 0.9;
  
  let actionRec = "No action required. Traffic is within normal bounds.";
  if (isCritical) {
    actionRec = "🔴 Halt auto-approvals for all transactions above ₹10,000. \n🔴 Flag top 5% of risk scores for manual manual review.";
  } else if (isFraud) {
    actionRec = "🟠 Require Additional OTP Confirmation for high risk MCCs. \n🟠 Flag all transactions exceeding ₹50,000 for review.";
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/95 backdrop-blur-md font-sans">
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 z-[110] text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-full p-2"
      >
        <X size={24} />
      </button>

      {!dataLoaded ? (
        <div className="flex flex-col items-center gap-4 text-blue-400 animate-pulse">
          <Activity size={32} />
          <p className="tracking-widest uppercase text-sm font-bold">Acquiring Live Telemetry...</p>
        </div>
      ) : (
        <div id="scene-container" className="w-full max-w-4xl opacity-0 relative h-96 flex items-center justify-center">
          
          {/* Scene 1: Arrival */}
          <div id="scene-1" className="scene flex-col items-center text-center">
            <div className="text-gray-500 uppercase tracking-widest text-sm mb-4">INBOUND TRANSACTION DETECTED</div>
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
               <div className="text-5xl font-light text-white mb-2">₹{txData?.amount?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
               <div className="text-gray-400 font-mono text-sm">TXN: {txData?.transaction_id}</div>
            </div>
          </div>

          {/* Scene 2: AI Analyzes */}
          <div id="scene-2" className="scene flex-col items-center text-center relative w-64 h-64 border border-blue-900/50 bg-blue-950/20 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.15)] justify-center overflow-hidden">
            <div className="scanner-line absolute left-0 w-full h-1 bg-blue-400 shadow-[0_0_10px_#60a5fa] z-10"></div>
            <div className="text-gray-400 text-xs uppercase tracking-widest mb-2 z-20 relative">Computing Risk Vector</div>
            <div className="text-6xl font-black text-blue-400 z-20 relative">{displayProb.toFixed(1)}%</div>
          </div>

          {/* Scene 3: Verdict */}
          <div id="scene-3" className="scene flex-col items-center text-center">
            {isFraud ? (
              <div className="bg-red-950/40 border border-red-900/50 p-10 rounded-2xl shadow-[0_0_100px_rgba(239,68,68,0.2)]">
                <ShieldAlert size={80} className="text-red-500 mb-6 mx-auto" />
                <h2 className="text-4xl font-black tracking-wider text-red-500 uppercase">FLAGGED</h2>
                <div className="text-red-400/80 mt-2">Suspicious Activity Pattern</div>
              </div>
            ) : (
              <div className="bg-emerald-950/40 border border-emerald-900/50 p-10 rounded-2xl shadow-[0_0_100px_rgba(16,185,129,0.2)]">
                <ShieldCheck size={80} className="text-emerald-500 mb-6 mx-auto" />
                <h2 className="text-4xl font-black tracking-wider text-emerald-500 uppercase">CLEARED</h2>
                <div className="text-emerald-400/80 mt-2">Within Normal Bounds</div>
              </div>
            )}
          </div>

          {/* Scene 4: SHAP Breakdown */}
          <div id="scene-4" className="scene flex-col w-full max-w-2xl bg-gray-900 border border-gray-800 p-8 rounded-xl shadow-2xl">
            <h3 className="text-gray-400 uppercase tracking-widest text-sm mb-6 text-center border-b border-gray-800 pb-4">Causal SHAP Signatures</h3>
            <div className="space-y-4">
              {txData?.top_features?.map((f: any, i: number) => {
                const isPush = f.shap_contribution > 0;
                const width = Math.min(Math.abs(f.shap_contribution) * 30, 100);
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-gray-300">{f.feature} <span className="text-gray-600">[{f.value.toFixed(4)}]</span></span>
                      <span className={isPush ? "text-red-400" : "text-emerald-400"}>{isPush ? "+" : ""}{f.shap_contribution.toFixed(4)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-950 rounded-full flex items-center">
                       <div className="w-1/2 flex justify-end">
                          {!isPush && <div className="h-full bg-emerald-500 rounded-l-full shap-bar" style={{ width: `${width}%` }} />}
                       </div>
                       <div className="w-1/2 flex justify-start">
                          {isPush && <div className="h-full bg-red-500 rounded-r-full shap-bar" style={{ width: `${width}%` }} />}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scene 5: Health Assessment */}
          <div id="scene-5" className="scene flex-row gap-8 items-stretch w-full max-w-2xl">
            <div className="flex-1 bg-gray-900 border border-gray-800 p-8 rounded-xl text-center">
               <div className="text-gray-500 text-xs tracking-widest uppercase mb-4">Overall Risk Grade</div>
               <div className={`text-7xl font-black ${riskData?.letter_grade === 'A' || riskData?.letter_grade === 'B' ? 'text-emerald-400' : 'text-red-400'}`}>
                 {riskData?.letter_grade || "-"}
               </div>
            </div>
            <div className="flex-1 bg-gray-900 border border-gray-800 p-8 rounded-xl text-center flex flex-col justify-center">
               <div className="text-gray-500 text-xs tracking-widest uppercase mb-4">Model Drift Status</div>
               <div className={`text-xl font-bold p-3 rounded-lg border ${driftData?.overall_status === 'Stable' ? 'bg-emerald-900/40 border-emerald-800 text-emerald-400' : 'bg-red-900/40 border-red-800 text-red-400'}`}>
                 {driftData?.overall_status || "-"}
               </div>
            </div>
          </div>

          {/* Scene 6: AI Recommends */}
          <div id="scene-6" className="scene flex-col items-center w-full max-w-xl text-center">
            <Shield size={32} className="text-indigo-400 mb-4" />
            <div className="text-indigo-400 uppercase tracking-widest text-sm mb-6">AI Protocol Activated</div>
            <div className="bg-indigo-950/30 border border-indigo-900/50 p-6 rounded-xl w-full text-left">
              {actionRec.split('\n').map((line, i) => (
                <div key={i} className="text-indigo-200 font-medium my-2 flex items-start gap-2">
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scene 7 & 8: Outcome */}
          <div id="scene-7" className="scene flex-col items-center text-center">
             {isFraud ? (
               <div className="flex flex-col items-center">
                  <div className="bg-red-600 text-white font-black text-2xl tracking-widest py-2 px-6 border-4 border-red-800 mb-8 transform -rotate-2">
                    TRANSACTION BLOCKED
                  </div>
                  <div className="text-gray-400 uppercase tracking-widest text-sm mb-2">Net Loss Prevented</div>
                  <div className="text-5xl font-black text-emerald-400">
                    ₹{displayAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </div>
               </div>
             ) : (
               <div className="flex flex-col items-center">
                  <div className="bg-emerald-600 text-white font-black text-2xl tracking-widest py-2 px-6 border-4 border-emerald-800 mb-8">
                    AUTO-APPROVED
                  </div>
                  <div className="text-gray-400 uppercase tracking-widest text-sm mb-2">Processed Seamlessly</div>
                  <div className="text-5xl font-light text-white">
                    ₹{displayAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </div>
               </div>
             )}
          </div>

        </div>
      )}
    </div>
  );
}
