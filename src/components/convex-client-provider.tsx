"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { ReactNode } from "react";

const convexUrl = "https://small-cow-383.convex.cloud";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  try {
    const convex = new ConvexReactClient(convexUrl);
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  } catch (error) {
    console.error("Failed to initialize Convex client:", error);
    // Return children without Convex provider if initialization fails
    return <>{children}</>;
  }
}
