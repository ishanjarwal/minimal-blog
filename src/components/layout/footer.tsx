"use client";

import * as React from "react";
import { siteConfig } from "@/lib/site-config";
import { ArrowUp, GithubIcon, LinkedinIcon, Globe, Rss } from "@/components/icons";

export function Footer() {
  const { author } = siteConfig;

  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full mt-auto pt-12 pb-12 font-mono text-xs select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="border-t-2 border-border pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-muted-foreground">
          <div className="space-y-1">
            <p className="text-foreground font-semibold whitespace-nowrap">
              &copy; 2026 {author.name}. All rights reserved.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Built with Next.js, TypeScript &amp; Tailwind CSS. Rendered with plain-text Markdown semantics.
            </p>
          </div>

          {/* Links: 2-column grid on mobile to prevent overflow, inline flex on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 text-xs w-full sm:w-auto">
            <a
              href={author.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-semibold whitespace-nowrap"
            >
              <GithubIcon className="size-3.5 shrink-0" />
              <span>[GitHub]</span>
            </a>

            <span className="hidden sm:inline-block text-border select-none">|</span>

            <a
              href={author.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-semibold whitespace-nowrap"
            >
              <LinkedinIcon className="size-3.5 shrink-0" />
              <span>[LinkedIn]</span>
            </a>

            <span className="hidden sm:inline-block text-border select-none">|</span>

            <a
              href={author.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-semibold whitespace-nowrap"
            >
              <Globe className="size-3.5 shrink-0" />
              <span>[Portfolio]</span>
            </a>

            <span className="hidden sm:inline-block text-border select-none">|</span>

            <a
              href="/rss.xml"
              target="_blank"
              rel="alternate"
              type="application/rss+xml"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-semibold whitespace-nowrap"
            >
              <Rss className="size-3.5 shrink-0" />
              <span>[RSS]</span>
            </a>

            <span className="hidden sm:inline-block text-border select-none">|</span>

            <a
              href="#top"
              onClick={scrollToTop}
              className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-bold whitespace-nowrap"
            >
              <span>[Back to top</span>
              <ArrowUp className="size-3" />
              <span>]</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
