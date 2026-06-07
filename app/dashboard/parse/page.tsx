'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ParsedProfile {
  id: string;
  name: string;
  role: string;
  experience_years: number;
  skills: string[];
  email: string;
  summary: string;
  profile_score: number;
}

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  time: string;
}

export default function ParsePage() {
  const [viewState, setViewState] = useState<'upload' | 'processing' | 'dashboard'>('upload');
  const [progress, setProgress] = useState<number>(0);
  const [profile, setProfile] = useState<ParsedProfile | null>(null);
  
  // Advanced State Co-Pilot Tracks
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chips, setChips] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [chatStage, setChatStage] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const executeLiveUploadPipeline = async (targetFile: File) => {
    setViewState('processing');
    setProgress(20);

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 150);

    try {
      const dataPayload = new FormData();
      dataPayload.append('file', targetFile);

      const networkResponse = await fetch('/api/parse', {
        method: 'POST',
        body: dataPayload,
      });

      clearInterval(progressTimer);
      setProgress(100);

      if (!networkResponse.ok) throw new Error('Database insertion rejection event.');

      const savedDatabaseRow: ParsedProfile = await networkResponse.json();

      setTimeout(() => {
        setProfile(savedDatabaseRow);
        setViewState('dashboard');
        initializeAIChat(savedDatabaseRow);
      }, 300);

    } catch (error) {
      clearInterval(progressTimer);
      alert('Network transmission failed. Reverting upload canvas grid.');
      setViewState('upload');
    }
  };

  const initializeAIChat = (p: ParsedProfile) => {
    const firstName = p.name.split(' ')[0];
    setMessages([
      {
        role: 'ai',
        text: `Hey ${firstName} 👋 Profile data safely synchronized to your PostgreSQL cloud cluster! Your specialized background in ${p.skills.slice(0, 3).join(' + ')} provides a fantastic automation engineering baseline. Let's optimize your alignment variables: What is your targeted salary expectation range?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatStage(0);
    setChips(['₹12–18 LPA', '₹18–25 LPA', 'Negotiable']);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputValue.trim();
    if (!messageText || isTyping || !profile) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: messageText, time: timestamp }]);
    setInputValue('');
    setChips([]);
    setIsTyping(true);

    try {
      // POST DATA INTERACTION DIRECTLY TO THE LIVE AI CHAT ROUTER
      const aiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          message: messageText,
          stage: chatStage
        })
      });

      if (!aiResponse.ok) throw new Error('AI generation fault');

      const data = await aiResponse.json();

      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setChips(data.chips || []);
      setChatStage(prev => prev + 1);

    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ Connection loop timeout. Please check your cloud database logs.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
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
            <button onClick={() => setViewState('upload')} className="inline-flex items-center gap-3 px-6 py-4 bg-[#c2e7ff] text-[#001d35] rounded-[16px] font-medium text-xs tracking-wide shadow-md hover:shadow-lg transition-all border-0 cursor-pointer">
              <span className="text-sm font-light">+</span> Analyze Profile
            </button>
          </div>

          <nav className="flex flex-col gap-0.5">
            <a href="/dashboard/tracker" className="flex items-center gap-4 px-4 py-2 rounded-full text-xs font-medium text-[#444746] hover:bg-[#000000]/[0.04] no-underline transition-colors">
              <span className="text-sm">📊</span> Pipeline Tracker
            </a>
            <a href="/dashboard/jobs" className="flex items-center gap-4 px-4 py-2 rounded-full text-xs font-medium text-[#444746] hover:bg-[#000000]/[0.04] no-underline transition-colors">
              <span className="text-sm">🔍</span> Funnel Matches
            </a>
          </nav>
        </div>
      </aside>

      {/* EXPANSIVE MAIN CANVAS CONTAINER */}
      <main className="flex-1 my-4 mr-4 bg-white rounded-[24px] px-10 py-10 shadow-sm border border-[#e3e3e3]/50 overflow-y-auto">
        <div className="max-w-[680px] mx-auto space-y-8 animate-content">
          
          {viewState === 'upload' && (
            <div className="space-y-8 py-6">
              <div className="space-y-2 border-b border-[#f1f3f4] pb-6">
                <h1 className="text-[28px] font-extrabold tracking-tight text-[#1f1f1f]">Profile Synchronization</h1>
                <p className="text-xs text-[#444746]">Initialize data pipelines by dropping your career documents down below.</p>
              </div>

              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) executeLiveUploadPipeline(file); }}
                onClick={() => document.getElementById('file-upload-input')?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-[#6366f1] bg-[#fafafa] rounded-[20px] p-16 transition-all cursor-pointer text-center group"
              >
                <div className="text-3xl mb-3 select-none">📄</div>
                <h3 className="font-bold text-sm text-[#1f1f1f] mb-1">Select or drag your profile document</h3>
                <p className="text-[11px] text-gray-400">Accepts system parameters across PDF, DOCX, or plain text bundles</p>
                <input id="file-upload-input" type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) executeLiveUploadPipeline(file); }} />
              </div>
            </div>
          )}

          {viewState === 'processing' && (
            <div className="py-24 text-center max-w-[360px] mx-auto space-y-4">
              <div className="w-8 h-8 border-2 border-gray-100 border-t-[#6366f1] rounded-full animate-spin mx-auto" />
              <div className="flex justify-between text-xs font-mono text-gray-400">
                <span>Parsing structure nodes into PostgreSQL...</span>
                <span className="font-bold text-[#6366f1]">{progress}%</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#6366f1] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {viewState === 'dashboard' && profile && (
            <div className="space-y-8 animate-content">
              
              <div className="space-y-4 border-b border-[#f1f3f4] pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-[#1f1f1f]">{profile.name}</h2>
                    <p className="text-xs text-[#6366f1] font-semibold uppercase font-mono tracking-wider">{profile.role}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#10b981] bg-emerald-50 px-2.5 py-0.5 rounded">
                    ✓ LIVE DB NODE RECORD
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} className="font-medium">#{skill.toLowerCase()}</span>
                  ))}
                </div>
              </div>

              {/* CO-PILOT SCREEN COMPONENT */}
              <div className="border border-gray-200/80 bg-[#fafafa] rounded-[20px] overflow-hidden flex flex-col h-[420px] shadow-sm">
                <div className="px-5 py-3 border-b border-gray-200/60 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm select-none">🤖</span>
                    <span className="text-xs font-bold text-[#1f1f1f]">Aria Optimization Co-Pilot</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                </div>

                <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'ml-auto items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-[16px] whitespace-pre-line leading-relaxed ${
                        msg.role === 'user' ? 'bg-[#c2e7ff] text-[#001d35] rounded-tr-none font-medium' : 'bg-white border border-gray-200/60 text-[#1f1f1f] rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 px-1 font-mono">{msg.time}</span>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="bg-white border border-gray-200/60 px-4 py-2.5 rounded-[16px] rounded-tl-none w-fit flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce"></span>
                      <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce [animation-delay:0.1s]"></span>
                      <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* SUGGESTION CHIP CONTAINERS */}
                {chips.length > 0 && (
                  <div className="px-4 pb-2.5 flex flex-wrap gap-1.5 bg-transparent">
                    {chips.map((chip, idx) => (
                      <button key={idx} onClick={() => handleSendMessage(chip)} className="text-[11px] font-sans font-medium bg-white hover:bg-gray-100 text-[#444746] border border-gray-200 px-3 py-1 rounded-full transition-all cursor-pointer shadow-sm">
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-2.5 border-t border-gray-200/60 bg-white flex gap-2 items-center">
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Instruct Aria to build tailored assets..." className="flex-1 bg-[#f1f3f4] border-0 rounded-xl px-4 py-2 text-xs text-black outline-none" />
                  <button onClick={() => handleSendMessage()} className="w-8 h-8 rounded-xl bg-[#c2e7ff] text-[#001d35] border-0 flex items-center justify-center font-bold text-xs hover:bg-[#b3ddf7] transition-all cursor-pointer">➤</button>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}