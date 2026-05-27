import { NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm-client';

export async function POST(request: Request) {
  try {
    const { query, mode } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const response = await callLLM(query, mode || 'generic');
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in /api/llm:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
