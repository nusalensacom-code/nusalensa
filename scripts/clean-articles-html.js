const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function stripHtml(text) {
  if (!text) return '';
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/<[a-z0-9_-]+[^>]*$/gi, ' ')
    .replace(/<[^>]*$/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log('>>> Checking articles for raw HTML in excerpt, content, or seoDescription...');
  const articles = await prisma.article.findMany();
  let updatedCount = 0;

  for (const article of articles) {
    let needsUpdate = false;
    let newExcerpt = article.excerpt;
    let newContent = article.content;
    let newSeoDescription = article.seoDescription;

    if (newExcerpt && (newExcerpt.includes('<img') || newExcerpt.includes('&lt;') || newExcerpt.includes('<'))) {
      newExcerpt = stripHtml(newExcerpt);
      if (!newExcerpt || newExcerpt.length < 10) {
        newExcerpt = `Comprehensive technical analysis and hardware specifications for ${article.title}.`;
      }
      needsUpdate = true;
    }

    if (newSeoDescription && (newSeoDescription.includes('<img') || newSeoDescription.includes('&lt;') || newSeoDescription.includes('<'))) {
      newSeoDescription = stripHtml(newSeoDescription).slice(0, 160);
      if (!newSeoDescription || newSeoDescription.length < 10) {
        newSeoDescription = `Discover full specifications, pricing, and editorial review for ${article.title}.`;
      }
      needsUpdate = true;
    }

    if (newContent && (newContent.includes('<img src="https://fdn.gsmarena.com') || newContent.includes('&lt;img'))) {
      // Clean raw img tags from markdown content while preserving valid markdown
      newContent = newContent
        .replace(/&lt;img[\s\S]*?&gt;/gi, '')
        .replace(/<img[\s\S]*?>/gi, '')
        .replace(/<img[\s\S]*$/gi, '')
        .trim();
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.article.update({
        where: { id: article.id },
        data: {
          excerpt: newExcerpt,
          content: newContent,
          seoDescription: newSeoDescription,
        },
      });
      console.log(`[CLEANED #${article.id}] "${article.title}"`);
      console.log(`   New Excerpt: ${newExcerpt.slice(0, 100)}...`);
      updatedCount++;
    }
  }

  console.log(`>>> Done. Cleaned ${updatedCount} articles.`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

