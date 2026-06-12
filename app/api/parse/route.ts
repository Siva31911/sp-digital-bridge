import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

interface ParsedProfile {
  name: string;
  role: string;
  experience_years: number;
  skills: string[];
  email: string;
  summary: string;
  profile_score: number;
}

// Initialize the Gemini AI Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  console.log("--- CLOUD ENV CHECK ---");
  console.log("Has Gemini Key:", !!process.env.GEMINI_API_KEY);
  console.log("Has Supabase URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("-----------------------");

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No profile data block received' }, { status: 400 });
    }

    // 1. Convert the uploaded file into a Base64 string so Gemini can read it
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // 2. Instruct Gemini exactly how to read and output the data
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const promptText = `
      You are an expert technical recruiter AI. Analyze this resume document and extract the candidate's information.
      Return ONLY a raw JSON object with no markdown formatting, no backticks, and no extra text. 
      Use this exact JSON structure:
      {
        "name": "Candidate Full Name",
        "role": "Current or primary job title",
        "experience_years": Total years of experience as a simple integer number,
        "skills": ["Java", "Selenium", "Playwright", "..."],
        "email": "candidate@email.com",
        "summary": "Write a powerful 2-sentence professional summary based on their experience.",
        "profile_score": Calculate a score from 1 to 100 based on the quality and technical depth of this resume.
      }
    `;

    // 3. Send the document and instructions to Gemini
    const result = await model.generateContent([
      promptText,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'application/pdf', 
        },
      },
    ]);

    // 4. Clean and parse the AI's response
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json\n?|```/g, '').trim();
    const systemPayload: ParsedProfile = JSON.parse(cleanedText);

    // 5. Push the real AI-extracted data into Supabase
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