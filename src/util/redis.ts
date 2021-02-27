import Redis from "ioredis";

export const rd = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379/0"
);
