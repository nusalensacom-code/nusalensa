import { siteConfig } from './siteConfig';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Clean query strings and trailing slashes for canonical integrity
  const strippedPath = cleanPath.split('?')[0].replace(/\/+$/, '') || '/';
  return `${siteConfig.url.replace(/\/+$/, '')}${strippedPath === '/' ? '' : strippedPath}`;
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}/logo.png`,
      width: 600,
      height: 120,
    },
    sameAs: Object.values(siteConfig.socials),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.publisher.phone,
      contactType: 'editorial newsroom',
      email: siteConfig.publisher.email,
      areaServed: 'Worldwide',
      availableLanguage: ['English'],
    },
    publishingPrinciples: `${siteConfig.url}/editorial-policy`,
    correctionsPolicy: `${siteConfig.url}/corrections-policy`,
    ethicsPolicy: `${siteConfig.url}/editorial-policy`,
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    alternateName: siteConfig.tagline,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  imageAltText?: string | null;
  publishedAt: Date | string;
  updatedAt: Date | string;
  articleType?: string;
  isNews?: boolean;
  category: { name: string; slug: string };
  subcategory?: { name: string; slug: string } | null;
  author: { name: string; slug: string; bio?: string | null; avatar?: string | null };
  editor?: { name: string; slug: string; bio?: string | null; avatar?: string | null } | null;
  faqs?: Array<{ question: string; answer: string }> | null;
}) {
  const articleUrl = `${siteConfig.url}/${article.category.slug}/${article.slug}`;

  // Select appropriate Schema Type based on articleType
  let schemaType = 'Article';
  if (article.articleType === 'NEWS' || (article.articleType === undefined && article.isNews)) {
    schemaType = 'NewsArticle';
  } else if (article.articleType === 'GUIDE' || article.articleType === 'TUTORIAL') {
    schemaType = 'TechArticle';
  } else if (article.articleType === 'OPINION') {
    schemaType = 'OpinionNewsArticle';
  }

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: article.title,
    description: article.excerpt,
    image: [
      {
        '@type': 'ImageObject',
        url: article.featuredImage,
        caption: article.imageAltText || article.title,
      },
    ],
    datePublished: (() => {
      const d = new Date(article.publishedAt);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    })(),
    dateModified: (() => {
      const d = new Date(article.updatedAt);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    })(),
    inLanguage: 'en-US',
    articleSection: article.subcategory ? `${article.category.name} > ${article.subcategory.name}` : article.category.name,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: `${siteConfig.url}/author/${article.author.slug}`,
      image: article.author.avatar || undefined,
      description: article.author.bio || undefined,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
  };

  if (article.editor) {
    schema.editor = {
      '@type': 'Person',
      name: article.editor.name,
      url: `${siteConfig.url}/author/${article.editor.slug}`,
    };
  }

  // If FAQs are present, create a dual graph with FAQPage schema
  if (article.faqs && article.faqs.length > 0) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        schema,
        {
          '@type': 'FAQPage',
          mainEntity: article.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        },
      ],
    };
  }

  return schema;
}

export function generateDeviceSchema(device: {
  name: string;
  slug: string;
  featuredImage?: string | null;
  summary?: string | null;
  brand: { name: string; slug: string };
  launchPrices?: any;
  retailPrices?: any;
  rating?: number | null;
}) {
  const deviceUrl = `${siteConfig.url}/phones/${device.brand.slug}/${device.slug}`;
  
  let launchPricesObj: Record<string, any> = {};
  if (device.launchPrices) {
    launchPricesObj = typeof device.launchPrices === 'string' ? JSON.parse(device.launchPrices || '{}') : device.launchPrices;
  }
  let retailPricesObj: Record<string, any> = {};
  if (device.retailPrices) {
    retailPricesObj = typeof device.retailPrices === 'string' ? JSON.parse(device.retailPrices || '{}') : device.retailPrices;
  }

  const usdPrice = retailPricesObj?.USD || launchPricesObj?.USD;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: device.name,
    image: device.featuredImage || `${siteConfig.url}/device-placeholder.png`,
    description: device.summary || `${device.name} full specifications, global availability, and retail pricing.`,
    brand: {
      '@type': 'Brand',
      name: device.brand.name,
    },
    url: deviceUrl,
    ...(usdPrice
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: usdPrice,
            availability: 'https://schema.org/InStock',
            url: deviceUrl,
          },
        }
      : {}),
    ...(device.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: device.rating,
            bestRating: '10',
            worstRating: '1',
            ratingCount: '1',
          },
        }
      : {}),
  };
}

export function generateAuthorSchema(author: {
  name: string;
  slug: string;
  bio?: string | null;
  avatar?: string | null;
  role?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.role || 'Technology Editor',
    url: `${siteConfig.url}/author/${author.slug}`,
    image: author.avatar || undefined,
    description: author.bio || undefined,
    worksFor: {
      '@type': 'NewsMediaOrganization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function generateTopicSchema(topic: {
  name: string;
  slug: string;
  description?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Topic: #${topic.name}`,
    description: topic.description || `Verified articles and tech insights on #${topic.name}.`,
    url: `${siteConfig.url}/topic/${topic.slug}`,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}
