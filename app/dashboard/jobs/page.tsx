'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Job {
  id: number;
  title: string;
  company: string;
  emoji: string;
  match: number;
  salary: string;
  mode: string;
  tags: string[];
}

interface Recruiter {
  name: string;
  role: string;
  email: string;
  verified: boolean;
  avatar: string;
}

const INITIAL_JOBS: Job[] = [
  { id: 1, title: "Senior Automation Test Engineer", company: "Razorpay", emoji: "💳", match: 96, salary: "₹16–24 LPA", mode: "Hybrid · Bangalore", tags: ["Java", "Selenium", "Playwright", "API Testing"] },
  { id: 2, title: "Quality Assurance Engineer II", company: "Zepto", emoji: "🛒", match: 92, salary: "₹14–22 LPA", mode: "Remote", tags: ["Python", "Playwright", "SQL", "CI/CD"] }
];

const RECRUITER_ROUTING_DB: Record<string, Recruiter[]> = {
  'razorpay': [
    { name: 'Priya Sharma', role: 'Talent Acquisition Lead', email: 'priya.sharma@razorpay.com', verified: true, avatar: 'PS' }
  ],
  'zepto': [
    { name: 'Kavya Reddy', role: 'HR Business Partner', email: 'kavya.r@zepto.in', verified: true, avatar: 'KR' }
  ],
  'default': [
    { name: 'Technical Recruiter', role: 'Talent Acquisition Team', email: 'talent@company.com', verified: false, avatar: 'TR' }
  ]
};

export default function JobsDashboard() {
  const [activeTab, setActiveTab] = useState<'matches' | 'tailor' | 'hr' | 'settings'>('matches');
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());
  const [loadingJobId, setLoadingJobId] = useState<number | null>(null);
  const [isScraping, setIsScraping] = useState<boolean>(false);

  // States for sub-modules
  const [jdText, setJdText] = useState<string>('');
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [searchCompany, setSearchCompany] = useState<string>('');
  const [foundRecruiters, setFoundRecruiters] = useState<Recruiter[]>([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState<Recruiter | null>(null);

  // HANDLES THE BACKEND PLAYWRIGHT BROWSER SCRAPER ROUTINE TRIGGER
  const handleMarketScrape = async () => {
    setIsScraping(true);
    try {
      const response = await fetch('/api/scrape', { method: 'POST' });
      if (!response.ok) throw new Error('Scraper engine crash');
      
      const data = await response.json();
      if (data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs); // Re-populates dashboard state vectors with crawled roles
      }
    } catch (err) {
      alert('Playwright initialization issue: Ensure browser binaries match context configurations.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleAutoApply = async (job: Job) => {
    if (appliedJobIds.has(job.id)) return;
    setLoadingJobId(job.id);

    try {
      const { error } = await supabase
        .from('applications')
        .insert([
          {
            company: job.company,
            emoji: job.emoji,
            role: job.title,
            salary: job.salary,
            mode: job.mode,
            status: 0,
            notes: 'Sourced via live Playwright headless browser extraction array node.'
          }
        ]);

      if (error) throw error;
      setAppliedJobIds(prev => { const next = new Set(prev); next.add(job.id); return next; });
    } catch (err: any) {
      alert('Database connection transmission loop failed.');
    } finally {
      setLoadingJobId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f6f8fc] text-[#1f1f1f]">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 pl-4 pr-3 py-5 flex flex-col justify-between h-screen shrink-0 bg-[#f6f8fc]">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pl-3">
            <div className="w-6 h-6 rounded-md bg-[#6366f1] text-white flex items-center justify-center font-black text-[11px] tracking-tight shadow-sm">SP</div>
            <span className="font-bold text-[16px] tracking-tight text-[#1f1f1f]">Digital Bridge</span>
          </div>
          <div className="pl-1.5">
            <a href="/dashboard/parse" className="inline-flex items-center gap-3 px-6 py-4 bg-[#c2e7ff] text-[#001d35] rounded-[16px] font-medium text-xs tracking-wide shadow-md no-underline hover:bg-[#b3ddf7] transition-all">+ Analyze Profile</a>
          </div>
          <nav className="flex flex-col gap-0.5">
            <button onClick={() => setActiveTab('matches')} className={`flex items-center justify-between px-4 py-2 rounded-full text-xs font-medium border-0 text-left cursor-pointer w-full ${activeTab === 'matches' ? 'bg-[#e0e3e9] text-[#001d35] font-semibold' : 'text-[#444746] hover:bg-[#000000]/[0.04]'}`}>
              <div className="flex items-center gap-4"><span className="text-sm">🔍</span><span>Funnel Matches</span></div>
              <span className="text-[10px] font-mono text-[#444746]">{jobs.length}</span>
            </button>
            <button onClick={() => setActiveTab('tailor')} className={`flex items-center gap-4 px-4 py-2 rounded-full text-xs font-medium border-0 text-left cursor-pointer w-full ${activeTab === 'tailor' ? 'bg-[#e0e3e9] text-[#001d35] font-semibold' : 'text-[#444746] hover:bg-[#000000]/[0.04]'}`}><span className="text-sm">✏️</span><span>Profile Refine</span></button>
            <button onClick={() => setActiveTab('hr')} className={`flex items-center gap-4 px-4 py-2 rounded-full text-xs font-medium border-0 text-left cursor-pointer w-full ${activeTab === 'hr' ? 'bg-[#e0e3e9] text-[#001d35] font-semibold' : 'text-[#444746] hover:bg-[#000000]/[0.04]'}`}><span className="text-sm">💌</span><span>Outreach Engine</span></button>
          </nav>
        </div>
        <div className="flex items-center gap-3 p-3 mb-2 rounded-full">
          <div className="w-7 h-7 rounded-full bg-[#8b5cf6] flex items-center justify-center font-bold text-xs text-white">S</div>
          <div className="text-xs font-bold text-[#1f1f1f]">Sivaprakash S</div>
        </div>
      </aside>

      {/* MAIN HUB CANVAS */}
      <main className="flex-1 my-4 mr-4 bg-white rounded-[24px] px-10 py-10 shadow-sm border border-[#e3e3e3]/50 overflow-y-auto">
        <div className="max-w-[700px] mx-auto space-y-10 animate-content">
          
          <div className="flex items-center justify-between border-b border-[#f1f3f4] pb-6 gap-4">
            <div className="space-y-2">
              <h1 className="text-[28px] font-extrabold tracking-tight text-[#1f1f1f]">Ecosystem Market Funnel</h1>
              <p className="text-xs text-[#444746]">Sourcing engineering roles via programmatic scraper networks.</p>
            </div>
            {activeTab === 'matches' && (
              <button 
                onClick={handleMarketScrape}
                disabled={isScraping}
                className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-mono font-bold tracking-wide border-0 cursor-pointer disabled:opacity-50 transition-all shadow-sm shrink-0"
              >
                {isScraping ? '⚙️ RUNNING CRAWLER...' : '⚡ SCRAPE MARKET'}
              </button>
            )}
          </div>

          {activeTab === 'matches' && (
            <div className="space-y-6">
              {jobs.map(job => (
                <div key={job.id} className="space-y-3 pb-6 border-b border-[#f1f3f4]/80 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <span className="text-xl pt-0.5">{job.emoji}</span>
                      <div>
                        <h3 className="text-[15px] font-bold text-[#1f1f1f]">{job.title}</h3>
                        <p className="text-xs text-[#444746]"><span className="font-semibold text-gray-900">{job.company}</span> · {job.salary} · {job.mode}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#06b6d4]">{job.match}% ALPHA METRIC</span>
                  </div>
                  <div className="flex items-center gap-5 pt-1.5">
                    <button 
                      onClick={() => handleAutoApply(job)}
                      disabled={appliedJobIds.has(job.id) || loadingJobId === job.id}
                      className={`bg-transparent border-0 p-0 text-xs font-bold cursor-pointer ${appliedJobIds.has(job.id) ? 'text-[#10b981]' : 'text-[#6366f1] hover:underline'} disabled:opacity-40`}
                    >
                      {loadingJobId === job.id ? 'Writing to cloud database...' : appliedJobIds.has(job.id) ? '✓ Saved to Supabase' : 'Programmatic Apply'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fallback View Content Modules */}
          {activeTab === 'tailor' && <div className="text-xs font-mono text-gray-400 py-12 text-center">Refinement suite standing by. Analyze a profile path to unlock inputs.</div>}
          {activeTab === 'hr' && <div className="text-xs font-mono text-gray-400 py-12 text-center">Outreach routing channel ready. Execute a scraper scan to populate contacts.</div>}

        </div>
      </main>
    </div>
  );
}