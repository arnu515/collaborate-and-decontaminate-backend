if (process.env.NODE_ENV || "development" === "development") {
    require("dotenv").config(require("path").join(__dirname, "../.env"));
}

import * as express from "express";
import * as http from "http";
import createSocketIO from "./io";
import { connect } from "./database";
import * as cors from "cors";
import * as morgan from "morgan";
import * as session from "express-session";
import * as createRedisStore from "connect-redis";
import * as Redis from "ioredis";
import routers from "./controllers";
import corsConfig from "./config/cors.config";
import chatSocketIO from "./io/chat";

const app = express();
const server = http.createServer(app);
const io = createSocketIO(server, { cors: corsConfig, serveClient: false });
const RedisStore = createRedisStore(session);

chatSocketIO(io);

async function main() {
    await connect();
    console.log("Connected to database.");

    app.use(cors(corsConfig));
    app.use(express.json());
    app.use(
        morgan(
            process.env.NODE_ENV || "development" === "development"
                ? "dev"
                : "short"
        )
    );
    app.use(
        session({
            store: new RedisStore({
                client: new Redis(
                    process.env.SESSION_REDIS_URL ||
                        process.env.REDIS_URL ||
                        "redis://localhost:6379/1"
                ),
            }),
            secret: process.env.SESSION_SECRET || "secret123",
            resave: true,
            saveUninitialized: true,
            cookie: {
                maxAge: 3600 * 24 * 1000,
            },
        })
    );

    routers.forEach((r) => {
        app.use(r.path, r.router);
    });

    const { PORT = 5000 } = process.env;
    server.listen(PORT, () => {
        console.log("Server running on port " + PORT);
    });
}

main().catch((e) => console.error(e));
