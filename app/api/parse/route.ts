import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface ParsedProfile {
  name: string;
  role: string;
  experience_years: number;
  skills: string[];
  email: string;
  summary: string;
  profile_score: number;
}

export async function POST(request: NextRequest) {
  try {
    // Read incoming multi-part form data from the client request
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No profile data block received' }, { status: 400 });
    }

    const filename = file.name;
    const cleanName = filename.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');

    // Simulated network processing latency lag
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const systemPayload = {
      name: cleanName || "Sivaprakash S",
      role: "Senior Automation Test Engineer",
      experience_years: 5,
      skills: ["Java", "Selenium", "Playwright", "Cypress", "SQL", "Git", "API Testing", "CI/CD"],
      email: "developer.siva@gmail.com",
      summary: "Senior QA professional specializing in establishing high-reliability automation testing frameworks and continuous test cycles.",
      profile_score: 92
    };

    // Push the compiled data parameters safely into your cloud database table
    const { data, error } = await supabase
      .from('profiles')
      .insert([systemPayload])
      .select()
      .single();

    if (error) {
      console.error('Supabase Data Insertion Exception:', error);
      return NextResponse.json({ error: 'Database storage transmission failed', details: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fatal Unhandled Server Route Exception:', error);
    return NextResponse.json({ error: 'Internal pipeline processing failure', details: error.message }, { status: 500 });
  }
}