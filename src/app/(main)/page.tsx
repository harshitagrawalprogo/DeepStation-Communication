"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  BellRing,
  Building2,
  ClipboardList,
  Moon,
  Radio,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoIcon } from "@/components/logo";

const DEFAULT_WORKSPACE_NAME = "DeepStation RIT Internal Comms";
const HAS_CONVEX =
  !!process.env.NEXT_PUBLIC_CONVEX_URL &&
  !process.env.NEXT_PUBLIC_CONVEX_URL.includes("your-project-name");

type WorkspaceSummary = {
  _id: string;
  name: string;
  customId: string;
};

const normalizeWorkspaceId = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

function MainPageWithData() {
  const workspaces = useQuery(api.workspaces.get);
  return <MainPageShell hasConvex workspaces={(workspaces as WorkspaceSummary[]) || []} />;
}

function MainPageWithoutData() {
  return <MainPageShell hasConvex={false} workspaces={[]} />;
}

function MainPageShell({
  hasConvex,
  workspaces,
}: {
  hasConvex: boolean;
  workspaces: WorkspaceSummary[];
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [joinWorkspaceId, setJoinWorkspaceId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInitializeWorkspace = async () => {
    if (!hasConvex) {
      toast.error("Configure NEXT_PUBLIC_CONVEX_URL before initializing the workspace.");
      return;
    }

    if (isCreating) return;

    const existingWorkspace = workspaces.find(
      (workspace) => workspace.name === DEFAULT_WORKSPACE_NAME
    );

    if (existingWorkspace) {
      router.push(`/${existingWorkspace.customId}`);
      return;
    }

    setIsCreating(true);

    try {
      const createWorkspace = await fetch("/api/initialize", {
        method: "POST",
      });
      const response = await createWorkspace.json();

      if (!createWorkspace.ok) {
        throw new Error(response.error || "Failed to initialize workspace");
      }

      toast.success("DeepStation RIT communications hub is ready.");
      router.push(`/${response.customId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to initialize workspace"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinWorkspace = () => {
    if (!joinWorkspaceId.trim()) {
      toast.error("Enter a workspace ID to continue.");
      return;
    }

    router.push(`/${normalizeWorkspaceId(joinWorkspaceId)}`);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(217,119,6,0.16),_transparent_28%),linear-gradient(180deg,_#f5f7f4_0%,_#eef4f1_45%,_#e8f1ef_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(217,119,6,0.12),_transparent_28%),linear-gradient(180deg,_#08110f_0%,_#0b1514_45%,_#101918_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-2 shadow-lg shadow-teal-900/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
              <LogoIcon size={30} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-800/70 dark:text-teal-200/70">
                DeepStation RIT
              </p>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Internal Communication Hub
              </h1>
            </div>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-2xl border border-white/60 bg-white/80 p-3 text-slate-700 shadow-lg shadow-teal-900/5 backdrop-blur transition hover:scale-105 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <div className="h-5 w-5" />
            )}
          </button>
        </nav>

        <main className="flex flex-1 items-center py-10">
          <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-600/15 bg-white/70 px-4 py-2 text-sm font-medium text-teal-800 shadow-sm backdrop-blur dark:border-teal-300/10 dark:bg-white/5 dark:text-teal-100">
                <Radio className="h-4 w-4" />
                Purpose-built for campus operations and team coordination
              </div>

              <div className="max-w-3xl space-y-6">
                <h2 className="text-5xl font-semibold leading-tight text-slate-950 dark:text-slate-50 md:text-6xl">
                  One place for DeepStation RIT updates, response, and daily
                  coordination.
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                  This rebuild turns the app into a real internal communications
                  workspace with seeded announcement channels, department rooms,
                  private desks, and operational handover threads from day one.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    icon: BellRing,
                    title: "Announcements",
                    text: "Leadership notices and verified campus-wide updates.",
                  },
                  {
                    icon: ClipboardList,
                    title: "Shift Handover",
                    text: "Operational continuity for each team and duty cycle.",
                  },
                  {
                    icon: Users,
                    title: "Departments",
                    text: "Dedicated spaces for engineering, IT, and support.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Private Desks",
                    text: "Restricted channels for administration and HR.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-xl shadow-teal-950/5 backdrop-blur dark:border-white/10 dark:bg-white/5"
                  >
                    <item.icon className="mb-4 h-5 w-5 text-teal-700 dark:text-teal-300" />
                    <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-50">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-[2rem] border border-slate-200/70 bg-slate-950 p-6 text-slate-50 shadow-2xl shadow-slate-950/20 dark:border-white/10">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-teal-300/80">
                      Default rollout
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold">
                      DeepStation RIT Internal Comms
                    </h3>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Building2 className="h-6 w-6 text-amber-300" />
                  </div>
                </div>
                <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-4">
                    `#announcements`, `#executive-briefings`
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    `#shift-handover`, `#incident-desk`
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    `#engineering-bay`, `#campus-it`
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    Private desks for administration and HR
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-2xl shadow-teal-950/10 backdrop-blur dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-800/70 dark:text-teal-200/70">
                  Start fresh
                </p>
                <h3 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">
                  Initialize the workspace
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Creates a new DeepStation RIT communication hub with internal
                  channels, seeded guidance messages, and department-focused
                  structure.
                </p>
                <Button
                  onClick={handleInitializeWorkspace}
                  disabled={isCreating || !hasConvex}
                  className="mt-6 h-12 w-full rounded-2xl bg-teal-700 text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
                >
                  {isCreating ? "Initializing workspace..." : "Initialize DeepStation RIT"}
                </Button>
                {!hasConvex && (
                  <p className="mt-3 text-xs leading-5 text-amber-700 dark:text-amber-300">
                    Set `NEXT_PUBLIC_CONVEX_URL` before creating or listing workspaces.
                  </p>
                )}
              </div>

              <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl shadow-teal-950/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700/80 dark:text-amber-200/80">
                  Continue
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                  Join an existing workspace
                </h3>
                <div className="mt-4 space-y-3">
                  <Input
                    value={joinWorkspaceId}
                    onChange={(event) => setJoinWorkspaceId(event.target.value)}
                    placeholder="Enter workspace ID"
                    className="h-12 rounded-2xl border-slate-200 bg-white/80 dark:border-white/10 dark:bg-slate-900/60"
                  />
                  <Button
                    onClick={handleJoinWorkspace}
                    variant="outline"
                    className="h-12 w-full rounded-2xl border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 dark:border-white/15 dark:text-slate-50 dark:hover:bg-white/10"
                  >
                    Open Workspace
                  </Button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-xl shadow-teal-950/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                    Available workspaces
                  </h3>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {hasConvex ? workspaces.length : 0}
                  </span>
                </div>

                <div className="space-y-3">
                  {!hasConvex && (
                    <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
                      Convex is not configured in this environment yet.
                    </div>
                  )}

                  {hasConvex && workspaces.length === 0 && (
                    <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
                      No workspaces yet. Initialize DeepStation RIT to create the
                      first one.
                    </div>
                  )}

                  {hasConvex &&
                    workspaces.map((workspace) => (
                      <Link
                        key={workspace._id}
                        href={`/${workspace.customId}`}
                        className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-4 transition hover:border-teal-300 hover:bg-teal-50/60 dark:border-white/10 dark:bg-slate-950/40 dark:hover:bg-white/10"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50">
                            {workspace.name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {workspace.customId}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </Link>
                    ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function MainPage() {
  return HAS_CONVEX ? <MainPageWithData /> : <MainPageWithoutData />;
}
