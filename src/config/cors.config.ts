import type { CorsOptions } from "cors";

export default {
    credentials: true,
    origin: [process.env.WEBSITE_URL || "http://localhost:3000"],
} as CorsOptions;
