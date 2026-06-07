import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { profileId, message, stage } = await request.json();

    if (!profileId) {
      return NextResponse.json({ error: 'Missing target profile identifier' }, { status: 400 });
    }

    // PULL REAL-TIME RECORD VARIABLES STRAIGHT FROM POSTGRESQL CLOUD ACCELERATORS
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile record not localized in cloud infrastructure' }, { status: 404 });
    }

    // Simulate AI algorithmic optimization latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    let aiResponse = '';
    let nextChips: string[] = [];

    // Conversational state matrix mapping to handle sequential parameter refinement
    switch (stage) {
      case 0:
        aiResponse = `Perfect, logged that salary target framework. Given your deep specialized engineering background of ${profile.experience_years} years, hitting that threshold is highly realistic. Let's lock in your placement environment conditions next: Are you targeting remote roles, hybrid operations, or strictly on-site deployments?`;
        nextChips = ['Remote 🏠', 'Hybrid 💻', 'On-site 🏢'];
        break;

      case 1:
        aiResponse = `Parameters securely locked into your pipeline. Next, let's pinpoint your industry focus. Which market sectors match your current trajectory?`;
        nextChips = ['Fintech 💸', 'SaaS 🚀', 'E-Commerce 🛍️', 'AI Labs 🧠'];
        break;

      case 2:
        aiResponse = `Sector vectors mapped successfully. Based on your advanced automation skillset including ${profile.skills.slice(0, 4).join(', ')}, your technical alignment profile is maximized. Would you like me to instantly compile a specialized, keyword-optimized Cover Letter or a high-impact Resume Professional Summary?`;
        nextChips = ['Generate Cover Letter 📄', 'Generate Professional Summary 📝'];
        break;

      case 3:
        if (message.toLowerCase().includes('letter')) {
          aiResponse = `### 📄 SYSTEM COMPILED COVER LETTER\n\n**To:** Engineering Operations & Talent Acquisition\n**Subject:** Senior Quality Assurance & Test Automation Framework Architecture\n\nDear Hiring Team,\n\nI am writing to express my strong interest in deploying scalable quality ecosystems for your organization. Backed by over ${profile.experience_years} years of professional engineering depth in manual system validation and programmatic test framework design, I specialize in building highly resilient execution pipelines utilizing ${profile.skills.join(', ')}.\n\nIn my recent release cycles, I focused heavily on expanding test runner script concurrency and establishing high-reliability automation suites. I am confident my automated testing parameters align completely with your technical standard metrics.\n\nSincerely,\n${profile.name}\n${profile.email}`;
        } else {
          aiResponse = `### 📝 OPTIMIZED PROFESSIONAL SYNOPIS SUMMARY\n\n"Highly analytical Senior Automation Test Engineer with ${profile.experience_years}+ years of professional mastery designing, building, and maintaining enterprise-grade QA testing ecosystems. Expert in implementing high-concurrency automated validation suites using ${profile.skills.slice(0, 4).join(' and ')}. Proven track record of optimizing deployment pipelines, reducing regression execution times, and securing index completeness across distributed systems."`;
        }
        nextChips = ['Export Content 💾', 'Restart Setup 🔄'];
        break;

      default:
        aiResponse = `Profile data structures are fully synchronized for ${profile.name}. Your custom career credentials vectors are operational and stored safely in your cloud database node dashboard!`;
        nextChips = [];
    }

    return NextResponse.json({ text: aiResponse, chips: nextChips });
  } catch (error: any) {
    return NextResponse.json({ error: 'AI processing lane failure', details: error.message }, { status: 500 });
  }
}