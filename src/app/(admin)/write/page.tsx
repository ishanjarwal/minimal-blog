import * as React from "react";
import { Metadata } from "next";
import { DevtoEditor } from "@/components/editor/devto-editor";

export const metadata: Metadata = {
  title: "Write New Post | Admin Studio",
  description: "Dev.to-style Markdown editor for authoring blog posts",
};

export default function WritePage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground font-mono font-semibold">
            ~/studio/create
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-mono">
            # Write New Article
          </h1>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          [Markdown Mode]
        </span>
      </div>

      <DevtoEditor />
    </div>
  );
}
