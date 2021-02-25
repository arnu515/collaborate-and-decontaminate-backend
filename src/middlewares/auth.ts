import * as jwt from "../util/jwt";
import type { Request, Response } from "express";

export async function auth(req: Request, res: Response, next: () => void) {
    let { token } = req.session as any;

    if (!token) {
        const authHeader = req.headers.authorization as string;

        if (typeof authHeader !== "string") {
            return res.status(401).json({
                success: false,
                message: "This endpoint requires authorization",
            });
        }

        const AHS = authHeader.split(" ");
        if (AHS.length !== 2 || AHS[0].toLowerCase() !== "bearer") {
            return res.status(401).json({
                success: false,
                message: "This endpoint requires authorization",
            });
        }
        token = AHS[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "This endpoint requires authorization",
            });
        }
        (req.session as any).token = token;
    }

    const user = await jwt.validateToken(token);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }

    (req as any).user = user;
    next();
}
