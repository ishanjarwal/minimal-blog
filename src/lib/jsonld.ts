import { siteConfig } from "@/lib/site-config";

/**
 * Clean URL builder ensuring no trailing slash ambiguities.
 */
function toAbsoluteUrl(path: string): string {
  const base = siteConfig.blog.url.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Generate Schema.org WebSite structured data.
 */
export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.blog.url}/#website`,
    name: siteConfig.blog.name,
    alternateName: "Ishan Jarwal Engineering Blog",
    url: siteConfig.blog.url,
    description: siteConfig.blog.description,
    inLanguage: "en-US",
    publisher: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: siteConfig.author.portfolioUrl,
      image: siteConfig.author.avatarUrl,
    },
  };
}

/**
 * Generate Schema.org Person structured data for the author.
 */
export function getPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteConfig.blog.url}/#author`,
    name: siteConfig.author.name,
    url: siteConfig.author.portfolioUrl,
    image: siteConfig.author.avatarUrl,
    jobTitle: siteConfig.author.title,
    sameAs: [
      siteConfig.author.githubUrl,
      siteConfig.author.linkedinUrl,
      siteConfig.author.twitterUrl,
      siteConfig.author.portfolioUrl,
    ],
  };
}

/**
 * Generate Schema.org BreadcrumbList structured data.
 */
export function getBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

interface PostJsonLdParams {
  title: string;
  shortDescription: string;
  slug: string;
  content: string;
  thumbnailUrl?: string | null;
  publishedAt?: Date | null;
  updatedAt: Date;
  tags?: string[];
}

/**
 * Generate Schema.org BlogPosting structured data for an individual article.
 */
export function getBlogPostingJsonLd(post: PostJsonLdParams) {
  const postUrl = toAbsoluteUrl(`/blog/${post.slug}`);
  const fallbackOgImage = toAbsoluteUrl(`/api/og?title=${encodeURIComponent(post.title)}`);
  const image = post.thumbnailUrl || fallbackOgImage;
  const wordCount = post.content ? post.content.split(/\s+/).filter(Boolean).length : 0;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    isPartOf: {
      "@type": "Blog",
      "@id": `${siteConfig.blog.url}/#blog`,
      name: siteConfig.blog.name,
      url: siteConfig.blog.url,
    },
    headline: post.title,
    description: post.shortDescription,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    url: postUrl,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: siteConfig.author.portfolioUrl,
      jobTitle: siteConfig.author.title,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: siteConfig.author.portfolioUrl,
      image: siteConfig.author.avatarUrl,
    },
    image: [image],
    keywords: post.tags?.join(", ") || "",
    wordCount,
    inLanguage: "en-US",
  };
}

/**
 * Generate Schema.org CollectionPage structured data for tag feeds.
 */
export function getCollectionPageJsonLd(params: {
  title: string;
  description: string;
  path: string;
  items?: Array<{ name: string; path: string }>;
}) {
  const collectionUrl = toAbsoluteUrl(params.path);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${collectionUrl}#collection`,
    name: params.title,
    description: params.description,
    url: collectionUrl,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.blog.url}/#website`,
      name: siteConfig.blog.name,
    },
    hasPart: params.items?.map((item) => ({
      "@type": "WebPage",
      name: item.name,
      url: toAbsoluteUrl(item.path),
    })),
  };
}
