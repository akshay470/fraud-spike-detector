"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Activity, 
  BrainCircuit, 
  Network, 
  SlidersHorizontal, 
  ShieldAlert, 
  BadgeDollarSign,
  ArrowDown
} from "lucide-react";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// --- MICRO VISUAL COMPONENTS ---

const MiniFraudChart = () => {
  return (
    <div className="bg-gray-950 p-4 rounded border border-gray-800 flex flex-col items-center justify-center gap-2 w-full mt-4">
      <div className="flex items-end gap-1 h-16 w-full justify-center px-4">
        {[2, 3, 2, 4, 3, 2].map((h, i) => (
          <div key={`norm1-${i}`} className="w-4 bg-blue-900/50 rounded-t" style={{ height: `${h * 10}%` }}></div>
        ))}
        {/* The Spike */}
        <div className="relative flex flex-col items-center group">
          <div className="absolute -top-6 text-[10px] text-red-400 font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Fraud Alert</div>
          <div className="w-5 bg-red-500 rounded-t h-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]" style={{ height: '90%' }}></div>
        </div>
        {[2, 1, 3].map((h, i) => (
          <div key={`norm2-${i}`} className="w-4 bg-blue-900/50 rounded-t" style={{ height: `${h * 10}%` }}></div>
        ))}
      </div>
      <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">10m Window</span>
    </div>
  );
};

const MiniSHAPGraph = () => {
  return (
    <div className="bg-gray-950 p-4 rounded border border-gray-800 w-full mt-4 flex flex-col gap-3">
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Amount Anomaly</span>
          <span className="text-red-400 font-mono">+34%</span>
        </div>
        <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
          <div className="bg-red-500 h-full w-[34%]"></div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">New Device</span>
          <span className="text-red-400 font-mono">+21%</span>
        </div>
        <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
          <div className="bg-red-500 h-full w-[21%]"></div>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Location Anomaly</span>
          <span className="text-red-400 font-mono">+18%</span>
        </div>
        <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
          <div className="bg-red-500 h-full w-[18%]"></div>
        </div>
      </div>
      <div className="mt-2 bg-indigo-950/30 border border-indigo-900/50 p-2 rounded text-[10px] text-indigo-200 leading-relaxed">
        <strong className="block text-indigo-400 mb-1">WHY WAS THIS FLAGGED?</strong>
        Unusually high transaction value combined with a new device and geographic deviation increased the risk score.
      </div>
    </div>
  );
};

const MiniNetwork = () => {
  return (
    <div className="bg-gray-950 p-4 rounded border border-gray-800 w-full mt-4 flex items-center justify-center min-h-[140px] relative overflow-hidden">
      {/* Network Lines */}
      <svg className="absolute inset-0 w-full h-full stroke-gray-700/50" style={{ zIndex: 0 }}>
        <line x1="20%" y1="30%" x2="50%" y2="50%" strokeWidth="1" />
        <line x1="80%" y1="30%" x2="50%" y2="50%" strokeWidth="1" />
        <line x1="50%" y1="80%" x2="50%" y2="50%" strokeWidth="2" className="stroke-red-500/50" />
      </svg>
      
      {/* Nodes */}
      <div className="absolute top-[20%] left-[15%] flex flex-col items-center z-10">
        <div className="w-2 h-2 rounded-full bg-blue-500 mb-1"></div>
        <span className="text-[8px] text-gray-500">ACCOUNT</span>
      </div>
      <div className="absolute top-[20%] right-[15%] flex flex-col items-center z-10">
        <div className="w-2 h-2 rounded-full bg-indigo-500 mb-1"></div>
        <span className="text-[8px] text-gray-500">DEVICE / IP</span>
      </div>
      <div className="absolute bottom-[10%] left-[50%] -translate-x-1/2 flex flex-col items-center z-10">
        <div className="w-8 h-8 rounded-full bg-red-900/40 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center justify-center animate-pulse">
           <div className="w-2 h-2 rounded-full bg-red-500"></div>
        </div>
        <span className="text-[9px] text-red-400 font-semibold mt-1">TRANSACTION</span>
      </div>
      
      <div className="absolute bottom-2 right-2 flex flex-col items-end">
        <span className="text-[8px] text-gray-600 bg-gray-900 px-1 py-0.5 rounded">Example / Simulation</span>
      </div>
    </div>
  );
};

const MiniSimulator = () => {
  const [val, setVal] = useState(42);
  return (
    <div className="bg-gray-950 p-4 rounded border border-gray-800 w-full mt-4 flex flex-col gap-4">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400">Transaction Amount</span>
        <span className="text-gray-200">₹{(val * 120).toLocaleString()}</span>
      </div>
      <input 
        type="range" 
        min="10" 
        max="90" 
        value={val} 
        onChange={(e) => setVal(parseInt(e.target.value))} 
        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      
      <div className="flex justify-between items-center text-xs border-t border-gray-900 pt-3">
        <span className="text-gray-400">Velocity</span>
        <span className="text-gray-200">3 / 10 min</span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400">Device</span>
        <span className="text-red-400 decoration-red-900/50 underline underline-offset-2 decoration-dashed">NEW</span>
      </div>

      <div className="mt-2 flex items-center justify-between bg-blue-950/20 border border-blue-900/30 p-2 rounded">
         <span className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">Risk Score</span>
         <span className="text-sm font-mono font-bold text-blue-300">{val}%</span>
      </div>
      <span className="text-[8px] text-gray-600 text-center">SIMULATION MODE</span>
    </div>
  );
};

const MiniResponse = () => {
  const [blocked, setBlocked] = useState(false);
  
  return (
    <div className="bg-gray-950 p-4 rounded border border-gray-800 w-full mt-4 flex flex-col items-center text-center">
      
      {!blocked ? (
        <div className="text-red-400 font-bold text-xs uppercase tracking-widest mb-3 flex flex-col items-center gap-1">
          <ShieldAlert size={20} className="animate-pulse" />
          AT RISK
        </div>
      ) : (
        <div className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-3 flex flex-col items-center gap-1">
          <ShieldCheck size={20} />
          BLOCKED: LOSS PREVENTED
        </div>
      )}
      
      <div className="flex gap-2 w-full justify-center mt-2">
        <button 
          onClick={() => setBlocked(true)}
          disabled={blocked}
          className={`flex-1 text-[10px] py-1.5 rounded border transition-colors ${blocked ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-red-900/20 border-red-900/50 text-red-400 hover:bg-red-900/40'}`}
        >
          BLOCK
        </button>
        <button 
          disabled={blocked}
          className={`flex-1 text-[10px] py-1.5 rounded border transition-colors ${blocked ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-yellow-900/20 border-yellow-900/50 text-yellow-400 hover:bg-yellow-900/40'}`}
        >
          VERIFY
        </button>
      </div>
      
      {blocked && (
        <button onClick={() => setBlocked(false)} className="text-[9px] text-gray-500 hover:text-gray-300 underline mt-3">Reset Simulation</button>
      )}
      {!blocked && (
        <span className="text-[8px] text-gray-600 text-center mt-3">Simulated Action</span>
      )}
    </div>
  );
};

const MiniMetrics = () => {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4 w-full">
      <div className="bg-gray-950 p-3 rounded border border-gray-800 flex flex-col items-center justify-center text-center">
        <span className="text-[9px] text-gray-500 uppercase font-semibold">Fraud Attempted</span>
        <span className="text-sm font-mono text-gray-300">₹42.8L</span>
      </div>
      <div className="bg-gray-950 p-3 rounded border border-gray-800 flex flex-col items-center justify-center text-center">
        <span className="text-[9px] text-gray-500 uppercase font-semibold">Fraud Detected</span>
        <span className="text-sm font-mono text-blue-400">₹38.2L</span>
      </div>
      <div className="bg-gray-950 p-3 rounded border border-gray-800 flex flex-col items-center justify-center text-center">
        <span className="text-[9px] text-gray-500 uppercase font-semibold">Loss Prevented</span>
        <span className="text-sm font-mono text-emerald-400">₹31.6L</span>
      </div>
      <div className="bg-gray-950 p-3 rounded border border-gray-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5"></div>
        <span className="text-[9px] text-emerald-500 uppercase font-semibold z-10">Net Savings</span>
        <span className="text-sm font-mono text-emerald-400 font-bold z-10">₹29.2L</span>
      </div>
      <div className="col-span-2 text-center mt-1">
        <span className="text-[8px] text-gray-600 bg-gray-900 px-1 py-0.5 rounded">SIMULATION / ESTIMATED</span>
      </div>
    </div>
  );
};

// --- SHIELD CHECK LOCAL ICON ---
function ShieldCheck({ size = 24, className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
      <path d="m9 12 2 2 4-4"></path>
    </svg>
  );
}

// --- MAIN COMPONENT ---

interface ProblemCardProps {
  number: string;
  problemTitle: string;
  problemDesc: string;
  solutionTitle: string;
  solutionDesc: string;
  impact?: string;
  align: "left" | "right";
  icon: React.ReactNode;
  children: React.ReactNode; 
}

const ProblemSolutionCard = ({ number, problemTitle, problemDesc, solutionTitle, solutionDesc, impact, align, icon, children }: ProblemCardProps) => {
  return (
    <div className={`gsap-card opacity-0 translate-y-10 flex flex-col md:flex-row w-full ${align === 'right' ? 'md:flex-row-reverse' : ''} gap-8 relative z-10 my-16`}>
      {/* Container spacing element for the timeline on desktop */}
      <div className="hidden md:block md:w-1/2"></div>
      
      {/* Content Card */}
      <div className="w-full md:w-1/2 flex justify-center">
        <div className="bg-[#0c0c0e] border border-gray-800 rounded-2xl p-6 shadow-2xl hover:border-gray-700 hover:shadow-blue-900/10 transition-all duration-500 w-full max-w-md relative overflow-hidden group">
          {/* Subtle glow bg */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>

          {/* Problem */}
          <div className="mb-6 pb-6 border-b border-gray-800/60 relative z-10">
            <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">
              Problem {number}
            </div>
            <h4 className="text-lg font-medium text-gray-200 mb-2 leading-tight">
              {problemTitle}
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              {problemDesc}
            </p>
          </div>

          {/* Arrow visual flow */}
          <div className="flex justify-center -mt-9 mb-3 relative z-20">
            <div className="bg-gray-900 border border-gray-800 p-1.5 rounded-full text-gray-600">
               <ArrowDown size={14} />
            </div>
          </div>

          {/* Solution */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-blue-400 bg-blue-950/30 p-1.5 rounded-md border border-blue-900/30">
                {icon}
              </div>
              <div className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">
                {solutionTitle}
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              {solutionDesc}
            </p>
            
            {/* Embedded Visual */}
            {children}
            
            {/* Impact */}
            {impact && (
              <div className="mt-5 text-center">
                <ArrowDown size={14} className="mx-auto text-gray-700 mb-2" />
                <span className="text-[11px] text-emerald-400/80 uppercase font-semibold tracking-wider bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-900/30">
                  {impact}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function WhyRiskManager() {
  const containerRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Just make everything visible immediately
      gsap.set(".gsap-card", { opacity: 1, y: 0 });
      gsap.set(lineRef.current, { scaleY: 1 });
      return;
    }

    const cards = gsap.utils.toArray(".gsap-card");
    
    // Timeline animation
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top center",
      end: "bottom center",
      animation: gsap.to(lineRef.current, {
        scaleY: 1,
        ease: "none",
        transformOrigin: "top center"
      }),
      scrub: 1
    });

    // Animate cards on scroll
    cards.forEach((card: any, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: "top 80%",
        animation: gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out"
        })
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section 
      id="why-ai-risk-manager"
      ref={containerRef} 
      className="mt-16 pt-16 border-t border-gray-800/80 mb-24 relative"
    >
      {/* Desktop Centered Progress Line */}
      <div className="hidden md:block absolute top-[200px] bottom-[200px] left-1/2 -translate-x-1/2 w-px bg-gray-800">
        <div 
          ref={lineRef}
          className="w-full h-full bg-gradient-to-b from-blue-500 via-indigo-500 to-emerald-500 scale-y-0 transform-origin-top"
        ></div>
      </div>

      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto mb-20 relative z-10 px-4">
        <h2 className="text-xs font-black tracking-[0.3em] text-blue-500 uppercase mb-4 opacity-80 backdrop-blur-sm drop-shadow-lg">
          WHY AI RISK MANAGER?
        </h2>
        <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
          From fraud <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">detection</span><br/>
          to intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">prevention.</span>
        </h3>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto font-medium">
          Traditional fraud systems often stop at identifying suspicious transactions. 
          AI Risk Manager goes further — explaining risk, connecting suspicious activity, 
          simulating attacks, recommending actions, and measuring business impact.
        </p>
        
        {/* Journey Flow Desktop */}
        <div className="hidden md:flex justify-center items-center gap-3 mt-10 text-[9px] font-bold tracking-widest text-gray-500 uppercase">
          <span className="text-blue-400">Detect</span> <ArrowRight size={10} className="text-gray-700"/>
          <span className="text-indigo-400">Explain</span> <ArrowRight size={10} className="text-gray-700"/>
          <span className="text-purple-400">Investigate</span> <ArrowRight size={10} className="text-gray-700"/>
          <span className="text-pink-400">Connect</span> <ArrowRight size={10} className="text-gray-700"/>
          <span className="text-orange-400">Simulate</span> <ArrowRight size={10} className="text-gray-700"/>
          <span className="text-yellow-400">Respond</span> <ArrowRight size={10} className="text-gray-700"/>
          <span className="text-emerald-400">Measure</span>
        </div>
      </div>

      {/* MAIN CARDS */}
      <div className="relative z-10 px-0 sm:px-6">
        
        <ProblemSolutionCard 
          number="01"
          problemTitle="Fraud is detected too late."
          problemDesc="Suspicious activity can remain unnoticed until significant damage has already occurred."
          solutionTitle="REAL-TIME FRAUD SPIKE DETECTION"
          solutionDesc="AI Risk Manager continuously analyzes transaction activity and identifies abnormal fraud spikes within short time windows."
          icon={<Activity size={16} />}
          align="left"
          impact="Detect emerging threats earlier"
        >
          <MiniFraudChart />
        </ProblemSolutionCard>

        <ProblemSolutionCard 
          number="02"
          problemTitle="AI decisions can feel like black boxes."
          problemDesc="A transaction gets flagged, but analysts may not understand why."
          solutionTitle="EXPLAINABLE AI"
          solutionDesc="Every risk decision can be broken down into the factors contributing to the fraud probability."
          icon={<BrainCircuit size={16} />}
          align="right"
        >
          <MiniSHAPGraph />
        </ProblemSolutionCard>

        <ProblemSolutionCard 
          number="03"
          problemTitle="Fraud rarely happens in isolation."
          problemDesc="A suspicious transaction may look harmless when viewed independently."
          solutionTitle="FRAUD NETWORK INTELLIGENCE"
          solutionDesc="Connect accounts, devices, IP addresses, merchants, and transactions to uncover suspicious relationships and potential fraud rings."
          icon={<Network size={16} />}
          align="left"
        >
          <MiniNetwork />
        </ProblemSolutionCard>

        <ProblemSolutionCard 
          number="04"
          problemTitle="Risk factors are difficult to understand."
          problemDesc="Analysts need to understand how changing transaction conditions affects risk."
          solutionTitle="WHAT-IF RISK SIMULATOR"
          solutionDesc="Test how amount, transaction velocity, device familiarity, and location affect the risk score."
          icon={<SlidersHorizontal size={16} />}
          align="right"
        >
          <MiniSimulator />
        </ProblemSolutionCard>

        <ProblemSolutionCard 
          number="05"
          problemTitle="Detection alone does not prevent fraud."
          problemDesc="Identifying a suspicious transaction is only the beginning. Someone still needs to decide what happens next."
          solutionTitle="AI-ASSISTED RESPONSE"
          solutionDesc="Turn fraud signals into actionable recommendations such as block, verify, or escalate."
          icon={<ShieldAlert size={16} />}
          align="left"
        >
          <MiniResponse />
        </ProblemSolutionCard>

        <ProblemSolutionCard 
          number="06"
          problemTitle="Model metrics don't tell the whole story."
          problemDesc="Accuracy alone doesn't explain how much fraud was prevented or what the system costs."
          solutionTitle="BUSINESS IMPACT INTELLIGENCE"
          solutionDesc="Connect model performance to financial outcomes such as fraud prevented, false-positive cost, and estimated loss prevented."
          icon={<BadgeDollarSign size={16} />}
          align="right"
        >
          <MiniMetrics />
        </ProblemSolutionCard>

      </div>

      {/* FINAL CONCLUSION */}
      <div className="mt-32 text-center relative max-w-3xl mx-auto px-4">
        {/* Glow behind final text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <h3 className="text-3xl md:text-5xl font-black text-white/50 tracking-tight mb-2 uppercase">
            From Fraud Detection
          </h3>
          <h3 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 tracking-tight uppercase mb-8">
            To Fraud Prevention
          </h3>
          
          <div className="flex flex-wrap justify-center items-center gap-y-2 gap-x-2 md:gap-x-4 mt-8 mb-6 text-[10px] md:text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">
            <span className="text-blue-400/80">Detect</span> <span>→</span>
            <span className="text-blue-400/80">Explain</span> <span>→</span>
            <span className="text-blue-400/80">Investigate</span> <span>→</span>
            <span className="text-blue-400/80">Connect</span> <span>→</span>
            <span className="text-blue-400/80">Simulate</span> <span>→</span>
            <span className="text-blue-400/80">Respond</span> <span>→</span>
            <span className="text-blue-400/80">Measure</span>
          </div>

          <p className="text-gray-400 font-medium tracking-wide">
            Turning fraud signals into intelligent decisions.
          </p>
        </div>
      </div>
    </section>
  );
}

// Ensure ArrowRight is defined since we used it up top
function ArrowRight({ size = 24, className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  );
}
