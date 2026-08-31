"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

export default function AmbientBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Confined GSAP Context strictly linking animations to this component's lifecycle
    const ctx = gsap.context(() => {
      
      // Blob 1: Blue accent drifting top-left to center-right
      gsap.to(".blob-1", {
        x: "30vw",
        y: "20vh",
        scale: 1.2,
        duration: 22,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
      
      // Blob 2: Deep Purple drifting bottom-right to center-left
      gsap.to(".blob-2", {
        x: "-40vw",
        y: "-30vh",
        scale: 1.4,
        duration: 25,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: -5
      });
      
      // Blob 3: Subtle Gold pulsing in lower center
      gsap.to(".blob-3", {
        x: "15vw",
        y: "-15vh",
        scale: 1.5,
        opacity: 0.5,
        duration: 18,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: -2
      });
      
    }, containerRef);
    
    // Explicit GC cleanup on strictly restricted hook unmount
    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-0 bg-gray-950 overflow-hidden pointer-events-none"
    >
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen">
        {/* Blue Orb */}
        <div className="blob-1 absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/40 blur-[120px]" />
        
        {/* Purple Orb */}
        <div className="blob-2 absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-700/30 blur-[130px]" />
        
        {/* Subtle Gold Orb */}
        <div className="blob-3 absolute bottom-[10%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-yellow-500/10 blur-[100px]" />
      </div>
    </div>
  );
}
