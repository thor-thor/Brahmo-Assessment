import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { formInput } = await request.json();
    const INDIAN_KANOON_API_KEY = process.env.INDIAN_KANOON_API_KEY!;
    const INDIAN_KANOON_BASE_URL = 'https://api.indiankanoon.org';

    const response = await fetch(`${INDIAN_KANOON_BASE_URL}/search/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${INDIAN_KANOON_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ formInput })
    });

    if (!response.ok) {
      throw new Error(`Indian Kanoon API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in indian-kanoon API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}