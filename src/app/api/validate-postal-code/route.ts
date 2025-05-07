import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get('postcode');

  if (!postcode) {
    return NextResponse.json(
      { error: 'Postcode parameter is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    
    return NextResponse.json({
      postcode: postcode,
      isValid: data.result,
      ...(data.result && {
        details: `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`
      })
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to validate postcode', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}