import { createTool } from "@convex-dev/agent";
import { z } from "zod";

/**
 * Tool for fetching live/simulated weather conditions.
 */
export const getWeatherTool = createTool({
  description:
    "Get the current weather forecast, temperature, wind, and conditions for a given location.",
  inputSchema: z.object({
    location: z
      .string()
      .describe("The city and optional country/state, e.g. 'Berlin' or 'Tokyo, Japan'"),
  }),
  execute: async (_ctx, args) => {
    const loc = args.location.toLowerCase();
    let temp = "16.4°C / 61.5°F";
    let condition = "Partly cloudy with a gentle breeze";
    let wind = "9.6 mph with gusts reaching up to 20.2 mph";

    if (loc.includes("berlin")) {
      temp = "16.4°C / 61.5°F (feels like 14.8°C due to wind)";
      condition = "Clear evening with cool breezes";
      wind = "9.6 mph north-northwest";
    } else if (loc.includes("denver")) {
      temp = "8°C / 46.4°F";
      condition = "Crisp, sunny alpine air";
      wind = "5.2 mph";
    } else if (loc.includes("tokyo")) {
      temp = "21.0°C / 69.8°F";
      condition = "Mild and humid with light drizzle";
      wind = "6.1 mph";
    }

    return {
      location: args.location,
      temperature: temp,
      condition,
      wind,
      humidity: "62%",
      updatedAt: new Date().toLocaleTimeString(),
    };
  },
});

/**
 * Tool for retrieving user preferences and styling recommendations.
 */
export const getUserPreferencesTool = createTool({
  description:
    "Retrieve user fashion preferences, favorite palettes, and clothing staples for personalized recommendations.",
  inputSchema: z.object({
    category: z
      .string()
      .optional()
      .describe("Category of preferences, e.g. 'fashion', 'weather', or 'colors'"),
  }),
  execute: async (_ctx, _args) => {
    return {
      stylePreference: "Layered Smart Casual with chic accents",
      colorPalette: ["Navy Blue", "Charcoal Grey", "Emerald Green", "Camel / Earth tones"],
      stapleItems: [
        "Tailored trousers",
        "Light wool knit sweaters",
        "Chelsea boots",
        "Structured trench coat",
      ],
      comfortPriority: "High mobility and wind protection",
      accessories: ["Cashmere beanie / scarf", "Minimalist leather crossbody bag"],
    };
  },
});
