"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { ThemeToggle } from "./theme-toggle";
import { Menu, X, Mail, ExternalLink, PenLine } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { author, nav } = siteConfig;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-xs select-none">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 h-12 flex items-center justify-between gap-3">
        {/* Left Side: Brand Name & Thumbnail */}
        <Link
          href="/"
          className="group flex items-center gap-1.5 font-bold tracking-tight text-foreground shrink-0 whitespace-nowrap"
          aria-label={`${author.name} blog homepage`}
        >
          <Image
            src={author.avatarUrl}
            alt={`${author.name} avatar`}
            width={24}
            height={24}
            className="size-6 border border-border object-cover shrink-0"
            priority
          />
          <span className="text-muted-foreground font-mono text-xs shrink-0">
            ~/
          </span>
          <span className="font-mono text-xs sm:text-sm underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 whitespace-nowrap">
            {author.handle}
          </span>
          <span className="text-muted-foreground font-mono text-xs">/</span>
          <span className="font-mono text-xs sm:text-sm text-foreground font-bold">
            blog
          </span>
        </Link>

        {/* Right Side: Desktop Nav with Classic Blue Links */}
        <div className="hidden md:flex items-center gap-3 text-xs font-mono shrink-0 whitespace-nowrap">
          <nav className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            {nav.map((item) => {
              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 py-1 px-1 transition-colors whitespace-nowrap"
                  >
                    <span>[{item.label}]</span>
                  </a>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 py-1 px-1 transition-colors whitespace-nowrap"
                >
                  [{item.label}]
                </Link>
              );
            })}
          </nav>

          <span className="text-border select-none shrink-0">|</span>

          {/* Quick Actions & Theme Toggle */}
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <a
              href={`mailto:${author.email}`}
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 text-xs whitespace-nowrap shrink-0"
              title={`Email: ${author.email}`}
            >
              <Mail className="size-3 shrink-0" />
              <span>Email</span>
            </a>

            <span className="text-border select-none shrink-0">|</span>

            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation Trigger & Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          <ThemeToggle />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="size-8 inline-flex items-center justify-center border border-border bg-card hover:bg-muted text-foreground shrink-0 cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-4 shrink-0" />
            ) : (
              <Menu className="size-4 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 font-mono text-xs">
          <div className="text-[10px] text-muted-foreground mb-2 select-none uppercase tracking-wider">
            {"// Navigation Menu"}
          </div>
          <nav className="flex flex-col space-y-2">
            {nav.map((item) => (
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-1.5 px-2 border border-border bg-muted/40 text-blue-600 dark:text-blue-400 underline whitespace-nowrap"
                >
                  <span>[{item.label}]</span>
                  <ExternalLink className="size-3 text-muted-foreground" />
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-1.5 px-2 border border-border bg-muted/40 text-blue-600 dark:text-blue-400 underline whitespace-nowrap"
                >
                  <span>[{item.label}]</span>
                  <span className="text-muted-foreground text-[10px] no-underline">
                    {item.href}
                  </span>
                </Link>
              )
            ))}
          </nav>

          <div className="border-t border-border mt-3 pt-3">
            <div className="text-[10px] text-muted-foreground mb-2 select-none uppercase tracking-wider">
              {"// Quick Contact"}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`mailto:${author.email}`}
                className="flex items-center justify-center gap-1 py-1 px-1 border border-border text-center text-blue-600 dark:text-blue-400 underline text-[11px] whitespace-nowrap"
              >
                <Mail className="size-3 shrink-0" />
                <span>Email</span>
              </a>
              <Link
                href="/write"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1 py-1 px-1 border border-border text-center text-blue-600 dark:text-blue-400 underline text-[11px] whitespace-nowrap"
              >
                <PenLine className="size-3 shrink-0" />
                <span>[Write Post]</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
