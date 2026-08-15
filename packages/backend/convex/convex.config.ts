import rateLimiterComponent from "@convex-dev/rate-limiter/convex.config";
import r2 from "@convex-dev/r2/convex.config";
import { defineApp } from "convex/server";
import { v } from "convex/values";

import betterAuth from "./betterAuth/convex.config";

const app = defineApp({
  env: {
    AUTH_EMAIL_WEBHOOK_URL: v.string(),
    BETTER_AUTH_SECRET: v.string(),
    INVITATION_EMAIL_WEBHOOK_URL: v.optional(v.string()),
    SITE_URL: v.string(),
  },
});
app.use(betterAuth);
app.use(rateLimiterComponent);
app.use(r2);

export default app;
