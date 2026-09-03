"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { gsap } from "gsap";

const points = [
  {
    num: "01",
    title: "LATE DETECTION",
    problem: "Fraud can be identified only after damage occurs.",
    solution: "REAL-TIME FRAUD SPIKE DETECTION",
    impact: "Detect emerging threats earlier.",
  },
  {
    num: "02",
    title: "BLACK-BOX DECISIONS",
    problem: "Analysts may not know why a transaction was flagged.",
    solution: "EXPLAINABLE AI",
    impact: "Understand the factors behind every risk decision.",
  },
  {
    num: "03",
    title: "ISOLATED TRANSACTIONS",
    problem: "Fraud often involves connected accounts, devices and merchants.",
    solution: "FRAUD NETWORK INTELLIGENCE",
    impact: "Reveal suspicious relationships and potential fraud rings.",
  },
  {
    num: "04",
    title: "UNCLEAR RISK FACTORS",
    problem: "Changing transaction conditions can dramatically change risk.",
    solution: "WHAT-IF RISK SIMULATOR",
    impact: "Test how amount, device, location and velocity affect risk.",
  },
  {
    num: "05",
    title: "DETECTION ≠ PREVENTION",
    problem: "Identifying fraud is only the beginning.",
    solution: "AI-ASSISTED RESPONSE",
    impact: "Turn risk signals into actionable decisions.",
  },
  {
    num: "06",
    title: "METRICS ≠ BUSINESS IMPACT",
    problem: "Model accuracy alone doesn't show financial value.",
    solution: "BUSINESS IMPACT INTELLIGENCE",
    impact: "Connect fraud detection to loss prevented and financial outcomes.",
  },
];

export default function WhyRiskManager() {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Skip initial mount animation if user hasn't interacted
    if (!hasInteracted) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Use GSAP context for better cleanup in React
    const ctx = gsap.context(() => {
      if (isExpanded) {
        if (!prefersReducedMotion) {
          gsap.to(contentRef.current, { height: "auto", duration: 0.5, ease: "power3.out" });
          gsap.to(iconRef.current, { rotation: 45, duration: 0.3, ease: "power2.inOut" });
          
          gsap.fromTo(".reveal-item", 
            { opacity: 0, y: 15 }, 
            { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out", delay: 0.1 }
          );
        } else {
          gsap.set(contentRef.current, { height: "auto" });
          gsap.set(iconRef.current, { rotation: 45 });
          gsap.set(".reveal-item", { opacity: 1, y: 0 });
        }
        
        // Auto-scroll slightly so user sees the expanded content
        setTimeout(() => {
          const el = document.getElementById("why-ai-risk-manager");
          if (el) {
            const rect = el.getBoundingClientRect();
            // If the accordion header is very high or the content falls below view
            if (rect.top < window.innerHeight * 0.2 || rect.top > window.innerHeight * 0.8) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        }, 100);
        
      } else {
        if (!prefersReducedMotion) {
          gsap.to(contentRef.current, { height: 0, duration: 0.4, ease: "power3.inOut" });
          gsap.to(iconRef.current, { rotation: 0, duration: 0.3, ease: "power2.inOut" });
          gsap.to(".reveal-item", { opacity: 0, duration: 0.2 });
        } else {
          gsap.set(contentRef.current, { height: 0 });
          gsap.set(iconRef.current, { rotation: 0 });
        }
      }
    }, contentRef); 

    return () => ctx.revert();
  }, [isExpanded, hasInteracted]);

  const toggleExpand = () => {
    setHasInteracted(true);
    setIsExpanded((prev) => !prev);
  };

  return (
    <section id="why-ai-risk-manager" className="w-full mt-12 mb-8 relative px-1 sm:px-0">
      {/* COMPACT ROW */}
      <div className="w-full border-t border-b border-gray-800/80 bg-gray-950/20 hover:bg-gray-900/30 transition-colors">
        <button
          onClick={toggleExpand}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse Why AI Risk Manager" : "Expand Why AI Risk Manager"}
          className="w-full py-5 md:py-6 px-4 md:px-6 flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <div className="flex flex-col items-start text-left">
            <h2 className="text-sm md:text-[15px] font-bold tracking-[0.15em] md:tracking-[0.2em] text-gray-200 group-hover:text-blue-400 transition-colors">
              WHY AI RISK MANAGER?
            </h2>
            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'h-0 opacity-0' : 'h-5 opacity-100 mt-1'}`}>
              <p className="text-[11px] md:text-xs text-gray-500 font-medium tracking-wide">
                From fraud detection to intelligent prevention.
              </p>
            </div>
          </div>
          
          <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full border border-gray-800 bg-gray-900/50 flex items-center justify-center group-hover:bg-blue-900/20 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all shadow-sm ml-4">
            <Plus ref={iconRef} size={20} className="text-gray-400 group-hover:text-blue-400" />
          </div>
        </button>
      </div>

      {/* EXPANDED CONTENT WRAPPER */}
      <div 
        ref={contentRef} 
        className="overflow-hidden h-0 border-x border-b border-transparent bg-gradient-to-b from-gray-950/50 to-transparent"
      >
        <div className="p-5 sm:p-8 md:p-10 max-w-5xl mx-auto">
          
          {/* Header Area inside expansion */}
          <div className="reveal-item text-center mb-10 md:mb-12 relative opacity-0">
             <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-200 mb-5 md:mb-6">
                From fraud detection to intelligent prevention.
             </h3>
             <div className="flex justify-center flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-[0.1em] md:tracking-[0.15em] text-gray-500 uppercase">
                <span className="text-blue-400/80">Detect</span> <span>→</span>
                <span className="text-indigo-400/80">Explain</span> <span>→</span>
                <span className="text-purple-400/80">Investigate</span> <span>→</span>
                <span className="text-pink-400/80">Connect</span> <span>→</span>
                <span className="text-orange-400/80">Simulate</span> <span>→</span>
                <span className="text-yellow-400/80">Respond</span> <span>→</span>
                <span className="text-emerald-400/80">Measure</span>
             </div>
             
             {/* Decorative line */}
             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 md:w-48 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
          </div>

          {/* Grid layout for points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {points.map((pt, i) => (
              <div key={i} className="reveal-item opacity-0 flex flex-col pt-4 border-t border-gray-800/60 relative group hover:border-gray-600 transition-colors">
                <div className="text-[10px] font-mono text-gray-600 mb-2 absolute top-0 -translate-y-1/2 bg-gray-[10] px-2">{pt.num} — {pt.title}</div>
                
                <div className="mb-2.5">
                  <span className="text-[11px] text-gray-500 block mb-0.5">Problem:</span>
                  <span className="text-sm text-gray-300 leading-relaxed block">{pt.problem}</span>
                </div>
                
                <div className="mb-3">
                  <span className="text-[10px] uppercase tracking-wider text-blue-500/80 font-bold block mb-0.5">Solution:</span>
                  <span className="text-sm text-gray-200 leading-relaxed block font-medium">{pt.solution}</span>
                </div>
                
                <div className="mt-auto pt-1">
                  <span className="inline-block text-[10px] md:text-[11px] uppercase font-semibold text-emerald-400/90 bg-emerald-950/30 border border-emerald-900/30 px-2 py-1 rounded">
                    Impact: {pt.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Area inside expansion */}
          <div className="reveal-item opacity-0 mt-12 md:mt-16 pt-8 md:pt-10 border-t border-gray-800/40 text-center relative">
            <h4 className="text-base sm:text-lg md:text-xl font-black text-gray-500 uppercase tracking-tight">
              FROM FRAUD DETECTION
            </h4>
            <h4 className="text-lg sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 uppercase tracking-tight mb-4">
              TO FRAUD PREVENTION
            </h4>
             <div className="flex justify-center flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.1em] text-gray-600 uppercase mb-4">
                <span>Detect</span> <span>→</span>
                <span>Explain</span> <span>→</span>
                <span>Investigate</span> <span>→</span>
                <span>Connect</span> <span>→</span>
                <span>Simulate</span> <span>→</span>
                <span>Respond</span> <span>→</span>
                <span>Measure</span>
             </div>
             <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Turning fraud signals into intelligent decisions.
             </p>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none"></div>
          </div>

        </div>
      </div>
    </section>
  );
}
