import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/lib/site-config";
import { getWebSiteJsonLd, getPersonJsonLd } from "@/lib/jsonld";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#010409" },
  ],
  width: "device-width",
  initialScale: 1,
};

const defaultOgImage = `${siteConfig.blog.url}/api/og?title=${encodeURIComponent(
  siteConfig.blog.name
)}&tag=Engineering&description=${encodeURIComponent(siteConfig.blog.description)}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.blog.url),
  title: {
    default: `${siteConfig.author.name} | Blog`,
    template: `%s | ${siteConfig.author.name}'s Blog`,
  },
  description: siteConfig.blog.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.portfolioUrl }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  alternates: {
    canonical: siteConfig.blog.url,
    types: {
      "application/rss+xml": `${siteConfig.blog.url}/rss.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: `${siteConfig.author.name} | Blog`,
    description: siteConfig.blog.description,
    url: siteConfig.blog.url,
    siteName: `${siteConfig.author.name}'s Blog`,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: siteConfig.blog.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.author.name} | Blog`,
    description: siteConfig.blog.description,
    creator: `@${siteConfig.author.handle}`,
    images: [defaultOgImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = getWebSiteJsonLd();
  const personJsonLd = getPersonJsonLd();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistMono.variable} font-mono`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground flex flex-col font-mono text-[14px] leading-relaxed antialiased"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <div id="top" />
          <Header />
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
