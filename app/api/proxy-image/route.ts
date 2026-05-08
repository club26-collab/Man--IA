import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get('prompt');

  if (!prompt) {
    return new NextResponse('Missing prompt', { status: 400 });
  }

  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=720&height=900&nologo=true&model=flux`;

  try {
    const response = await fetch(pollinationsUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error('Pollinations API error:', response.status, response.statusText);
      return new NextResponse('Image generation failed', { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Proxy image error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
