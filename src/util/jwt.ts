import { sign, verify } from "jsonwebtoken";
import { rd } from "./redis";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/jwt.config";
import User from "../models/User";

export async function validateToken(token: string): Promise<User | null> {
    if (!(await rd.sismember("tokens", token))) {
        return null;
    }

    const identity = verify(token, JWT_SECRET) as {
        id?: number;
        type?: "access";
    };

    const userId: number | null = identity?.id ?? null;

    const user = await User.findOne(userId);

    return user;
}

export async function createToken(user: User) {
    const token = sign({ id: user.id, type: "access" }, JWT_SECRET, {
        expiresIn: parseInt(JWT_EXPIRES_IN),
    });

    await rd.sadd("tokens", token);
    await rd.expire("tokens", parseInt(JWT_EXPIRES_IN));

    return token;
}

export async function blacklistToken(token: string) {
    if (!(await rd.sismember("tokens", token))) {
        return false;
    }

    await rd.srem("tokens", token);
    await rd.expire("tokens", parseInt(JWT_EXPIRES_IN));

    return true;
}
