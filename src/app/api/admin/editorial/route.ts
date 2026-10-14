import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const DEFAULT_EDITORIAL = {
  policy_editorial: `## NusaLensa Editorial Guidelines

NusaLensa is committed to delivering independent, accurate, evidence-based, and objective technology coverage, smartphone specifications, hardware reviews, and buying guides.

### 1. Independence & Objectivity
All reviews, benchmarks, comparisons, and news coverage are conducted independently. Editorial judgments and lab evaluations are free from influence by hardware manufacturers, carrier partners, or advertisers.

### 2. Fact-Checking & Lab Benchmarks
We prioritize verifiable data and reproducible lab metrics over marketing claims. All technical specifications are validated against official engineering whitepapers, regulatory filings (FCC, CE), and hands-on lab measurements.`,

  policy_correction: `## Corrections and Updates Policy

NusaLensa is dedicated to journalistic accuracy and full transparency when correcting errors or updating hardware telemetry.

### Correction Procedure:
1. Readers and industry stakeholders may report factual discrepancies to corrections@nusalensa.com.
2. The editorial desk investigates primary data within 24 hours.
3. When an error is confirmed, the article is updated promptly with an editorial correction notice documenting the timestamp and change details.`,

  policy_factcheck: `## Fact-Checking Methodology

To maintain rigorous E-E-A-T standards and combat misinformation in consumer technology reporting, NusaLensa enforces strict verification standards:

- **Primary Source Verification:** Prioritize first-party documentation, engineering whitepapers, silicon design specifications, and official manufacturer newsrooms.
- **Hardware Benchmarks:** Display brightness, color accuracy, battery life endurance curves, and synthetic thermal throttling metrics are measured in controlled lab conditions.
- **Clear Distinction of Content:** Rumors, leaks, editorial analysis, and confirmed product launches are distinctly labeled across all headlines and article headers.`,

  policy_disclaimer: `## Editorial Disclosures & Affiliate Transparency

All content published on NusaLensa is provided for educational and consumer informational purposes.

- **Affiliate Links:** When readers purchase through affiliate retail links, NusaLensa may earn an affiliate commission at no extra cost to the buyer. This never influences our editorial ratings or hardware recommendations.
- **Intellectual Property:** Product names, logos, and hardware trademarks belong to their respective manufacturers. NusaLensa content is protected under global copyright law.`,
};

// GET: Get all editorial policies
export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const keys = Object.keys(DEFAULT_EDITORIAL);
    const settings = await prisma.setting.findMany({
      where: { key: { in: keys } },
    });

    const result: Record<string, string> = { ...DEFAULT_EDITORIAL };
    settings.forEach((s) => {
      if (s.value) result[s.key] = s.value;
    });

    return NextResponse.json({ policies: result });
  } catch (error: any) {
    console.error('Error fetching editorial policies:', error);
    return NextResponse.json({ error: error.message || 'Failed to load editorial policies' }, { status: 500 });
  }
}

// POST: Save editorial policies
export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();

    for (const [key, val] of Object.entries(body)) {
      if (typeof val === 'string') {
        await prisma.setting.upsert({
          where: { key },
          update: { value: val },
          create: { key, value: val },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Editorial policies saved successfully!' });
  } catch (error: any) {
    console.error('Error saving editorial policies:', error);
    return NextResponse.json({ error: error.message || 'Failed to save editorial policies' }, { status: 500 });
  }
}

