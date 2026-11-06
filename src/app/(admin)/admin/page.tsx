"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loginAdminAction } from "@/app/actions/auth";
import { Lock, ShieldAlert, ArrowRight, CheckCircle2 } from "@/components/icons";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAdminAction(formData);

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/write");
        router.refresh();
      }, 500);
    } else {
      setError(result.error || "Authentication failed");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="border border-border bg-card p-6 font-mono text-xs space-y-5">
        <div className="space-y-1">
          <div className="text-muted-foreground font-semibold">
            ~/admin/unlock
          </div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Lock className="size-4 text-muted-foreground" />
            <span># Admin Authorization</span>
          </h1>
          <p className="text-muted-foreground text-[12px] leading-relaxed">
            Enter your secret administrative passkey to write, edit, or manage blog publications.
          </p>
        </div>

        {error && (
          <div className="p-2.5 border border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2">
            <ShieldAlert className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-2.5 border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Passkey verified. Redirecting to write studio...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="passkey"
              className="block font-semibold text-foreground text-[11px] uppercase tracking-wider"
            >
              ADMIN_SECRET_KEY
            </label>
            <input
              id="passkey"
              name="passkey"
              type="password"
              required
              autoFocus
              placeholder="Enter passkey..."
              className="w-full px-3 py-2 border border-border bg-background text-foreground text-xs font-mono outline-none focus:border-ring transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full justify-center text-xs font-bold border border-border bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-none cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span>[Authenticate</span>
                <ArrowRight className="size-3" />
                <span>]</span>
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
