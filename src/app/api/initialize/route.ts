import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const DEFAULT_WORKSPACE_NAME = "DeepStation RIT Internal Comms";

export async function POST() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_CONVEX_URL is not configured." },
      { status: 500 }
    );
  }

  const client = new ConvexHttpClient(convexUrl);

  try {
    const existingWorkspace = await client.query(api.workspaces.getByName, {
      name: DEFAULT_WORKSPACE_NAME,
    });

    if (existingWorkspace) {
      return NextResponse.json({
        workspaceId: existingWorkspace._id,
        customId: existingWorkspace.customId,
      });
    }

    const response = await client.mutation(api.workspaces.create, {
      name: DEFAULT_WORKSPACE_NAME,
      description:
        "DeepStation RIT internal communication workspace for announcements, department coordination, and operational handovers.",
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to initialize DeepStation RIT workspace.",
      },
      { status: 500 }
    );
  }
}
