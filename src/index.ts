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
import { rd } from "./util/redis";
import routers from "./controllers";

const app = express();
const server = http.createServer(app);
const io = createSocketIO(server);
const RedisStore = createRedisStore(session);
io;

async function main() {
    await connect();
    console.log("Connected to database.");

    app.use(
        cors({
            credentials: true,
            origin: [process.env.WEBSITE_URL || "http://localhost:3000"],
        })
    );
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
            store: new RedisStore({ client: rd }),
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
    app.listen(PORT, () => {
        console.log("Server running on port " + PORT);
    });
}

main().catch((e) => console.error(e));
