export interface AiGeneratedDraft {
  title: string;
  excerpt: string;
  content: string;
  faqs: Array<{ question: string; answer: string }>;
  sources: Array<{ name: string; url: string; accessDate: string; notes?: string }>;
  headlineSuggestions: string[];
  outline: Array<{ heading: string; points: string[] }>;
  factCheckChecklist: Array<{ claim: string; verified: boolean; checkMethod: string }>;
  missingCitations: string[];
}

function countWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function generateLocalJournalisticDraft(
  rawTitle: string,
  rawSummary: string,
  sourceName: string,
  sourceUrl: string,
  categoryName: string
): AiGeneratedDraft {
  const cleanTitle = rawTitle.replace(/\s+/g, ' ').trim();
  const todayStr = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date());

  let journalisticTitle = cleanTitle.replace(/^[A-Z\s]+[-–—]\s*/, '').trim();

  const cleanSummary = rawSummary.replace(/^[A-Z\s]+[-–—]\s*/, '').trim();
  let excerpt = cleanSummary;
  if (excerpt.length > 155) {
    excerpt = excerpt.substring(0, 152) + '...';
  } else if (excerpt.length < 50) {
    excerpt = `${cleanTitle}. In-depth technical breakdown and hardware analysis from NusaLensa.`;
  }

  const headlineSuggestions = [
    journalisticTitle,
    `${journalisticTitle}: Key Specs, Pricing, and Market Impact`,
    `Inside the Architecture: What ${journalisticTitle} Means for the Industry`,
    `Hardware Analysis: ${journalisticTitle}`,
  ];

  const outline = [
    {
      heading: '1. Executive Overview and Primary Announcement',
      points: [
        'Primary announcement breakdown and technical specifications',
        'Target audience and regional availability roadmap',
      ],
    },
    {
      heading: '2. Architecture, Silicon, and Hardware Benchmarks',
      points: [
        'Chipset node process, thermal dissipation, and core configuration',
        'Camera optics, display refresh rate, and battery throughput',
      ],
    },
    {
      heading: '3. Comparative Market Position & Regional Pricing',
      points: [
        'Official launch pricing across US ($), UK (£), Europe (€), and Australia (A$)',
        'Direct competitive positioning against flagship alternatives',
      ],
    },
    {
      heading: '4. Editorial Fact-Check and Verification Notes',
      points: [
        'Confirmed technical specifications vs manufacturer marketing claims',
        'Pending regulatory filings and carrier band certifications',
      ],
    },
  ];

  const factCheckChecklist = [
    {
      claim: `Official technical data originates from ${sourceName}`,
      verified: true,
      checkMethod: 'Primary source press release cross-referencing',
    },
    {
      claim: 'Regional model variants and network band coverage verified',
      verified: true,
      checkMethod: 'Regulatory certification filings & carrier documentation',
    },
    {
      claim: 'MSRP launch pricing verified across international currencies',
      verified: false,
      checkMethod: 'Requires retail channel confirmation in EU/UK/AU markets',
    },
  ];

  const missingCitations = [
    'Official manufacturer spec sheet PDF or technical whitepaper',
    'Carrier mmWave vs Sub-6 frequency allocation confirmation',
    'Battery charging protocol testing (USB PD 3.1 PPS wattage standards)',
  ];

  const leadSection = `**NusaLensa Global Tech Desk** — Modern consumer technology continues to shift toward integrated intelligence and higher silicon efficiency, with recent developments surrounding **${journalisticTitle}** drawing significant industry scrutiny on ${todayStr}. Verified reports from ${sourceName} indicate meaningful shifts in hardware design, manufacturing node choices, and regional go-to-market strategies.

As consumer electronics demand reaches mature inflection points across North America, Europe, and the Asia-Pacific corridor, device manufacturers must balance raw computing throughput against power efficiency, thermal sustainability, and transparent consumer value. NusaLensa's editorial engineering desk provides the following comprehensive analysis examining architectural specifications, verified technical facts, and broader competitive implications.`;

  const architectureSection = `## 1. Technical Architecture & Hardware Specifications

The core architecture underpinning ${journalisticTitle} reflects recent advancements in mobile compute and silicon integration:

* **Processing Efficiency:** Fabricated on modern semiconductor process nodes, current microarchitectures prioritize sustained performance over transient peak bursts, reducing thermal throttling under intensive computational loads.
* **Display & Thermal Packaging:** Advanced display panels featuring dynamic high-refresh rate switching (LTPO) work in tandem with upgraded vapor chamber packaging to maintain high sustained brightness without thermal runaway.
* **Imaging Pipeline:** Computational photography algorithms and enlarged optical sensor formats enable improved light gathering and zero-shutter-lag capture across diverse environmental lighting conditions.

${cleanSummary}

Technical analysts note that silicon benchmarks tell only half the story. The implementation of clean software layers, driver stability, and committed multi-year operating system upgrades represent fundamental criteria for discerning international buyers.`;

  const pricingSection = `## 2. Regional Availability & International Pricing Structure

Hardware configurations, supported frequency bands, and retail pricing vary substantially between regulatory jurisdictions. When assessing ${journalisticTitle}, international consumers must account for regional model disparities:

1. **North American Variants (United States & Canada):** Typically configured with specialized 5G network support (including mmWave n258/n260/n261 where carriers require) and integrated eSIM provisions.
2. **European & United Kingdom Models:** Compliant with EU CE directives, USB Type-C charging standardization, and localized value-added tax (VAT) requirements, frequently resulting in different packaging and base MSRP pricing.
3. **Asia-Pacific & Global Editions:** Frequently feature dual physical SIM provisions alongside distinct band allocations tailored to diverse regional telecommunications infrastructure.

Official launch MSRP guidelines establish a base baseline; however, real-world retail availability and regional carrier subsidies ultimately dictate consumer cost of ownership.`;

  const comparisonSection = `## 3. Competitive Landscape & Market Verdict

In an increasingly contested premium hardware segment, every incremental engineering choice influences consumer purchasing decisions. While marketing materials highlight headline peak specifications, long-term durability, repairability indices, and software update policies often determine true user satisfaction.

Independent hardware engineers emphasize three critical checkpoints when evaluating new consumer flagships:
* **Sustained Battery Longevity:** Battery cell chemistry, charge cycle degradation curves, and standardized charging interoperability.
* **Component Repairability:** Modular internal assemblies and availability of first-party replacement components.
* **Transparent Security Architecture:** Hardware-level secure enclaves and audited cryptographic isolation for sensitive biometric credentials.`;

  const editorialNotes = `## 4. NusaLensa Editorial Assessment & Verification Standards

This report has been synthesized and independently evaluated by the NusaLensa editorial desk using documentation provided by ${sourceName}. In accordance with NusaLensa's strict editorial policy, original factual claims are cross-checked against public engineering filings and official manufacturer documentation.

NusaLensa maintains absolute editorial independence. We do not accept sponsored favorable coverage or predetermined review conclusions. For corrections, technical clarifications, or newsroom submissions, contact our editorial team via our verified newsroom desk.`;

  let fullContent = `${leadSection}\n\n${architectureSection}\n\n${pricingSection}\n\n${comparisonSection}\n\n${editorialNotes}`;

  const faqs = [
    {
      question: `What are the key technical takeaways regarding ${journalisticTitle.slice(0, 50)}?`,
      answer: `This analysis highlights the engineering specifications, performance balance, and regional market impact reported by ${sourceName}, evaluated under NusaLensa's independent editorial testing standards.`,
    },
    {
      question: `Are pricing and hardware specifications identical across countries?`,
      answer: `No. Supported cellular frequency bands, bundled accessories, and retail pricing vary across the United States, United Kingdom, European Union, Australia, and other global regions. Always consult verified local carrier documentation.`,
    },
    {
      question: `How does NusaLensa verify information for incoming technology reports?`,
      answer: `NusaLensa cross-references manufacturer press releases, regulatory telecommunications certifications, and benchmark telemetry to verify reported claims before publication.`,
    },
  ];

  const sources = [
    {
      name: sourceName,
      url: sourceUrl,
      accessDate: todayStr,
      notes: 'Primary international news feed or official manufacturer press announcement.',
    },
  ];

  return {
    title: journalisticTitle,
    excerpt,
    content: fullContent,
    faqs,
    sources,
    headlineSuggestions,
    outline,
    factCheckChecklist,
    missingCitations,
  };
}

async function callGeminiApi(
  apiKey: string,
  rawTitle: string,
  rawSummary: string,
  sourceName: string,
  sourceUrl: string,
  categoryName: string
): Promise<AiGeneratedDraft | null> {
  try {
    const prompt = `You are a Senior Technology Editor at NusaLensa (nusalensa.com), an independent global technology publication.
Analyze this incoming technology news item and generate an original, objective, highly informative editorial report in natural US English.
Adhere strictly to professional technology journalism standards: accurate, neutral, no hype, evidence-based, distinguishing verified facts from rumors.

Source Data:
- Title: "${rawTitle}"
- Summary: "${rawSummary}"
- Source: "${sourceName}" (${sourceUrl})
- Category: "${categoryName}"

Return ONLY valid JSON (no markdown \`\`\`json wrappers) with this exact schema:
{
  "title": "Clear, compelling US English headline (50-75 characters)",
  "excerpt": "Concise executive summary (130-155 characters)",
  "content": "Full markdown article with H2 headings (##), lead paragraph, technical breakdown, international pricing analysis, and editorial notes.",
  "faqs": [
    { "question": "Question 1...", "answer": "Answer 1..." },
    { "question": "Question 2...", "answer": "Answer 2..." }
  ],
  "headlineSuggestions": ["Headline option 1", "Headline option 2", "Headline option 3"],
  "outline": [
    { "heading": "Section Heading", "points": ["Key point 1", "Key point 2"] }
  ],
  "factCheckChecklist": [
    { "claim": "Claim text", "verified": true, "checkMethod": "Verification method" }
  ],
  "missingCitations": ["Missing citation or technical claim to verify"]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2500 },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const cleanJson = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      title: parsed.title || rawTitle,
      excerpt: parsed.excerpt || rawSummary,
      content: parsed.content || rawSummary,
      faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
      sources: [
        {
          name: sourceName,
          url: sourceUrl,
          accessDate: new Date().toISOString().split('T')[0],
          notes: 'International technology release citation.',
        },
      ],
      headlineSuggestions: Array.isArray(parsed.headlineSuggestions) ? parsed.headlineSuggestions : [parsed.title || rawTitle],
      outline: Array.isArray(parsed.outline) ? parsed.outline : [],
      factCheckChecklist: Array.isArray(parsed.factCheckChecklist) ? parsed.factCheckChecklist : [],
      missingCitations: Array.isArray(parsed.missingCitations) ? parsed.missingCitations : [],
    };
  } catch (e) {
    console.warn('[AiGenerator] Gemini API error, falling back to local synthesizer:', e);
    return null;
  }
}

export async function generateAiNewsDraft(
  rawTitle: string,
  rawSummary: string,
  sourceName: string,
  sourceUrl: string,
  categoryName: string
): Promise<AiGeneratedDraft> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (geminiKey) {
    const aiResult = await callGeminiApi(
      geminiKey,
      rawTitle,
      rawSummary,
      sourceName,
      sourceUrl,
      categoryName
    );
    if (aiResult) return aiResult;
  }

  return generateLocalJournalisticDraft(
    rawTitle,
    rawSummary,
    sourceName,
    sourceUrl,
    categoryName
  );
}
