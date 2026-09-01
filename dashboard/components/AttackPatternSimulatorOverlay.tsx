"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, AlertTriangle, ShieldAlert, Laptop, CreditCard, Banknote, Map, CornerDownRight, CheckCircle2 } from "lucide-react";

interface Step {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

interface Pattern {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  steps: Step[];
  summary: string;
}

const PATTERNS: Pattern[] = [
  {
    id: "ato",
    name: "Account Takeover",
    description: "Compromised credentials leading to unauthorized access and draining of funds.",
    icon: <Laptop className="w-8 h-8 text-amber-500 mb-4" />,
    steps: [
      { title: "Normal Behavior", desc: "User logs in from verified home IP daily.", icon: <CheckCircle2 className="text-emerald-500" /> },
      { title: "New Device Detected", desc: "Login from unrecognized mobile device.", icon: <AlertTriangle className="text-amber-500" /> },
      { title: "Foreign IP Detected", desc: "Connection routed through overseas proxy.", icon: <AlertTriangle className="text-amber-500" /> },
      { title: "Password Changed", desc: "Recovery email altered; password reset forced.", icon: <AlertTriangle className="text-amber-500" /> },
      { title: "Large Transfer Attempted", desc: "Max withdrawal requested to new external wallet.", icon: <ShieldAlert className="text-red-500" /> },
      { title: "🚨 AI Detects Anomaly", desc: "Velocity and behavioral risk score hits 98%.", icon: <ActivityIcon className="text-amber-500" /> },
      { title: "🔒 Blocked", desc: "Account frozen locking funds safely.", icon: <ShieldAlert className="text-amber-500" /> }
    ],
    summary: "This is how an Account Takeover typically unfolds — our system is designed to detect and interrupt patterns like this at the anomaly-detection stage by weighing device/IP velocity against behavioral norms."
  },
  {
    id: "card_testing",
    name: "Card Testing",
    description: "Fraudsters automating small merchant purchases to validate stolen lists.",
    icon: <CreditCard className="w-8 h-8 text-amber-500 mb-4" />,
    steps: [
      { title: "Botnet Initiated", desc: "10,000 requests fired across 50 payment gateways.", icon: <AlertTriangle className="text-amber-500" /> },
      { title: "Micro-Authorization", desc: "₹1.00 attempt made at digital content merchant.", icon: <AlertTriangle className="text-amber-500" /> },
      { title: "CVV Guessing", desc: "Multiple rapid failures on CVV format.", icon: <AlertTriangle className="text-amber-500" /> },
      { title: "Success Logged", desc: "Valid card identified; moved to premium target list.", icon: <ShieldAlert className="text-red-500" /> },
      { title: "🚨 AI Detects Pattern", desc: "Cross-merchant velocity spike identified universally.", icon: <ActivityIcon className="text-amber-500" /> },
      { title: "🔒 Blocked", desc: "BIN network isolated and challenged with 3DS.", icon: <ShieldAlert className="text-amber-500" /> }
    ],
    summary: "This is how Card Testing typically unfolds — our system is designed to detect and interrupt botnet velocity patterns by clustering micro-authorizations across varying merchant categories prior to premium exploitation."
  },
  {
    id: "money_mule",
    name: "Money Mule",
    description: "A network of scattered accounts aggregating illicit transfers to launder stolen capital.",
    icon: <Banknote className="w-8 h-8 text-amber-500 mb-4" />,
    steps: [
      { title: "Dormant Account", desc: "Account sits inactive for 8 months with low balance.", icon: <CheckCircle2 className="text-emerald-500" /> },
      { title: "Sudden Aggregation", desc: "Multiple incoming P2P transfers under reporting limits.", icon: <AlertTriangle className="text-amber-500" /> },
      { title: "Rapid Withdrawal", desc: "Immediate bounce-out to cryptocurrency exchange.", icon: <ShieldAlert className="text-red-500" /> },
      { title: "🚨 AI Detects Network", desc: "Graph analysis detects hub-and-spoke mule topology.", icon: <ActivityIcon className="text-amber-500" /> },
      { title: "🔒 Blocked", desc: "Accounts restricted; AML reporting compiled.", icon: <ShieldAlert className="text-amber-500" /> }
    ],
    summary: "This is how a Money Mule ring typically unfolds — our system is designed to detect and interrupt laundering chains by tracking sudden high-velocity aggregations diverging from historical dormancy baselines."
  },
  {
    id: "geo_anomaly",
    name: "Geo Anomaly",
    description: "Physically impossible transactional velocity spanning vast geographic distances.",
    icon: <Map className="w-8 h-8 text-amber-500 mb-4" />,
    steps: [
      { title: "Physical POS Swipe", desc: "Card dipped at Mumbai coffee shop.", icon: <CheckCircle2 className="text-emerald-500" /> },
      { title: "Online E-Commerce", desc: "Order placed from IP in Moscow 5 minutes later.", icon: <AlertTriangle className="text-amber-500" /> },
      { title: "ATM Withdrawal", desc: "Cash withdrawal attempted in London 15 mins later.", icon: <ShieldAlert className="text-red-500" /> },
      { title: "🚨 AI Detects Impossible Travel", desc: "Speed of light velocity check flags physical impossibility.", icon: <ActivityIcon className="text-amber-500" /> },
      { title: "🔒 Blocked", desc: "Card frozen globally pending verification.", icon: <ShieldAlert className="text-amber-500" /> }
    ],
    summary: "This is how Geo-Spoofing and Card Cloning typically unfolds — our system is designed to detect and interrupt physically impossible travel velocities by comparing POS presence against digital IP routing checks."
  }
];

function ActivityIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}

export default function AttackPatternSimulatorOverlay({ onClose }: { onClose: () => void }) {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const sequenceContainerRef = useRef<HTMLDivElement>(null);

  // Esc key closure
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle Sequence Execution GSAP
  useEffect(() => {
    if (!selectedPattern || !sequenceContainerRef.current) return;
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      // Reset all steps to invisible
      gsap.set(".sim-step", { opacity: 0, x: -30 });
      gsap.set(".sim-connector", { scaleY: 0, transformOrigin: "top" });
      gsap.set(".sim-summary", { opacity: 0, y: 30 });
      
      // Intro the header
      gsap.from(".sim-header", { opacity: 0, y: -20, duration: 0.6, ease: "power2.out" });
      
      // Play through steps securely over 1.5s - 2s blocks
      const steps = gsap.utils.toArray(".sim-step-group");
      
      steps.forEach((step: any, i: number) => {
        // Fade in step card
        tl.to(step.querySelector('.sim-step'), { duration: 0.8, opacity: 1, x: 0, ease: "back.out(1.2)" });
        // Hold for reading
        tl.to({}, { duration: 1.2 });
        
        // Drop connector line to next step if there is one
        if (i < steps.length - 1) {
          tl.to(step.querySelector('.sim-connector'), { duration: 0.4, scaleY: 1, ease: "power1.inOut" }, "-=0.2");
        }
      });
      
      // Drop summary
      tl.to(".sim-summary", { duration: 0.8, opacity: 1, y: 0, ease: "power2.out" });
      
    }, sequenceContainerRef);
    
    return () => ctx.revert();
  }, [selectedPattern]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-950/95 backdrop-blur-md font-sans">
      
      {/* ⚠ CRITICAL SAFETY BADGE - Non dismissable header ⚠ */}
      <div className="absolute top-0 w-full bg-amber-500 text-amber-950 font-black tracking-widest text-sm uppercase py-2 px-4 shadow-[0_4px_20px_rgba(245,158,11,0.2)] text-center z-[120] flex items-center justify-center gap-2">
        <AlertTriangle size={18} />
        ⚠ ILLUSTRATIVE WALKTHROUGH — Not Live Transaction Data
      </div>

      <button 
        onClick={onClose}
        className="absolute top-16 right-8 z-[110] text-gray-400 hover:text-white bg-gray-900 border border-amber-900/50 rounded-full p-2 hover:bg-amber-950 transition-colors"
      >
        <X size={24} />
      </button>

      {!selectedPattern ? (
        // Grid Selection Screen
        <div className="w-full max-w-5xl mt-12 px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-amber-500 tracking-wider mb-3 drop-shadow-md">ATTACK PATTERN SIMULATOR</h2>
            <p className="text-amber-200/70 max-w-2xl mx-auto">Select an illustrative sequence below to understand the conceptual progression of fraud vectors and how our behavioral heuristics are designed to intercept them.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PATTERNS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPattern(p)}
                className="flex flex-col items-center p-8 bg-gray-900 border border-gray-800 rounded-2xl hover:border-amber-500/50 hover:bg-gray-800/80 transition-all group text-center"
              >
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                  {p.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{p.name}</h3>
                <p className="text-gray-400 text-sm">{p.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Sequence Timeline Execution Screen
        <div ref={sequenceContainerRef} className="w-full max-w-3xl mt-12 overflow-y-auto max-h-[85vh] px-8 pb-32">
          
          <div className="sim-header flex items-center gap-4 mb-10 border-b border-gray-800 pb-6">
            <button 
              onClick={() => setSelectedPattern(null)}
              className="text-amber-500 hover:text-amber-400 flex items-center pr-4 border-r border-gray-800"
            >
              <CornerDownRight size={24} className="transform rotate-180" />
            </button>
            <div>
              <h2 className="text-3xl font-black text-amber-500">{selectedPattern.name} Simulation</h2>
              <div className="text-amber-500/60 uppercase tracking-widest text-xs mt-1">Simulated Threat Vector Progression</div>
            </div>
          </div>
          
          <div className="space-y-0">
            {selectedPattern.steps.map((step, i) => (
              <div key={i} className="sim-step-group flex flex-col items-start w-full cursor-default">
                
                {/* Step Card */}
                <div className="sim-step flex w-full bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg relative z-10 items-center">
                  <div className="mr-6 bg-gray-950 border border-gray-800 p-3 rounded-lg shadow-inner">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-200">{step.title}</h4>
                    <p className="text-gray-400 text-sm mt-1">{step.desc}</p>
                  </div>
                </div>

                {/* Vertical Connector Line (omitted on last step) */}
                {i < selectedPattern.steps.length - 1 && (
                  <div className="ml-11 w-0.5 h-8 bg-amber-900/40 relative z-0 sim-connector"></div>
                )}
              </div>
            ))}
          </div>

          <div className="sim-summary mt-12 p-6 rounded-xl border border-amber-900/50 bg-amber-950/20 shadow-[0_0_40px_rgba(245,158,11,0.05)]">
             <div className="flex gap-4 items-start">
               <ShieldAlert className="text-amber-500 flex-shrink-0 mt-1" />
               <p className="text-amber-100/90 leading-relaxed font-medium">
                 {selectedPattern.summary}
               </p>
             </div>
          </div>

        </div>
      )}

    </div>
  );
}
