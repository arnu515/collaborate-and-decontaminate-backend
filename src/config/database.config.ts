import type { ConnectionOptions } from "typeorm";

export const development: ConnectionOptions = {
    type: "postgres",
    url:
        process.env.POSTGRES_URL ||
        "postgres://postgres:postgres@localhost:5432/cad",
    synchronize: true,
    entities: ["src/models/**/*.ts"],
    migrations: ["src/migrations/**/*.ts"],
    subscribers: ["src/subscribers/**/*.ts"],
    cli: {
        entitiesDir: "src/models",
        migrationsDir: "src/migrations",
        subscribersDir: "src/subscribers",
    },
};

export const production: ConnectionOptions = {
    ...development,
    logging: false,
    entities: ["dist/models/**/*.js"],
    migrations: ["dist/migrations/**/*.js"],
    subscribers: ["dist/subscribers/**/*.js"],
    cli: {
        entitiesDir: "dist/models",
        migrationsDir: "dist/migrations",
        subscribersDir: "dist/subscribers",
    },
};
