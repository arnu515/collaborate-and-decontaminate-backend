import { createConnection } from "typeorm";
import * as dbConfig from "./config/database.config";

export const connect = () => {
    return createConnection(
        (dbConfig as any)[process.env.NODE_ENV || "development"] ||
            dbConfig.development
    );
};
