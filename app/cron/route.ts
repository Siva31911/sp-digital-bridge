import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // 1. SECURITY LAYER: Prevent unauthorized public triggers of your automation runtime
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized automation trigger.' }, { status: 401 });
  }

  let browser;
  try {
    // 2. ACQUIRE CANDIDATE PROFILE SKILLS FROM CLOUD ENGINE
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, skills')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const candidateSkills = profile?.skills || ["Java", "Selenium", "Playwright", "Cypress", "SQL", "Git", "API Testing"];
    const profileId = profile?.id;

    // 3. LAUNCH HEADLESS BROWSER INSTANCE
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // 4. EXECUTE MARKET CRAWL
    await page.goto('https://news.ycombinator.com/jobs', { waitUntil: 'networkidle' });

    const scrapedJobs = await page.evaluate((skillsList) => {
      const rows = Array.from(document.querySelectorAll('.athing'));
      
      return rows.slice(0, 5).map((row) => {
        const titleElement = row.querySelector('.titleline a');
        const rawText = titleElement?.textContent || 'Automation Engineer';
        
        const parts = rawText.split(' is hiring a ') || rawText.split(' is looking for ');
        const company = parts[0] || 'Enterprise Node';
        const title = parts[1] || rawText;

        const textTargetBlock = rawText.toLowerCase();
        
        const matchedSkills = skillsList.filter(skill => 
          textTargetBlock.includes(skill.toLowerCase()) || 
          (skill.toLowerCase() === 'api testing' && textTargetBlock.includes('api'))
        );

        const baseMatch = 70;
        const skillWeight = skillsList.length > 0 ? (30 / skillsList.length) : 0;
        const calculatedScore = Math.min(100, Math.round(baseMatch + (matchedSkills.length * skillWeight)));

        const emojis = ['🤖', '⚡', '🌐', '🚀', '🔒'];

        return {
          company: company.trim(),
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          role: title.trim(),
          salary: 'Market Competitive',
          mode: 'Remote',
          matchScore: calculatedScore,
          status: 0, // Injected directly into 'Applied / Sourced' stage
          notes: `Auto-sourced via Cron Worker. Match Metric: ${calculatedScore}%.`
        };
      });
    }, candidateSkills);

    await browser.close();

    // 5. FILTER & INGEST HIGH-COMPATIBILITY TARGETS INTO CLOUD DATABASE
    // We only want the automation to save jobs that are actually highly relevant (> 80% match)
    const highlyCompatibleJobs = scrapedJobs.filter(job => job.matchScore >= 80);

    if (highlyCompatibleJobs.length > 0) {
      // Map out the payload to match the exact schema of your `applications` table
      const insertPayload = highlyCompatibleJobs.map(({ matchScore, ...jobData }) => ({
        ...jobData,
        user_id: profileId || null 
      }));

      const { error: dbError } = await supabase
        .from('applications')
        .insert(insertPayload);

      if (dbError) throw dbError;
    }

    return NextResponse.json({ 
      success: true, 
      scraped: scrapedJobs.length, 
      ingested: highlyCompatibleJobs.length,
      message: 'Background worker cycle completed successfully.'
    });

  } catch (error: any) {
    if (browser) await browser.close();
    console.error('Cron Execution Exception:', error);
    return NextResponse.json({ error: 'Background worker failed', details: error.message }, { status: 500 });
  }
}