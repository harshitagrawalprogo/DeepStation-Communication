"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { LogoIcon } from "@/components/logo";

export default function MainPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Automatically redirect to the default workspace
    router.replace("/deepstation-rit-internal-comms");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,rgba(13,148,136,0.15),transparent_60%),linear-gradient(180deg,#08110f_0%,#0b1514_100%)] px-6">
      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-5 right-5 rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 backdrop-blur transition hover:text-slate-100"
        aria-label="Toggle theme"
      >
        {mounted ? (
          theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
        ) : (
          <div className="h-4 w-4" />
        )}
      </button>

      {/* Centre card */}
      <div className="flex flex-col items-center text-center max-w-sm w-full space-y-8">
        {/* Logo */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 shadow-xl shadow-teal-900/20 backdrop-blur">
          <LogoIcon size={36} />
        </div>

        {/* Wordmark */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-400/70">
            DeepStation · RIT
          </p>
          <h1 className="text-3xl font-semibold text-slate-50 leading-snug">
            Core Communication
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Connecting securely...
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="w-full flex items-center justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-500" />
        </div>

        {/* Subtle footer */}
        <p className="text-xs text-slate-600">
          Internal use only · DeepStation RIT
        </p>
      </div>
    </div>
  );
}
