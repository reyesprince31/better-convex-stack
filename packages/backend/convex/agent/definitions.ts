import { openai } from "@ai-sdk/openai";
import { Agent, stepCountIs } from "@convex-dev/agent";

import { components } from "../_generated/api";
import { getUserPreferencesTool, getWeatherTool } from "./tools";

/**
 * Primary AI Assistant built with @convex-dev/agent.
 */
export const agent = new Agent(components.agent, {
  name: "Antigravity Assistant",
  languageModel: openai.chat("gpt-4o-mini"),
  instructions:
    "You are Antigravity Assistant, an intelligent, helpful, and concise AI assistant built with Convex and Better Stack. Provide clear, accurate, and markdown-formatted answers. When asked about weather, use the getWeather tool.",
  tools: {
    getWeather: getWeatherTool,
    getUserPreferences: getUserPreferencesTool,
  },
  stopWhen: stepCountIs(5),
});
