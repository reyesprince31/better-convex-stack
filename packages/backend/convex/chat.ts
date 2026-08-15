import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { Agent, createThread, listUIMessages } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export type StoredApiKeyResult = {
  provider: "google" | "openai";
  apiKey: string;
  model: string;
} | null;

export type ValidationResult =
  | {
      success: true;
      provider: "google" | "openai";
      defaultModel: string;
      models: Array<{
        id: string;
        displayName: string;
        description?: string;
      }>;
    }
  | {
      success: false;
      error: string;
    };

export type SendMessageResult = {
  text: string;
  reasoning?: string;
  modelUsed: string;
  elapsedMs: number;
};

// ==========================================
// 1. API KEY VALIDATION & DYNAMIC MODEL FETCH
// ==========================================

/**
 * Validates a Gemini or OpenAI API Key against the provider's API,
 * extracts models supporting chat/generation, and saves to user's aiSettings.
 */
export const validateAndSaveApiKey = action({
  args: {
    provider: v.optional(v.union(v.literal("google"), v.literal("openai"))),
    apiKey: v.string(),
  },
  handler: async (ctx, args): Promise<ValidationResult> => {
    const provider = args.provider || "google";
    const trimmedKey = args.apiKey.trim();

    if (!trimmedKey) {
      return { success: false, error: "API Key cannot be empty" };
    }

    if (provider === "openai") {
      try {
        const response = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${trimmedKey}` },
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as {
            error?: { message?: string };
          };
          const errorMessage =
            errorData.error?.message ||
            `OpenAI responded with status ${response.status} (${response.statusText})`;
          console.error(`[Chat:Server] OpenAI API validation failed: ${errorMessage}`);
          return { success: false, error: errorMessage };
        }

        const data = (await response.json()) as {
          data?: Array<{ id: string }>;
        };

        const rawModels = data.data || [];
        const efficientPrefixes = [
          "gpt-5.6-luna",
          "gpt-5.6-terra",
          "gpt-5.6-sol",
          "gpt-5.4-mini",
          "gpt-5-mini",
          "gpt-4o-mini",
          "o3-mini",
          "o1-mini",
          "gpt-5.6",
          "gpt-5.4",
          "gpt-4o",
          "o3",
          "o1",
        ];

        let compatibleModels = rawModels
          .filter((m) => {
            // Exclude expensive or non-chat models
            if (
              m.id.startsWith("ft:") ||
              m.id.includes("realtime") ||
              m.id.includes("audio") ||
              m.id.includes("transcribe") ||
              m.id.includes("tts") ||
              m.id.includes("whisper") ||
              m.id.includes("dall-e") ||
              m.id.includes("embedding") ||
              m.id.includes("babbage") ||
              m.id.includes("davinci") ||
              m.id.includes("instruct") ||
              m.id.includes("moderation") ||
              m.id.includes("vision-preview") ||
              m.id.includes("4.5") || // Exclude heavy 4.5
              m.id.includes("turbo") // Exclude older expensive turbo
            ) {
              return false;
            }
            return efficientPrefixes.some((prefix) => m.id.startsWith(prefix));
          })
          .map((m) => {
            let desc = "Cost-effective OpenAI model";
            if (m.id.includes("luna")) desc = "Ultra-efficient, cost-optimized";
            else if (m.id.includes("terra")) desc = "Balanced high-efficiency intelligence";
            else if (m.id.includes("sol")) desc = "Flagship reasoning & agentic execution";
            else if (m.id === "gpt-4o-mini" || m.id.includes("mini")) desc = "Fast & lightweight";
            else if (m.id === "gpt-4o") desc = "High capability workhorse";
            else if (m.id.startsWith("o3")) desc = "High-speed reasoning";
            else if (m.id.startsWith("o1")) desc = "Advanced reasoning";
            return {
              id: m.id,
              displayName: m.id,
              description: desc,
            };
          })
          .sort((a, b) => {
            const priority: Record<string, number> = {
              "gpt-5.6-luna": 1,
              "gpt-5.6-terra": 2,
              "gpt-5.6-sol": 3,
              "gpt-5.4-mini": 4,
              "gpt-4o-mini": 5,
              "o3-mini": 6,
              "o1-mini": 7,
              "gpt-4o": 8,
              o1: 9,
              o3: 10,
            };
            const pA = priority[a.id] ?? 99;
            const pB = priority[b.id] ?? 99;
            if (pA !== pB) return pA - pB;
            return a.id.localeCompare(b.id);
          });

        if (compatibleModels.length === 0) {
          compatibleModels = [
            {
              id: "gpt-5.6-luna",
              displayName: "gpt-5.6-luna",
              description: "Ultra-efficient, cost-optimized",
            },
            {
              id: "gpt-5.6-terra",
              displayName: "gpt-5.6-terra",
              description: "Balanced high-efficiency intelligence",
            },
            {
              id: "gpt-5.6-sol",
              displayName: "gpt-5.6-sol",
              description: "Flagship reasoning & execution",
            },
            {
              id: "gpt-4o-mini",
              displayName: "gpt-4o-mini",
              description: "Fast & lightweight",
            },
            {
              id: "o3-mini",
              displayName: "o3-mini",
              description: "High-speed reasoning",
            },
          ];
        }

        const defaultModel =
          compatibleModels.find((m) => m.id === "gpt-5.6-luna")?.id ||
          compatibleModels.find((m) => m.id === "gpt-4o-mini")?.id ||
          compatibleModels[0]!.id;

        await ctx.runMutation(internal.chat.saveValidatedAiSettings, {
          provider: "openai",
          apiKey: trimmedKey,
          model: defaultModel,
          availableModels: compatibleModels,
        });

        return {
          success: true,
          provider: "openai",
          defaultModel,
          models: compatibleModels,
        };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return { success: false, error: errorMsg };
      }
    }

    // Google Gemini Validation
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${trimmedKey}`,
      );

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        const errorMessage =
          errorData.error?.message ||
          `Google API responded with status ${response.status} (${response.statusText})`;
        console.error(`[Chat:Server] Google API validation failed: ${errorMessage}`);
        return { success: false, error: errorMessage };
      }

      const data = (await response.json()) as {
        models?: Array<{
          name: string;
          displayName?: string;
          description?: string;
          supportedGenerationMethods?: string[];
        }>;
      };

      const rawModels = data.models || [];
      const compatibleModels = rawModels
        .filter((m) => {
          if (!m.supportedGenerationMethods?.includes("generateContent")) return false;
          const id = m.name.replace(/^models\//, "").toLowerCase();
          // Filter to efficient models: Flash, Flash-Lite, and Gemini 3.x
          return (
            id.includes("flash") ||
            id.includes("gemini-3") ||
            id.includes("gemini-2.5") ||
            id.includes("lite")
          );
        })
        .map((m) => {
          const id = m.name.replace(/^models\//, "");
          return {
            id,
            displayName: m.displayName || id,
            description: m.description || "Cost-effective Google Gemini model",
          };
        })
        .sort((a, b) => {
          // Prioritize 3.5 Flash-Lite, 3.7 Flash, 3.1 Flash-Lite, 2.5 Flash
          const getPriority = (id: string) => {
            if (id.includes("3.5-flash-lite")) return 1;
            if (id.includes("3.7-flash")) return 2;
            if (id.includes("3.5-flash")) return 3;
            if (id.includes("3.1-flash-lite")) return 4;
            if (id.includes("2.5-flash-lite")) return 5;
            if (id.includes("2.5-flash")) return 6;
            if (id.includes("flash-lite")) return 7;
            if (id.includes("flash")) return 8;
            return 20;
          };
          const pA = getPriority(a.id);
          const pB = getPriority(b.id);
          if (pA !== pB) return pA - pB;
          return a.id.localeCompare(b.id);
        });

      if (compatibleModels.length === 0) {
        return {
          success: false,
          error: "API key is valid, but no text generation models are accessible.",
        };
      }

      const preferredDefault =
        compatibleModels.find((m) => m.id.includes("gemini-2.5-flash"))?.id ||
        compatibleModels.find((m) => m.id.includes("gemini-2.0-flash"))?.id ||
        compatibleModels.find((m) => m.id.includes("gemini-1.5-flash"))?.id ||
        compatibleModels[0]!.id;

      await ctx.runMutation(internal.chat.saveValidatedAiSettings, {
        provider: "google",
        apiKey: trimmedKey,
        model: preferredDefault,
        availableModels: compatibleModels,
      });

      return {
        success: true,
        provider: "google",
        defaultModel: preferredDefault,
        models: compatibleModels,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  },
});

// ==========================================
// 2. SETTINGS QUERIES & MUTATIONS
// ==========================================

export const saveValidatedAiSettings = internalMutation({
  args: {
    provider: v.optional(v.union(v.literal("google"), v.literal("openai"))),
    apiKey: v.string(),
    model: v.string(),
    availableModels: v.array(
      v.object({
        id: v.string(),
        displayName: v.string(),
        description: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const userId = user ? String(user._id) : undefined;
    const keyIdentifier = userId || "default";
    const provider = args.provider || "google";

    let existing = null;
    if (userId) {
      existing = await ctx.db
        .query("aiSettings")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
    }
    if (!existing) {
      existing = await ctx.db
        .query("aiSettings")
        .withIndex("by_keyIdentifier", (q) => q.eq("keyIdentifier", "default"))
        .first();
    }

    if (existing) {
      if (provider === "openai") {
        await ctx.db.patch("aiSettings", existing._id, {
          userId: userId || existing.userId,
          provider: "openai",
          openaiApiKey: args.apiKey,
          openaiModel: args.model,
          openaiAvailableModels: args.availableModels,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.patch("aiSettings", existing._id, {
          userId: userId || existing.userId,
          provider: "google",
          apiKey: args.apiKey,
          model: args.model,
          availableModels: args.availableModels,
          updatedAt: Date.now(),
        });
      }
    } else {
      if (provider === "openai") {
        await ctx.db.insert("aiSettings", {
          userId,
          keyIdentifier,
          provider: "openai",
          apiKey: "",
          model: "gemini-2.5-flash",
          availableModels: [],
          openaiApiKey: args.apiKey,
          openaiModel: args.model,
          openaiAvailableModels: args.availableModels,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("aiSettings", {
          userId,
          keyIdentifier,
          provider: "google",
          apiKey: args.apiKey,
          model: args.model,
          availableModels: args.availableModels,
          openaiApiKey: "",
          openaiModel: "gpt-4o-mini",
          openaiAvailableModels: [],
          updatedAt: Date.now(),
        });
      }
    }
  },
});

export const getAiSettings = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const userId = user ? String(user._id) : undefined;

    let userSettings = null;
    if (userId) {
      userSettings = await ctx.db
        .query("aiSettings")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
    }
    const defaultSettings = await ctx.db
      .query("aiSettings")
      .withIndex("by_keyIdentifier", (q) => q.eq("keyIdentifier", "default"))
      .first();

    const settings = userSettings || defaultSettings;
    const provider: "google" | "openai" = settings?.provider || "google";

    const googleKey = userSettings?.apiKey || defaultSettings?.apiKey || "";
    const googleMaskedKey =
      googleKey.length > 10
        ? `${googleKey.slice(0, 6)}...${googleKey.slice(-4)}`
        : googleKey
          ? "******"
          : "";

    const openaiKey = userSettings?.openaiApiKey || defaultSettings?.openaiApiKey || "";
    const openaiMaskedKey =
      openaiKey.length > 10
        ? `${openaiKey.slice(0, 6)}...${openaiKey.slice(-4)}`
        : openaiKey
          ? "******"
          : "";

    const isGoogleConfigured = Boolean(googleKey);
    const isOpenaiConfigured = Boolean(openaiKey);

    const isConfigured = provider === "openai" ? isOpenaiConfigured : isGoogleConfigured;
    const activeModel =
      provider === "openai"
        ? userSettings?.openaiModel || defaultSettings?.openaiModel || "gpt-4o-mini"
        : userSettings?.model || defaultSettings?.model || "gemini-2.5-flash";

    const activeAvailableModels =
      provider === "openai"
        ? userSettings?.openaiAvailableModels || defaultSettings?.openaiAvailableModels || []
        : userSettings?.availableModels || defaultSettings?.availableModels || [];

    return {
      provider,
      isConfigured,
      model: activeModel,
      availableModels: activeAvailableModels,
      google: {
        isConfigured: isGoogleConfigured,
        maskedKey: googleMaskedKey,
        model: userSettings?.model || defaultSettings?.model || "gemini-2.5-flash",
        availableModels: userSettings?.availableModels || defaultSettings?.availableModels || [],
      },
      openai: {
        isConfigured: isOpenaiConfigured,
        maskedKey: openaiMaskedKey,
        model: userSettings?.openaiModel || defaultSettings?.openaiModel || "gpt-4o-mini",
        availableModels:
          userSettings?.openaiAvailableModels || defaultSettings?.openaiAvailableModels || [],
      },
    };
  },
});

export const updateActiveProvider = mutation({
  args: {
    provider: v.union(v.literal("google"), v.literal("openai")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const userId = user ? String(user._id) : undefined;

    let existing = null;
    if (userId) {
      existing = await ctx.db
        .query("aiSettings")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
    }
    if (!existing) {
      existing = await ctx.db
        .query("aiSettings")
        .withIndex("by_keyIdentifier", (q) => q.eq("keyIdentifier", "default"))
        .first();
    }

    if (existing) {
      await ctx.db.patch("aiSettings", existing._id, {
        provider: args.provider,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("aiSettings", {
        userId,
        keyIdentifier: userId || "default",
        provider: args.provider,
        apiKey: "",
        model: "gemini-2.5-flash",
        availableModels: [],
        openaiApiKey: "",
        openaiModel: "gpt-4o-mini",
        openaiAvailableModels: [],
        updatedAt: Date.now(),
      });
    }
  },
});

export const updateActiveModel = mutation({
  args: {
    model: v.string(),
    provider: v.optional(v.union(v.literal("google"), v.literal("openai"))),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const userId = user ? String(user._id) : undefined;

    let existing = null;
    if (userId) {
      existing = await ctx.db
        .query("aiSettings")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
    }
    if (!existing) {
      existing = await ctx.db
        .query("aiSettings")
        .withIndex("by_keyIdentifier", (q) => q.eq("keyIdentifier", "default"))
        .first();
    }

    if (existing) {
      const targetProvider = args.provider || existing.provider || "google";
      if (targetProvider === "openai") {
        await ctx.db.patch("aiSettings", existing._id, {
          openaiModel: args.model,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.patch("aiSettings", existing._id, {
          model: args.model,
          updatedAt: Date.now(),
        });
      }
    } else {
      const targetProvider = args.provider || "google";
      await ctx.db.insert("aiSettings", {
        userId,
        keyIdentifier: userId || "default",
        provider: targetProvider,
        apiKey: "",
        model: targetProvider === "google" ? args.model : "gemini-2.5-flash",
        availableModels: [],
        openaiApiKey: "",
        openaiModel: targetProvider === "openai" ? args.model : "gpt-4o-mini",
        openaiAvailableModels: [],
        updatedAt: Date.now(),
      });
    }
  },
});

export type StoredAiConfigResult = {
  provider: "google" | "openai";
  googleApiKey?: string;
  googleModel?: string;
  openaiApiKey?: string;
  openaiModel?: string;
} | null;

export const getStoredApiKey = internalQuery({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<StoredAiConfigResult> => {
    let userSettings = null;
    if (args.userId) {
      userSettings = await ctx.db
        .query("aiSettings")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
        .first();
    }
    const defaultSettings = await ctx.db
      .query("aiSettings")
      .withIndex("by_keyIdentifier", (q) => q.eq("keyIdentifier", "default"))
      .first();

    const activeSettings = userSettings || defaultSettings;
    if (!activeSettings && !userSettings && !defaultSettings) return null;

    const provider: "google" | "openai" = activeSettings?.provider || "google";
    const googleApiKey = userSettings?.apiKey || defaultSettings?.apiKey || "";
    const googleModel = userSettings?.model || defaultSettings?.model || "gemini-2.5-flash";
    const openaiApiKey = userSettings?.openaiApiKey || defaultSettings?.openaiApiKey || "";
    const openaiModel = userSettings?.openaiModel || defaultSettings?.openaiModel || "gpt-4o-mini";

    return {
      provider,
      googleApiKey,
      googleModel,
      openaiApiKey,
      openaiModel,
    };
  },
});

// ==========================================
// 3. CONVERSATION THREAD MANAGEMENT (CRUD)
// ==========================================

export type ThreadSummary = {
  _id: Id<"threads">;
  agentThreadId: string;
  title: string;
  model?: string;
  createdAt: number;
  updatedAt: number;
};

export const listUserThreads = query({
  args: {},
  handler: async (ctx): Promise<ThreadSummary[]> => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return [];
    }

    const userId = String(user._id);
    const threads = await ctx.db
      .query("threads")
      .withIndex("by_userId_and_updatedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return threads.map((t) => ({
      _id: t._id,
      agentThreadId: t.agentThreadId,
      title: t.title,
      model: t.model,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  },
});

export const createUserThread = mutation({
  args: {
    title: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const userId = user ? String(user._id) : "anonymous";

    const title = args.title || "New Conversation";
    const agentThreadId = await createThread(ctx, components.agent, {
      title,
      userId,
    });

    const threadId = await ctx.db.insert("threads", {
      userId,
      agentThreadId,
      title,
      model: args.model,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { threadId, agentThreadId };
  },
});

export const deleteUserThread = mutation({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const userId = user ? String(user._id) : undefined;

    const thread = await ctx.db.get("threads", args.threadId);
    if (!thread) {
      throw new Error("Conversation not found");
    }

    if (userId && thread.userId !== userId && thread.userId !== "anonymous") {
      throw new Error("Unauthorized: You do not own this conversation");
    }

    await ctx.db.delete("threads", args.threadId);
    return { success: true };
  },
});

export const renameUserThread = mutation({
  args: {
    threadId: v.id("threads"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const userId = user ? String(user._id) : undefined;

    const thread = await ctx.db.get("threads", args.threadId);
    if (!thread) {
      throw new Error("Conversation not found");
    }

    if (userId && thread.userId !== userId && thread.userId !== "anonymous") {
      throw new Error("Unauthorized: You do not own this conversation");
    }

    await ctx.db.patch("threads", args.threadId, {
      title: args.title.trim(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const touchThreadWithMessage = internalMutation({
  args: {
    userThreadId: v.id("threads"),
    firstPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get("threads", args.userThreadId);
    if (!thread) return;

    let updatedTitle = thread.title;
    if (thread.title === "New Conversation" && args.firstPrompt) {
      const cleanPrompt = args.firstPrompt.trim();
      updatedTitle =
        cleanPrompt.length > 35 ? `${cleanPrompt.slice(0, 32)}...` : cleanPrompt;
    }

    await ctx.db.patch("threads", args.userThreadId, {
      title: updatedTitle,
      updatedAt: Date.now(),
    });
  },
});

// ==========================================
// 4. MESSAGES & AGENT RUNTIME
// ==========================================

export const listMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await listUIMessages(ctx, components.agent, args);
  },
});

export const sendMessage = action({
  args: {
    threadId: v.string(),
    prompt: v.string(),
    userThreadId: v.optional(v.id("threads")),
    apiKeyOverride: v.optional(v.string()),
    modelOverride: v.optional(v.string()),
    providerOverride: v.optional(v.union(v.literal("google"), v.literal("openai"))),
  },
  handler: async (ctx, args): Promise<SendMessageResult> => {
    // Step 1: Query stored AI settings
    const stored = await ctx.runQuery(internal.chat.getStoredApiKey, {});

    // Determine target model and auto-detect provider
    let selectedModel = args.modelOverride?.trim();
    let provider: "google" | "openai" = args.providerOverride || stored?.provider || "google";

    if (selectedModel) {
      if (
        selectedModel.startsWith("gpt") ||
        selectedModel.startsWith("o1") ||
        selectedModel.startsWith("o3") ||
        selectedModel.startsWith("chatgpt")
      ) {
        provider = "openai";
      } else if (selectedModel.startsWith("gemini")) {
        provider = "google";
      }
    } else {
      selectedModel =
        provider === "openai"
          ? stored?.openaiModel || "gpt-4o-mini"
          : stored?.googleModel || "gemini-2.5-flash";
    }

    const apiKey =
      args.apiKeyOverride?.trim() ||
      (provider === "openai" ? stored?.openaiApiKey : stored?.googleApiKey);

    if (!apiKey) {
      const providerTitle = provider === "openai" ? "OpenAI" : "Google Gemini";
      throw new Error(
        `No ${providerTitle} API key configured. Please add your ${providerTitle} key in AI Settings.`,
      );
    }

    // Step 2: Create dynamic language model
    let languageModel;
    if (provider === "openai") {
      const openai = createOpenAI({ apiKey });
      languageModel = openai(selectedModel);
    } else {
      const google = createGoogleGenerativeAI({ apiKey });
      languageModel = google(selectedModel);
    }

    // Step 3: Instantiate Convex Agent
    const dynamicAgent = new Agent(components.agent, {
      name: provider === "openai" ? "OpenAIAssistant" : "GeminiAssistant",
      languageModel: languageModel as any,
      instructions:
        "You are a helpful, knowledgeable, and concise AI assistant. Always output a conversational markdown response. If asked about your tools, capabilities, or external resources, explain directly in text what you can and cannot do.",
    });

    // Step 4: Generate response
    const startTime = Date.now();

    const result = await dynamicAgent.generateText(
      ctx,
      { threadId: args.threadId },
      { prompt: args.prompt },
    );

    const elapsedMs = Date.now() - startTime;

    // Step 5: Touch thread record and auto-title
    if (args.userThreadId) {
      await ctx.runMutation(internal.chat.touchThreadWithMessage, {
        userThreadId: args.userThreadId,
        firstPrompt: args.prompt,
      });
    }

    const outputText =
      result.text && result.text.trim().length > 0
        ? result.text
        : "I received your message, but the model completed without generating text. Try asking a direct question or switching models.";

    let reasoningText: string | undefined;
    if (Array.isArray(result.reasoning)) {
      reasoningText = (result.reasoning as Array<{ text?: string }>)
        .map((r) => r.text)
        .filter(Boolean)
        .join("\n\n");
    } else if (typeof (result as unknown as { reasoningText?: string }).reasoningText === "string") {
      reasoningText = (result as unknown as { reasoningText: string }).reasoningText;
    }

    return {
      text: outputText,
      reasoning: reasoningText || undefined,
      modelUsed: selectedModel,
      elapsedMs,
    };
  },
});
