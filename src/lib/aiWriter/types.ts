export type ArticleType =
  | 'BUYING_GUIDE'
  | 'REVIEW'
  | 'COMPARISON'
  | 'HOW_TO'
  | 'NEWS'
  | 'EXPLAINER'
  | 'LISTICLE'
  | 'EVERGREEN';

export type TargetAudience =
  | 'General Consumers'
  | 'Smartphone Enthusiasts'
  | 'Tech Beginners'
  | 'Professional Users';

export type TargetMarket =
  | 'United States'
  | 'United Kingdom'
  | 'Canada'
  | 'Australia'
  | 'Global';

export type WritingTone =
  | 'Professional'
  | 'Informative'
  | 'Conversational'
  | 'Analytical';

export type ResearchMode =
  | 'AI_KNOWLEDGE'
  | 'WEB_RESEARCH'
  | 'OFFICIAL_SOURCES';

export type JobStatus =
  | 'QUEUED'
  | 'RESEARCHING'
  | 'DRAFTING'
  | 'VALIDATING'
  | 'COMPLETED'
  | 'FAILED';

export interface GenerationInput {
  primaryKeyword: string;
  articleType: ArticleType;
  targetAudience: TargetAudience;
  targetMarket: TargetMarket;
  secondaryKeywords?: string[];
  targetWordCount?: number; // min 1200, default 1500, max 4000
  writingTone?: WritingTone;
  researchMode?: ResearchMode;
  referenceUrls?: string[];
  userId?: number;
}

export interface KeywordAnalysis {
  searchIntent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  mainTopic: string;
  targetAudience: string;
  subtopics: string[];
  secondaryKeywords: string[];
  userQuestions: string[];
  suggestedArticleType: ArticleType;
  contentGaps: string[];
}

export interface ResearchSourceItem {
  title: string;
  url: string;
  publisher?: string;
  snippet: string;
  accessTimestamp: string;
  isOfficial: boolean;
}

export interface OutlineSection {
  level: 'H2' | 'H3';
  heading: string;
  targetWordCount?: number;
  corePoints: string[];
  suggestedDataOrExamples?: string[];
}

export interface ArticleOutline {
  h1Title: string;
  introductionObjective: string;
  sections: OutlineSection[];
  conclusionSummary: string;
  faqTopics: string[];
}

export interface FactCheckClaim {
  claim: string;
  verified: boolean;
  sourceOrMethod: string;
  notes?: string;
}

export interface InternalLinkItem {
  title: string;
  url: string;
  type: 'article' | 'device' | 'brand';
  anchorSuggestion: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoPackage {
  seoTitle: string;
  seoDescription: string;
  suggestedSlug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  excerpt: string;
  ogTitle: string;
  ogDescription: string;
  imageAltText: string;
  categorySlug: string;
  suggestedTags: string[];
}

export interface ImagePromptPackage {
  concept: string;
  generationPrompt: string;
  aspectRatio: string;
  style: string;
}

export interface GeneratedArticleResult {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown article body
  actualWordCount: number;
  outline: ArticleOutline;
  seo: SeoPackage;
  alternativeHeadlines: string[];
  imagePrompt: ImagePromptPackage;
  faqs: FaqItem[];
  internalLinks: InternalLinkItem[];
  factCheckClaims: FactCheckClaim[];
  sources: ResearchSourceItem[];
  editorialChecklist: {
    factsChecked: boolean;
    sourcesReviewed: boolean;
    wordCountVerified: boolean;
    headlineReviewed: boolean;
    seoMetadataChecked: boolean;
    internalLinksChecked: boolean;
    imagesAuthorized: boolean;
    articlePreviewReviewed: boolean;
  };
}

