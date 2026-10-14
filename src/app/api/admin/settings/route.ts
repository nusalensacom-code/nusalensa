import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';
import { siteConfig } from '@/lib/siteConfig';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: siteConfig.name || 'NusaLensa',
  site_tagline: siteConfig.tagline || 'Global Smartphone Specs, Comparisons & Technology Reviews',
  site_description: siteConfig.description || '',
  site_logo: '/logo.svg',
  site_favicon: '/favicon.ico',
  seo_title_format: '%s - NusaLensa',
  seo_keywords: 'smartphone specifications, mobile comparison, tech news, reviews, buying guides, hardware benchmarks',
  seo_og_image: '/images/og-default.jpg',
  adsense_client_id: siteConfig.monetization?.adsenseClientId || '',
  adsense_auto_ads: 'true',
  adsense_header_slot: '',
  adsense_in_article_slot: '',
  adsense_sidebar_slot: '',
  ga_id: siteConfig.analytics?.gaMeasurementId || '',
  gsc_verification: siteConfig.analytics?.googleSiteVerification || '',
  contact_email: siteConfig.publisher?.email || 'newsroom@nusalensa.com',
  contact_phone: siteConfig.publisher?.phone || '+1 (415) 555-0199',
  contact_address: siteConfig.publisher?.address || 'San Francisco, CA, United States',
  social_twitter: siteConfig.socials?.twitter || '',
  social_facebook: siteConfig.socials?.facebook || '',
  social_instagram: siteConfig.socials?.instagram || '',
  social_youtube: siteConfig.socials?.youtube || '',
  social_linkedin: '',
  social_tiktok: siteConfig.socials?.tiktok || '',
};

// GET: All settings
export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const dbSettings = await prisma.setting.findMany();
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };

    dbSettings.forEach((s) => {
      if (s.value !== undefined) {
        result[s.key] = s.value;
      }
    });

    return NextResponse.json({ settings: result });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to load settings' }, { status: 500 });
  }
}

// POST: Save settings
export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN']);
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

    return NextResponse.json({ success: true, message: 'Settings saved successfully!' });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 });
  }
}

