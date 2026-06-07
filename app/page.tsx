'use client';

import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#1f1f1f] flex flex-col justify-between antialiased font-sans">
      
      {/* HEADER NAV */}
      <nav className="border-b border-gray-200/60 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-[#6366f1] text-white flex items-center justify-center font-black text-[11px] tracking-tight">
              SP
            </div>
            <span className="font-bold text-[16px] tracking-tight text-[#1f1f1f]">
              Digital Bridge
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/dashboard/parse" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c2e7ff] text-[#001d35] rounded-full font-semibold text-xs tracking-wide no-underline hover:bg-[#b3ddf7] transition-all shadow-sm">
              Launch Workspace →
            </a>
          </div>
        </div>
      </nav>

      {/* HERO HERO COMPONENT SECTION */}
      <main className="flex-1 max-w-3xl mx-auto px-6 flex flex-col justify-center items-center text-center py-20 space-y-6">
        <span className="text-[11px] font-mono font-bold tracking-wider text-[#6366f1] uppercase bg-indigo-50 px-3 py-1 rounded-full">
          ⚡ Career Automation Engine
        </span>
        <h1 className="text-[44px] sm:text-[56px] font-extrabold tracking-tight text-[#1f1f1f] leading-[1.1]">
          Your placement pipeline,<br />
          <span className="text-[#6366f1]">on autopilot.</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-lg leading-relaxed font-normal">
          Drop your credentials profile down. Our system parses candidate variables, tracks real market match factors, and automates tracking metrics cleanly.
        </p>
        <div className="pt-4">
          <a 
            href="/dashboard/parse" 
            className="px-8 py-3.5 bg-[#6366f1] text-white font-bold text-xs tracking-wider uppercase rounded-xl shadow-md shadow-indigo-100 hover:bg-[#4f46e5] transition-all no-underline"
          >
            Get Started Free
          </a>
        </div>
      </main>

      {/* FOOTER CONTAINER */}
      <footer className="border-t border-gray-200/60 py-6 text-center bg-white">
        <p className="text-[11px] font-mono text-gray-400">
          © 2026 SP Digital Bridge — Enterprise Placement Operations Hub
        </p>
      </footer>

    </div>
  );
}