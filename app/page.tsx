'use client'; // Required for interactivity (hamburger menu state)

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 1. Placeholder AI Images (You will provide these)
// For now, I am using placeholders that look good.
const cinematicSlides = [
  {
    id: 1,
    url: '/images/ai-engineering-1.png', // Placeholder URL
    title: 'Precision Sourcing.',
    description: 'SP Digital Bridge optimizes complex technical funnels.',
  },
  // Add more slide objects here when you have images
];

export default function MarketingLandingPage() {
  // 2. State management for the Hamburger menu
  const [menuOpen, setMenuOpen] = useState(false);

  // You can select the first image as a static cinematic backdrop, 
  // or build a slideshow later. Let's start simple with a static full-screen.
  const activeSlide = cinematicSlides[0];

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">
      
      {/* 3. The Full-Screen Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dark Overlay for readability */}
        
        {/* Placeholder: Change this source when you upload your AI image */}
        {/* <Image 
          src="/images/placeholder-cinematic.jpg" // Place your AI image in the /public/images folder
          alt="Cinematic background"
          fill
          priority
          className="object-cover"
        /> */}
        
        {/* TEMPORARY GRADIENT (Until you add images) */}
        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black"/>
      </div>

      {/* 4. Minimalist Header with Hamburger Button */}
      <header className="relative z-50 flex items-center justify-between p-6 md:p-8">
        <Link href="/" className="text-3xl font-black tracking-tighter text-sky-400">
          SP Digital Bridge
        </Link>
        
        {/* The Hamburger Button (The three lines) */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="group flex h-10 w-10 flex-col justify-center space-y-1.5 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {/* Animated lines - these automatically change shape based on menuOpen state */}
          <span className={`block h-0.5 w-8 bg-white transform transition duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 w-8 bg-white transition duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-8 bg-white transform transition duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </header>

      {/* 5. Minimalist Cinematic Text (Appearing on top of the image) */}
      <div className="relative z-10 flex h-full flex-col justify-end p-8 md:p-20 pb-32">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter max-w-4xl leading-tight">
          Smarter Funnels, <br/> Faster Placements.
        </h1>
        <p className="mt-6 text-xl md:text-2xl text-zinc-300 max-w-2xl font-light">
          Leverage localized AI to parse resumes, interview candidates, and programmatically apply to engineering roles.
        </p>
      </div>

      {/* 6. The Slide-In/Overlay Menu (Revealed only when menuOpen is true) */}
      <div className={`fixed inset-0 z-40 h-screen w-full bg-black/95 transition-transform duration-500 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <nav className="flex h-full flex-col items-center justify-center space-y-8 p-10 pt-24 text-center">
          <h2 className="text-zinc-500 uppercase tracking-widest text-sm pb-6">Platform Ecosystem Features</h2>
          
          {/* Feature List (Links to dashboard sections) */}
          <Link href="/dashboard/parse" onClick={() => setMenuOpen(false)} className="group text-4xl md:text-6xl font-extrabold tracking-tighter hover:text-sky-400 transition">
            <span className="text-zinc-600 group-hover:text-sky-500 mr-2">01 /</span> Analyze Profile 📥
          </Link>
          
          <Link href="/dashboard/tracker" onClick={() => setMenuOpen(false)} className="group text-4xl md:text-6xl font-extrabold tracking-tighter hover:text-sky-400 transition">
            <span className="text-zinc-600 group-hover:text-sky-500 mr-2">02 /</span> Pipeline Tracker 📊
          </Link>
          
          <Link href="/dashboard/jobs" onClick={() => setMenuOpen(false)} className="group text-4xl md:text-6xl font-extrabold tracking-tighter hover:text-sky-400 transition">
            <span className="text-zinc-600 group-hover:text-sky-500 mr-2">03 /</span> Market Funnel Matches ⚡
          </Link>

          <Link href="/dashboard/refine" onClick={() => setMenuOpen(false)} className="group text-4xl md:text-6xl font-extrabold tracking-tighter hover:text-sky-400 transition">
            <span className="text-zinc-600 group-hover:text-sky-500 mr-2">04 /</span> Profile Refinement
          </Link>
          
          {/* Closing/Back Text */}
          <div className="pt-10">
            <p className="text-zinc-400 text-lg">Click outside or use the top button to return to the cinematic showcase.</p>
          </div>
        </nav>
      </div>
    </main>
  );
}