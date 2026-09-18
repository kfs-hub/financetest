import { NextRequest, NextResponse } from 'next/server';
import { askFinancialCopilot, FinancialContext } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, context, userApiKey } = body as {
      query: string;
      context: FinancialContext;
      userApiKey?: string;
    };

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    const answer = await askFinancialCopilot(query, context, apiKey);

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Copilot API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
