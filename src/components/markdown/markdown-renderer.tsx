"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import "highlight.js/styles/github-dark.css";
import { Check, Copy } from "@/components/icons";

interface MarkdownRendererProps {
  content: string;
}

// Extend sanitize schema to permit responsive iframe embeds for YouTube
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "iframe", "video", "source"],
  attributes: {
    ...defaultSchema.attributes,
    iframe: [
      "src",
      "width",
      "height",
      "title",
      "frameBorder",
      "allow",
      "allowFullScreen",
      "className",
    ],
    video: ["src", "controls", "width", "height", "className", "poster"],
    source: ["src", "type"],
    code: [...(defaultSchema.attributes?.code || []), "className"],
    span: [...(defaultSchema.attributes?.span || []), "className"],
  },
};

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  const text = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 border border-border bg-[#0d1117] text-[#e6edf3] font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40 bg-[#161b22] text-[11px] text-muted-foreground select-none">
        <span className="uppercase tracking-wider">
          {className?.replace("language-", "") || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 overflow-x-auto leading-relaxed">
        <code className={className}>{children}</code>
      </div>
    </div>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body font-mono text-xs sm:text-sm leading-relaxed space-y-4 text-foreground/90">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypeSanitize, sanitizeSchema],
          [rehypeHighlight, { ignoreMissing: true }],
        ]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className="text-xl sm:text-2xl font-extrabold text-foreground border-b-2 border-border pb-2 mt-6 mb-3 tracking-tight"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="text-lg sm:text-xl font-bold text-foreground border-b border-border pb-1.5 mt-5 mb-2.5 tracking-tight"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="text-base sm:text-lg font-bold text-foreground mt-4 mb-2 tracking-tight"
              {...props}
            />
          ),
          p: ({ ...props }) => <p className="leading-relaxed my-2.5" {...props} />,
          ul: ({ ...props }) => (
            <ul className="list-disc list-inside space-y-1 my-3 pl-2" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal list-inside space-y-1 my-3 pl-2" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-border pl-4 py-1 italic text-muted-foreground my-3 bg-muted/30"
              {...props}
            />
          ),
          a: ({ href, children, ...props }) => {
            // Check for YouTube embed link in standalone anchor
            const isYouTube = href?.includes("youtube.com/watch") || href?.includes("youtu.be/");
            if (isYouTube && href) {
              const videoId = href.includes("v=")
                ? href.split("v=")[1]?.split("&")[0]
                : href.split("youtu.be/")[1]?.split("?")[0];

              if (videoId) {
                return (
                  <div className="my-5 aspect-video w-full border border-border bg-black overflow-hidden">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                      title="YouTube video embed"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                );
              }
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
                {...props}
              >
                {children}
              </a>
            );
          },
          table: ({ ...props }) => (
            <div className="my-4 overflow-x-auto border border-border">
              <table className="w-full text-left text-xs border-collapse" {...props} />
            </div>
          ),
          thead: ({ ...props }) => <thead className="bg-muted border-b border-border" {...props} />,
          th: ({ ...props }) => (
            <th className="p-2.5 font-bold text-foreground border-r border-border last:border-r-0" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="p-2.5 border-t border-border border-r border-border last:border-r-0" {...props} />
          ),
          // Code fence vs inline code
          code: ({ className, children, ...props }) => {
            const isCodeBlock = /language-(\w+)/.test(className || "");
            if (isCodeBlock) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }
            return (
              <code
                className="px-1.5 py-0.5 border border-border bg-muted/80 text-foreground font-mono text-[0.9em]"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
