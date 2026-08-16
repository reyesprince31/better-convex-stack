import agent from "@convex-dev/agent/convex.config";
import rateLimiterComponent from "@convex-dev/rate-limiter/convex.config";
import r2 from "@convex-dev/r2/convex.config";
import resend from "@convex-dev/resend/convex.config";
import { defineApp } from "convex/server";
import { v } from "convex/values";

import betterAuth from "./betterAuth/convex.config";

const app = defineApp({
  env: {
    BETTER_AUTH_SECRET: v.string(),
    SITE_URL: v.string(),
    EMAIL_FROM: v.optional(v.string()),
    RESEND_API_KEY: v.optional(v.string()),
    RESEND_WEBHOOK_SECRET: v.optional(v.string()),
    OPENAI_API_KEY: v.optional(v.string()),
  },
});
app.use(betterAuth);
app.use(rateLimiterComponent);
app.use(r2);
app.use(resend);
app.use(agent);

export default app;
