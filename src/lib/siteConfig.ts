/**
 * NusaLensa - Global Technology & Smartphone Platform Configuration
 */

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'NusaLensa',
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || 'Global Technology & Smartphone Intelligence',
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'NusaLensa is an independent global technology publication providing in-depth smartphone specifications, device comparisons, buying guides, tech news, and expert analysis.',
  url: 'https://nusalensa.com',
  logoText: 'NUSALENSA',
  logoSuffix: '.COM',
  locale: 'en_US',
  language: 'en',
  publisher: {
    name: 'NusaLensa Media Global',
    founder: 'NusaLensa Editorial Board',
    address: '1201 3rd Ave, Suite 2200, Seattle, WA 98101, United States',
    email: 'editorial@nusalensa.com',
    pressRegistration: 'International Technology Press Association #ITPA-2026-NL',
    phone: '+1 (206) 555-0199',
  },
  socials: {
    twitter: 'https://twitter.com/nusalensa',
    facebook: 'https://facebook.com/nusalensa',
    instagram: 'https://instagram.com/nusalensa',
    youtube: 'https://youtube.com/@nusalensa',
    tiktok: 'https://tiktok.com/@nusalensa',
    telegram: 'https://t.me/nusalensa',
  },
  monetization: {
    adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-6500451499082051',
    showAds: true,
  },
  analytics: {
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || '',
    googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  footerLinks: [
    { title: 'About Us', href: '/about' },
    { title: 'Editorial Policy', href: '/editorial-policy' },
    { title: 'Contact & Newsroom', href: '/contact' },
    { title: 'Corrections Policy', href: '/corrections-policy' },
    { title: 'Advertising Disclosure', href: '/advertising-disclosure' },
    { title: 'Privacy Policy', href: '/privacy-policy' },
    { title: 'Terms of Service', href: '/terms' },
    { title: 'Sitemap', href: '/sitemap.xml' },
    { title: 'RSS Feed', href: '/rss.xml' },
  ],
};

export type SiteConfig = typeof siteConfig;
