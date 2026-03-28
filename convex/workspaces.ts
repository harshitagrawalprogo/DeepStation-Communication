import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const INTERNAL_CHANNEL_BLUEPRINTS = {
    groups: [
        {
            name: "Leadership Broadcasts",
            type: "group" as const,
            audience: "leadership" as const,
            channels: [
                {
                    name: "announcements",
                    subType: "announcement" as const,
                    description: "Official notices, policy changes, and campus-wide updates.",
                    department: "Leadership Office",
                    priority: "high" as const,
                    postingPolicy: "announcements" as const,
                },
                {
                    name: "executive-briefings",
                    subType: "text" as const,
                    description: "Leadership planning, follow-ups, and meeting summaries.",
                    department: "Leadership Office",
                    priority: "normal" as const,
                    postingPolicy: "moderated" as const,
                },
            ],
        },
        {
            name: "Operations Center",
            type: "group" as const,
            audience: "operations" as const,
            channels: [
                {
                    name: "shift-handover",
                    subType: "text" as const,
                    description: "Daily handovers, duty notes, and operational continuity updates.",
                    department: "Operations",
                    priority: "high" as const,
                    postingPolicy: "open" as const,
                },
                {
                    name: "incident-desk",
                    subType: "private" as const,
                    description: "Escalations, incident coordination, and urgent response threads.",
                    department: "Operations",
                    priority: "critical" as const,
                    postingPolicy: "moderated" as const,
                },
            ],
        },
        {
            name: "Departments",
            type: "group" as const,
            audience: "all-staff" as const,
            channels: [
                {
                    name: "engineering-bay",
                    subType: "text" as const,
                    description: "Technical discussions, maintenance plans, and system rollouts.",
                    department: "Engineering",
                    priority: "normal" as const,
                    postingPolicy: "open" as const,
                },
                {
                    name: "student-support",
                    subType: "text" as const,
                    description: "Student issues, request triage, and service coordination.",
                    department: "Student Support",
                    priority: "normal" as const,
                    postingPolicy: "open" as const,
                },
                {
                    name: "campus-it",
                    subType: "text" as const,
                    description: "Network notices, software requests, and infrastructure updates.",
                    department: "IT Services",
                    priority: "high" as const,
                    postingPolicy: "open" as const,
                },
            ],
        },
        {
            name: "Private Desks",
            type: "user" as const,
            audience: "private" as const,
            channels: [
                {
                    name: "admin-desk",
                    subType: "private" as const,
                    description: "Private coordination for administration and approvals.",
                    department: "Administration",
                    priority: "high" as const,
                    postingPolicy: "moderated" as const,
                },
                {
                    name: "hr-support",
                    subType: "private" as const,
                    description: "Sensitive staff support, HR queries, and confidential follow-up.",
                    department: "Human Resources",
                    priority: "high" as const,
                    postingPolicy: "moderated" as const,
                },
            ],
        },
    ],
    welcomeMessages: [
        {
            channelName: "announcements",
            content: "DeepStation RIT communications hub is live. Use this space for institution-wide announcements, verified operational guidance, and critical updates.",
            messageType: "announcement" as const,
            priority: "high" as const,
            authorRole: "System",
        },
        {
            channelName: "shift-handover",
            content: "Use this channel to record shift notes, escalations, pending issues, and any handover items that the next team should see immediately.",
            messageType: "system" as const,
            priority: "normal" as const,
            authorRole: "Operations Bot",
        },
        {
            channelName: "engineering-bay",
            content: "Engineering discussions start here. Share maintenance schedules, deployment notes, and troubleshooting context with the wider technical team.",
            messageType: "system" as const,
            priority: "normal" as const,
            authorRole: "Engineering Bot",
        },
    ],
};

// Generate URL-friendly custom ID from name
export const generateCustomId = (name: string) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')  // Replace non-alphanumeric with hyphens
        .replace(/-+/g, '-')         // Replace multiple hyphens with single
        .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
}

export const create = mutation({
    args: { 
        name: v.string(), 
        workspaceId: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Skip authentication for now - can be added back later with proper auth setup
        // const identity = await ctx.auth.getUserIdentity();
        // if (!identity) {
        //     throw new Error("Unauthorized");
        // }

        let customId = args.workspaceId || generateCustomId(args.name);
        
        // Check if name already exists
        const existingByName = await ctx.db
            .query("workspaces")
            .withIndex("by_name", (q: any) => q.eq("name", args.name))
            .first();
        
        if (existingByName) {
            throw new Error("Workspace name already exists");
        }
        
        // Check if customId already exists, generate new one if needed
        let existingByCustomId = await ctx.db
            .query("workspaces")
            .withIndex("by_custom_id", (q: any) => q.eq("customId", customId))
            .first();
        
        // If customId exists, append random suffix
        while (existingByCustomId) {
            customId = `${generateCustomId(args.name)}-${Math.floor(Math.random() * 1000)}`;
            existingByCustomId = await ctx.db
                .query("workspaces")
                .withIndex("by_custom_id", (q: any) => q.eq("customId", customId))
                .first();
        }

        const now = Date.now();

        const workspaceId = await ctx.db.insert("workspaces", {
            name: args.name, 
            customId,
            description: args.description || "Internal communications workspace for DeepStation RIT teams, operations, and leadership updates.",
            organizationName: "DeepStation RIT",
            organizationType: "institution",
            communicationMode: "internal",
            primaryLocation: "RIT Campus",
            createdAt: now,
            updatedAt: now,
        });

        const channelIdByName = new Map<string, any>();

        for (const [groupOrder, group] of INTERNAL_CHANNEL_BLUEPRINTS.groups.entries()) {
            const groupId = await ctx.db.insert("channelGroups", {
                name: group.name,
                workspaceId,
                type: group.type,
                isExpanded: true,
                audience: group.audience,
                order: groupOrder,
                createdAt: now,
                updatedAt: now,
            });

            for (const [channelOrder, channel] of group.channels.entries()) {
                const channelId = await ctx.db.insert("channels", {
                    name: channel.name,
                    workspaceId,
                    groupId,
                    type: group.type,
                    subType: channel.subType,
                    description: channel.description,
                    isActive: channel.name === "announcements",
                    department: channel.department,
                    priority: channel.priority,
                    postingPolicy: channel.postingPolicy,
                    order: channelOrder,
                    createdAt: now,
                    updatedAt: now,
                });

                channelIdByName.set(channel.name, channelId);
            }
        }

        for (const welcomeMessage of INTERNAL_CHANNEL_BLUEPRINTS.welcomeMessages) {
            const channelId = channelIdByName.get(welcomeMessage.channelName);
            if (!channelId) continue;

            await ctx.db.insert("messages", {
                channelId,
                content: welcomeMessage.content,
                richContent: undefined,
                userId: "system-deepstation",
                userName: "DeepStation Notice Bot",
                createdAt: now,
                isEdited: false,
                messageType: welcomeMessage.messageType,
                priority: welcomeMessage.priority,
                authorRole: welcomeMessage.authorRole,
            });
        }

        return { workspaceId, customId };
    }
});

export const update = mutation({
    args: { 
        id: v.id("workspaces"), 
        name: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const updates: any = {
            updatedAt: Date.now(),
        };

        if (args.name !== undefined) {
            updates.name = args.name;
        }

        if (args.description !== undefined) {
            updates.description = args.description;
        }

        await ctx.db.patch(args.id, updates);
        return args.id;
    }
});

export const remove = mutation({
    args: { id: v.id("workspaces") },
    handler: async (ctx, args) => {
        const workspace = await ctx.db.get(args.id);
        if (!workspace) {
            throw new Error("Workspace not found");
        }

        // Collect all file URLs for external cleanup (Backblaze)
        const fileUrls: string[] = [];

        // Get all channels in this workspace
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
            .collect();

        console.log(`Deleting workspace "${workspace.name}" with ${channels.length} channels`);

        for (const channel of channels) {
            // Delete all messages in each channel
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) => q.eq("channelId", channel._id))
                .collect();

            console.log(`Deleting ${messages.length} messages from channel "${channel.name}"`);

            for (const message of messages) {
                // Extract file URLs from richContent attachments
                if (message.richContent?.attachments && Array.isArray(message.richContent.attachments)) {
                    for (const attachment of message.richContent.attachments) {
                        if (attachment.url) {
                            fileUrls.push(attachment.url);
                        }
                    }
                }
                await ctx.db.delete(message._id);
            }

            await ctx.db.delete(channel._id);
        }

        // Delete all channel groups in this workspace
        const channelGroups = await ctx.db
            .query("channelGroups")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
            .collect();

        console.log(`Deleting ${channelGroups.length} channel groups`);

        for (const group of channelGroups) {
            await ctx.db.delete(group._id);
        }

        // Delete all user presence records for this workspace
        const userPresences = await ctx.db
            .query("userPresence")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
            .collect();

        console.log(`Deleting ${userPresences.length} user presence records`);

        for (const presence of userPresences) {
            await ctx.db.delete(presence._id);
        }

        // Delete the workspace itself
        await ctx.db.delete(args.id);
        
        console.log(`Workspace "${workspace.name}" deleted. ${fileUrls.length} files need external cleanup.`);
        
        // Return workspace ID and file URLs for external cleanup
        return {
            workspaceId: args.id,
            workspaceName: workspace.name,
            fileUrls,
            deletedChannels: channels.length,
            deletedGroups: channelGroups.length,
        };
    }
});

export const get = query({
    args: {},
    handler: async (ctx) => {
        const workspaces = await ctx.db.query("workspaces").collect();
        return workspaces;
    },
});

export const getInfoById = query({
    args: { id: v.id("workspaces") },
    handler: async (ctx, args) => {
        const workspace = await ctx.db.get(args.id);        

        return {
            name: workspace?.name,
            description: workspace?.description,
            organizationName: workspace?.organizationName,
            isMember: true,
        };
    },
});

export const getById = query({
    args: { id: v.id("workspaces") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    }, 
});

export const getByCustomId = query({
    args: { customId: v.string() },
    handler: async (ctx, args) => {
        const workspace = await ctx.db
            .query("workspaces")
            .withIndex("by_custom_id", (q: any) => q.eq("customId", args.customId))
            .first();
        return workspace;
    },
});

export const getByName = query({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const workspace = await ctx.db
            .query("workspaces")
            .withIndex("by_name", (q: any) => q.eq("name", args.name))
            .first();
        return workspace;
    },
});

// Get active users in a workspace (users who have sent messages recently)
export const getActiveUsers = query({
    args: { 
        workspaceId: v.id("workspaces"),
        timeWindow: v.optional(v.number()), // Time window in milliseconds, default 24 hours
    },
    handler: async (ctx, args) => {
        const timeWindow = args.timeWindow || 24 * 60 * 60 * 1000; // 24 hours
        const cutoffTime = Date.now() - timeWindow;

        // Get all channels in this workspace
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        const channelIds = channels.map(channel => channel._id);
        const activeUsers = new Map<string, {
            userName: string;
            lastActivity: number;
            messageCount: number;
        }>();

        // Get recent messages from all channels
        for (const channelId of channelIds) {
            const recentMessages = await ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) => q.eq("channelId", channelId))
                .filter((q) => q.gte(q.field("createdAt"), cutoffTime))
                .collect();

            // Track user activity
            recentMessages.forEach(message => {
                const existing = activeUsers.get(message.userName);
                if (!existing || message.createdAt > existing.lastActivity) {
                    activeUsers.set(message.userName, {
                        userName: message.userName,
                        lastActivity: message.createdAt,
                        messageCount: (existing?.messageCount || 0) + 1,
                    });
                }
            });
        }

        // Convert to array and sort by last activity
        const activeUsersList = Array.from(activeUsers.values())
            .sort((a, b) => b.lastActivity - a.lastActivity);

        return activeUsersList;
    },
});

// Get all users who have ever interacted with a workspace (for mentions)
export const getAllWorkspaceUsers = query({
    args: { 
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        // Get all channels in this workspace
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        const channelIds = channels.map(channel => channel._id);
        const allUsers = new Map<string, {
            userName: string;
            lastActivity: number;
            messageCount: number;
            isActive: boolean;
        }>();

        // Get all messages from all channels to find all users
        for (const channelId of channelIds) {
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) => q.eq("channelId", channelId))
                .collect();

            // Track all users who have sent messages
            messages.forEach(message => {
                const existing = allUsers.get(message.userName);
                const now = Date.now();
                const isActive = (now - message.createdAt) < (5 * 60 * 1000); // Active if message sent in last 5 minutes
                
                if (!existing || message.createdAt > existing.lastActivity) {
                    allUsers.set(message.userName, {
                        userName: message.userName,
                        lastActivity: message.createdAt,
                        messageCount: (existing?.messageCount || 0) + 1,
                        isActive: isActive || (existing?.isActive || false),
                    });
                }
            });
        }

        // Add some default users for demo purposes if no users found
        if (allUsers.size === 0) {
            const defaultUsers = [
                { userName: "john_doe", lastActivity: Date.now() - 10000, messageCount: 0, isActive: false },
                { userName: "jane_smith", lastActivity: Date.now() - 30000, messageCount: 0, isActive: false },
                { userName: "alex_chen", lastActivity: Date.now() - 60000, messageCount: 0, isActive: false },
                { userName: "sarah_wilson", lastActivity: Date.now() - 120000, messageCount: 0, isActive: false },
                { userName: "mike_brown", lastActivity: Date.now() - 300000, messageCount: 0, isActive: false },
            ];

            defaultUsers.forEach(user => {
                allUsers.set(user.userName, user);
            });
        }

        // Convert to array and sort by activity (active users first, then by last activity)
        const allUsersList = Array.from(allUsers.values())
            .sort((a, b) => {
                // Active users first
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                // Then by last activity
                return b.lastActivity - a.lastActivity;
            });

        return allUsersList;
    },
});

// Update user presence when they join/leave a workspace
export const updateUserPresence = mutation({
    args: {
        userName: v.string(),
        workspaceId: v.id("workspaces"),
        status: v.union(v.literal("online"), v.literal("offline"), v.literal("away")),
        currentChannel: v.optional(v.id("channels")),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        
        // Check if user presence already exists
        const existingPresence = await ctx.db
            .query("userPresence")
            .withIndex("by_user_workspace", (q) => 
                q.eq("userName", args.userName).eq("workspaceId", args.workspaceId)
            )
            .first();

        if (existingPresence) {
            // Update existing presence
            await ctx.db.patch(existingPresence._id, {
                status: args.status,
                lastSeen: now,
                currentChannel: args.currentChannel,
            });
            return existingPresence._id;
        } else {
            // Create new presence record
            const presenceId = await ctx.db.insert("userPresence", {
                userName: args.userName,
                workspaceId: args.workspaceId,
                status: args.status,
                lastSeen: now,
                joinedAt: now,
                currentChannel: args.currentChannel,
            });
            return presenceId;
        }
    },
});

// Get active users based on presence data instead of just messages
export const getActiveUsersWithPresence = query({
    args: { 
        workspaceId: v.id("workspaces"),
        timeWindow: v.optional(v.number()), // Time window in milliseconds, default 5 minutes
    },
    handler: async (ctx, args) => {
        const timeWindow = args.timeWindow || 5 * 60 * 1000; // 5 minutes
        const cutoffTime = Date.now() - timeWindow;

        // Get users with recent presence updates who are not offline
        const activePresences = await ctx.db
            .query("userPresence")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .filter((q) => 
                q.and(
                    q.gte(q.field("lastSeen"), cutoffTime), // Active within timeWindow
                    q.neq(q.field("status"), "offline")      // Not offline
                )
            )
            .collect();

        // Also get message activity for message count
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        const channelIds = channels.map(channel => channel._id);
        const messageActivity = new Map<string, number>();

        // Count messages for each user
        for (const channelId of channelIds) {
            const recentMessages = await ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) => q.eq("channelId", channelId))
                .filter((q) => q.gte(q.field("createdAt"), cutoffTime))
                .collect();

            recentMessages.forEach(message => {
                const count = messageActivity.get(message.userName) || 0;
                messageActivity.set(message.userName, count + 1);
            });
        }

        // Combine presence data with message activity
        const activeUsers = activePresences.map(presence => ({
            userName: presence.userName,
            lastActivity: presence.lastSeen,
            messageCount: messageActivity.get(presence.userName) || 0,
            status: presence.status,
            joinedAt: presence.joinedAt,
        }));

        // Sort by last activity (most recent first)
        return activeUsers.sort((a, b) => b.lastActivity - a.lastActivity);
    },
});

// Cleanup inactive users (set to offline if inactive for more than 5 minutes)
export const cleanupInactiveUsers = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        inactivityThreshold: v.optional(v.number()), // milliseconds, default 5 minutes
    },
    handler: async (ctx, args) => {
        const threshold = args.inactivityThreshold || 5 * 60 * 1000; // 5 minutes
        const cutoffTime = Date.now() - threshold;

        // Find users who are marked as online/away but haven't been seen recently
        const stalePresences = await ctx.db
            .query("userPresence")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .filter((q) => 
                q.and(
                    q.lt(q.field("lastSeen"), cutoffTime), // Haven't been seen recently
                    q.neq(q.field("status"), "offline")    // Currently not offline
                )
            )
            .collect();

        // Update them to offline
        const updatePromises = stalePresences.map(presence => 
            ctx.db.patch(presence._id, { status: "offline" })
        );

        await Promise.all(updatePromises);
        
        return {
            updatedCount: stalePresences.length,
            updatedUsers: stalePresences.map(p => p.userName)
        };
    },
});
