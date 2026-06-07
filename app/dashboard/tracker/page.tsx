'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Application {
  id: number;
  company: string;
  emoji: string;
  role: string;
  salary: string;
  mode: string;
  status: number; // 0: Applied, 1: HR Contacted, 2: Interview, 3: Offer, 4: Rejected
  notes?: string;
  date_applied: string;
}

const STAGE_LABELS = ['Applied', 'HR Contacted', 'Interview', 'Offer 🎉', 'Rejected'];

export default function TrackerDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // FETCH LIVE DATA FROM THE CLOUD DATABASE ON COMPONENT MOUNT
  const fetchLiveTrackingPipeline = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('date_applied', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err: any) {
      console.error('Error reading pipeline nodes:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTrackingPipeline();
  }, []);

  // MUTATES AND UPDATES COMPONENT STATUS ENUM VALUE IN POSTGRES REAL-TIME
  const shiftApplicationStage = async (id: number, currentStatus: number, direction: number) => {
    const nextStatus = Math.max(0, Math.min(4, currentStatus + direction));
    
    // Optimistic UI state adjustment
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: nextStatus } : app));

    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: nextStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error shifting pipeline step:', err.message);
      fetchLiveTrackingPipeline(); // Roll back on failure
    }
  };

  // MUTATES AND DELETES COMPONENT ROW FROM CLOUD REPOSITORY
  const purgeApplication = async (id: number) => {
    setApplications(prev => prev.filter(app => app.id !== id));

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error removing tracking entry:', err.message);
      fetchLiveTrackingPipeline();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f6f8fc] text-[#1f1f1f] antialiased">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 pl-4 pr-3 py-5 flex flex-col justify-between h-screen shrink-0 bg-[#f6f8fc]">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pl-3">
            <div className="w-6 h-6 rounded-md bg-[#6366f1] text-white flex items-center justify-center font-black text-[11px] tracking-tight shadow-sm">SP</div>
            <span className="font-bold text-[16px] tracking-tight text-[#1f1f1f]">Digital Bridge</span>
          </div>

          <div className="pl-1.5">
            <a href="/dashboard/parse" className="inline-flex items-center gap-3 px-6 py-4 bg-[#c2e7ff] text-[#001d35] rounded-[16px] font-medium text-xs tracking-wide shadow-md hover:shadow-lg transition-all no-underline hover:bg-[#b3ddf7]">+ Analyze Profile</a>
          </div>

          <nav className="flex flex-col gap-0.5">
            <button className="flex items-center justify-between px-4 py-2 rounded-full text-xs font-semibold bg-[#e0e3e9] text-[#001d35] border-0 text-left cursor-pointer w-full">
              <div className="flex items-center gap-4"><span className="text-sm">📊</span><span>Pipeline Tracker</span></div>
              <span className="text-[10px] font-mono font-bold">{applications.length}</span>
            </button>
            <a href="/dashboard/jobs" className="flex items-center gap-4 px-4 py-2 rounded-full text-xs font-medium text-[#444746] hover:bg-[#000000]/[0.04] no-underline transition-colors text-left">
              <span className="text-sm">🔍</span><span>Funnel Matches</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* MAIN HUB WORKSPACE GRID */}
      <main className="flex-1 my-4 mr-4 bg-white rounded-[24px] px-10 py-10 shadow-sm border border-[#e3e3e3]/50 overflow-y-auto">
        <div className="max-w-[960px] mx-auto space-y-10 animate-content">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f1f3f4] pb-6">
            <div className="space-y-1.5">
              <h1 className="text-[28px] font-extrabold tracking-tight text-[#1f1f1f]">Pipeline Funnel Monitoring</h1>
              <p className="text-xs text-[#444746]">Sourced and synchronized directly from your cloud relational PostgreSQL database cluster nodes.</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <button onClick={() => setViewMode('kanban')} className={`bg-transparent border-0 p-0 font-bold cursor-pointer ${viewMode === 'kanban' ? 'text-[#6366f1] underline' : 'text-gray-400'}`}>🗂 Columns</button>
              <button onClick={() => setViewMode('list')} className={`bg-transparent border-0 p-0 font-bold cursor-pointer ${viewMode === 'list' ? 'text-[#6366f1] underline' : 'text-gray-400'}`}>☰ Sheet View</button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-24 text-center text-xs font-mono text-gray-400 animate-pulse">Handshaking securely with Supabase endpoints...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
              {STAGE_LABELS.map((stage, stageIdx) => {
                const stageApps = applications.filter(a => a.status === stageIdx);
                return (
                  <div key={stageIdx} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#f1f3f4] pb-2">
                      <h3 className="text-xs font-bold text-[#1f1f1f]">{stage}</h3>
                      <span className="text-[10px] font-mono text-gray-400 font-bold">{stageApps.length}</span>
                    </div>

                    <div className="space-y-5">
                      {stageApps.map(app => (
                        <div key={app.id} className="group space-y-1">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs select-none">{app.emoji}</span>
                              <h4 className="text-xs font-bold text-[#1f1f1f] truncate max-w-[110px]">{app.company}</h4>
                            </div>
                            <p className="text-[11px] text-gray-400 truncate font-medium">{app.role}</p>
                          </div>

                          <div className="flex items-center gap-3 pt-1">
                            {stageIdx > 0 && (
                              <button onClick={() => shiftApplicationStage(app.id, app.status, -1)} className="bg-transparent border-0 p-0 text-[10px] font-bold text-gray-400 hover:text-black cursor-pointer">←</button>
                            )}
                            {stageIdx < 4 && (
                              <button onClick={() => shiftApplicationStage(app.id, app.status, 1)} className="bg-transparent border-0 p-0 text-[10px] font-bold text-[#6366f1] hover:underline cursor-pointer">Advance →</button>
                            )}
                            <button onClick={() => purgeApplication(app.id)} className="bg-transparent border-0 p-0 text-[10px] text-gray-300 hover:text-rose-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">✕</button>
                          </div>
                        </div>
                      ))}

                      {stageApps.length === 0 && (
                        <div className="text-[10px] font-mono text-gray-300 italic py-1">Empty channel</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}