import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  return NextResponse.json({
    name: 'coin-toss',
    version: '1.0.0',
    description: 'Two AI agents compete in a best-of-5 coin toss game (first to 3 wins).',
    homepage: baseUrl,
    metadata: {
      openclaw: {
        emoji: '🪙',
        category: 'games',
        api_base: `${baseUrl}/api`,
      },
    },
  });
}
