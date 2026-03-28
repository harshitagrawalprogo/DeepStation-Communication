"use client";

import { Menu, PanelLeft, PanelLeftClose, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { LogoIcon } from "./logo";

interface WorkspaceHeaderProps {
  workspaceName?: string;
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
  onSidebarCollapse?: () => void;
  isSidebarCollapsed?: boolean;
  className?: string;
}

export function WorkspaceHeader({
  workspaceName = "DeepStation RIT",
  onMenuToggle,
  onSearch,
  onSidebarCollapse,
  isSidebarCollapsed = false,
  className,
}: WorkspaceHeaderProps) {
  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200/50 bg-white/80 px-4 backdrop-blur-xl dark:border-[#30363d] dark:bg-[#010409]/95 md:relative",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-[#8d96a0] dark:hover:bg-[#21262d] dark:hover:text-[#e6edf3] md:hidden"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          className="hidden rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-[#8d96a0] dark:hover:bg-[#21262d] dark:hover:text-[#e6edf3] md:flex"
          onClick={onSidebarCollapse}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <div className="hidden h-5 w-px bg-slate-200 dark:bg-[#30363d] md:block" />

        <div className="group flex cursor-pointer items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/50 bg-white shadow-md transition-all group-hover:shadow-lg dark:border-[#30363d] dark:bg-[#161b22]">
            <LogoIcon size={20} />
          </div>
          <div className="hidden sm:block">
            <span className="block font-semibold text-slate-800 transition-colors group-hover:text-teal-700 dark:text-[#e6edf3] dark:group-hover:text-teal-300">
              {workspaceName}
            </span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-[#8d96a0]">
              Internal Communications
            </span>
          </div>
        </div>
      </div>

      <div className="mx-4 hidden max-w-xl flex-1 md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-[#8d96a0]" />
          <Input
            placeholder="Search messages, files, or channels... Ctrl+K"
            className="h-9 w-full rounded-xl border-slate-200/50 bg-slate-100/80 pl-9 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#e6edf3] dark:placeholder:text-[#8d96a0] dark:focus:border-[#58a6ff]/50 dark:focus:bg-[#161b22] dark:focus:ring-[#58a6ff]/20"
            onFocus={() => onSearch?.("")}
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-[#8d96a0] dark:hover:bg-[#21262d] dark:hover:text-[#e6edf3] md:hidden"
          onClick={() => onSearch?.("")}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
        <div className="rounded-lg border border-slate-200 bg-white p-0.5 shadow-[3px_3px_8px_rgba(0,0,0,0.08),-3px_-3px_8px_rgba(255,255,255,0.9)] dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.3),-3px_-3px_8px_rgba(255,255,255,0.05)]">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
