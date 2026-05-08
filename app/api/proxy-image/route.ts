import { NextRequest, NextResponse } from 'next/server';

const MAX_RETRIES = 2;
const TIMEOUT = 60000;
const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';

async function tryFetch(prompt: string, attempt: number): Promise<Response> {
  const url = `${POLLINATIONS_BASE}/${encodeURIComponent(prompt)}?width=720&height=900&nologo=true&model=flux`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/jpeg,image/png,*/*',
      },
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get('prompt');

  if (!prompt) {
    return new NextResponse('Missing prompt', { status: 400 });
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await tryFetch(prompt, attempt);
      const buffer = await response.arrayBuffer();

      if (!response.ok || buffer.byteLength < 100) {
        console.warn(`Pollinations attempt ${attempt + 1} failed:`, response.status, `size: ${buffer.byteLength}`);
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
          continue;
        }
        return new NextResponse('Image generation failed', { status: response.status });
      }

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Proxy image error (attempt ${attempt + 1}):`, msg);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      return new NextResponse('Image generation failed', { status: 500 });
    }
  }
}
