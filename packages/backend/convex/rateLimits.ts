import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";

import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  accountDeletionAttempt: {
    kind: "fixed window",
    rate: 5,
    period: 15 * MINUTE,
  },
  adminSensitiveOperation: {
    kind: "token bucket",
    rate: 10,
    period: HOUR,
    capacity: 10,
  },
});
