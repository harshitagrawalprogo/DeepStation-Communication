"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogoIcon } from "@/components/logo";

interface NameInputDialogProps {
  isOpen: boolean;
  onNameSubmit: (name: string) => void;
  onClose: () => void;
  title?: string;
  placeholder?: string;
  workspaceName?: string;
  defaultValue?: string;
  buttonText?: string;
  description?: string;
}

export function NameInputDialog({
  isOpen,
  onNameSubmit,
  onClose,
  title = "Join DeepStation RIT",
  placeholder = "Enter your staff name",
  workspaceName,
  defaultValue = "",
  buttonText,
  description,
}: NameInputDialogProps) {
  const [name, setName] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setName(defaultValue);
    }
  }, [defaultValue, isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onNameSubmit(name.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto rounded-3xl border border-slate-200/60 bg-white/95 p-8 shadow-2xl dark:border-white/10 dark:bg-[#111918]/95 sm:max-w-md">
        <DialogHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-teal-500/15 bg-[linear-gradient(135deg,rgba(15,118,110,0.14),rgba(217,119,6,0.08))]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg dark:bg-[#162120]">
              <LogoIcon size={34} />
            </div>
          </div>
          <DialogTitle className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
            {workspaceName ? `Enter DeepStation RIT as ${workspaceName}` : title}
          </DialogTitle>
          <DialogDescription className="text-base leading-7 text-slate-600 dark:text-slate-300">
            {description ||
              (workspaceName
                ? `Add the name your team uses internally so your messages and presence appear correctly inside ${workspaceName}.`
                : placeholder)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-3">
            <Label
              htmlFor="name-input"
              className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200"
            >
              Display name
            </Label>
            <Input
              id="name-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Example: Asha Verma"
              className="h-14 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base dark:border-white/10 dark:bg-[#182221]"
            />
          </div>

          <DialogFooter className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-12 flex-1 rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-12 flex-1 rounded-2xl bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
              disabled={!name.trim()}
            >
              {buttonText || (workspaceName ? "Join Workspace" : "Continue")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
