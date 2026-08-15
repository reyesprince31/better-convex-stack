import { R2 } from "@convex-dev/r2";
import { ConvexError, v } from "convex/values";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

export const r2 = new R2(components.r2);

export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>({
  checkUpload: async (ctx, _bucket) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "You must be signed in to upload files.",
      });
    }
  },
  onUpload: async (_ctx, _bucket, _key) => {
    // Optional post-upload sync
  },
});

export const getFileUrl = query({
  args: { key: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (_ctx, args) => {
    if (!args.key) return null;
    return await r2.getUrl(args.key, { expiresIn: 60 * 60 * 24 });
  },
});

export function extractR2Key(imageValue: string | null | undefined): string | null {
  if (!imageValue) return null;
  if (!imageValue.startsWith("http://") && !imageValue.startsWith("https://")) {
    return imageValue.trim() || null;
  }
  try {
    const url = new URL(imageValue);
    const pathParts = url.pathname.split("/").filter(Boolean);
    if (pathParts.length === 0) return null;
    const rawKey = pathParts[pathParts.length - 1];
    return decodeURIComponent(rawKey);
  } catch {
    return null;
  }
}

export const updateUserAvatar = mutation({
  args: { key: v.string() },
  returns: v.object({ success: v.boolean(), url: v.string() }),
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "Authentication required.",
      });
    }

    // Clean up previous avatar object from R2 if it exists
    const previousKey = extractR2Key(user.image);
    if (previousKey && previousKey !== args.key) {
      try {
        await r2.deleteObject(ctx, previousKey);
      } catch (err) {
        console.warn("Could not delete previous avatar from R2:", previousKey, err);
      }
    }

    // AWS SigV4 allows a maximum of 7 days (604,800 seconds)
    const url = await r2.getUrl(args.key, { expiresIn: 60 * 60 * 24 * 7 });
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.updateUser({
      body: {
        image: url,
      },
      headers,
    });

    return { success: true, url };
  },
});

export const removeUserAvatar = mutation({
  args: {},
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "Authentication required.",
      });
    }

    const previousKey = extractR2Key(user.image);
    if (previousKey) {
      try {
        await r2.deleteObject(ctx, previousKey);
      } catch (err) {
        console.warn("Could not delete avatar from R2:", previousKey, err);
      }
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.updateUser({
      body: {
        image: "",
      },
      headers,
    });

    return { success: true };
  },
});

export const deleteFile = mutation({
  args: { key: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "Authentication required.",
      });
    }
    await r2.deleteObject(ctx, args.key);
    return null;
  },
});
