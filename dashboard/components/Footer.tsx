"use client";

import React from "react";
import { Database, Brain, ArrowRight, ShieldCheck, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 pt-8 border-t border-gray-800 flex flex-col gap-8 w-full pb-8">
      
      {/* 1. Security & Compliance */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h4 className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldCheck size={14} className="text-gray-500" />
          Security & Compliance Considerations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-gray-200 text-sm font-medium">Data Privacy</span>
            <span className="text-gray-500 text-xs">Dataset is fully PCA-anonymized. Transaction PII is naturally tokenized.</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-gray-200 text-sm font-medium">Encryption</span>
            <span className="text-gray-500 text-xs">Production architecture assumes TLS in transit and AES-256 at rest.</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-gray-200 text-sm font-medium">Access Control</span>
            <span className="text-gray-500 text-xs">Strict simulated RBAC. Tuning limits locked to authorized risk officers.</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-gray-200 text-sm font-medium">Audit & Explainability</span>
            <span className="text-gray-500 text-xs">Granular SHAP metrics ensure seamless regulatory "Right to Explanation."</span>
          </div>
        </div>
      </div>

      {/* 2. How It Works - Compact horizontal flow */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">How It Works</h4>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Step 
            number={1} 
            title="Ingest" 
            desc="Transaction stream comes in" 
            icon={<Database size={16} />} 
          />
          <Arrow />
          <Step 
            number={2} 
            title="Score" 
            desc="XGBoost model computes probability" 
            icon={<Brain size={16} />} 
          />
          <Arrow />
          <Step 
            number={3} 
            title="Detect" 
            desc="Z-score anomaly detection flags spikes" 
            icon={<Cpu size={16} />} 
          />
          <Arrow />
          <Step 
            number={4} 
            title="Respond" 
            desc="Simulated risk actions mapped by severity" 
            icon={<ShieldCheck size={16} />} 
          />
        </div>
      </div>

      {/* 3. Tech Stack */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mr-2">Built With</h4>
        <TechBadge name="XGBoost" />
        <TechBadge name="FastAPI" />
        <TechBadge name="PostgreSQL (Neon)" />
        <TechBadge name="Next.js" />
        <TechBadge name="Recharts" />
        <TechBadge name="TailwindCSS" />
      </div>

      {/* 3. Closing Line */}
      <div className="flex flex-col items-center justify-center gap-2 mt-4 text-center">
        <p className="text-gray-500 text-sm font-medium">
          Built for Razorpay Hackathon — Track 02: AI Risk Manager
        </p>
        <a 
          href="#" 
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm mt-1"
          target="_blank" 
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
          <span>View Source on GitHub</span>
        </a>
      </div>

    </footer>
  );
}

// Helpers for cleaner JSX above
function Step({ number, title, desc, icon }: { number: number, title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center max-w-[140px]">
      <div className="w-8 h-8 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2">
        {icon}
      </div>
      <span className="text-gray-200 text-sm font-semibold mb-1">
        {number}. {title}
      </span>
      <span className="text-gray-500 text-xs leading-tight">
        {desc}
      </span>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden sm:block text-gray-700">
      <ArrowRight size={20} />
    </div>
  );
}

function TechBadge({ name }: { name: string }) {
  return (
    <span className="px-2.5 py-1 bg-gray-800/50 border border-gray-700 rounded-md text-gray-400 text-xs">
      {name}
    </span>
  );
}
