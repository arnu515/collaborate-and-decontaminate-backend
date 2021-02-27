import { Router } from "express";
import joi from "joi";
import { compareSync, hashSync, genSaltSync } from "bcryptjs";
import User from "../models/User";
import * as jwt from "../util/jwt";
import { auth } from "../middlewares/auth";

const router = Router();

router.post("/register", async (req, res) => {
    const schema = joi.object({
        email: joi.string().email().required().max(2048),
        password: joi.string().min(8).max(128).required(),
        username: joi.string().min(4).max(32).required(),
    });
    const { value, error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: true,
            message: error.message,
            data: {},
        });
    }

    const { email, password, username } = value;

    let user = await User.findOne({ where: { email } });
    if (user) {
        return res.status(400).json({
            success: true,
            message: "Email already registered",
            data: {},
        });
    }

    user = await User.findOne({ where: { username } });
    if (user) {
        return res.status(400).json({
            success: true,
            message: "Username taken",
            data: {},
        });
    }

    user = User.create({
        email,
        username,
        password: hashSync(password, genSaltSync(12)),
    });

    await user.save();

    const token = jwt.createToken(user);
    (req.session as any).token = token;

    return res
        .status(200)
        .json({ success: true, message: "Registered", data: { user, token } });
});

router.post("/login", async (req, res) => {
    const schema = joi.object({
        email: joi.string().email().required().max(2048),
        password: joi.string().min(8).max(128).required(),
    });
    const { value, error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: true,
            message: error.message,
            data: {},
        });
    }

    const { email, password } = value;

    let user = await User.findOne({ where: { email } });
    if (!user) {
        return res.status(400).json({
            success: true,
            message: "Invalid email",
            data: {},
        });
    }

    if (!compareSync(password, user.password))
        return res.status(400).json({
            success: true,
            message: "Invalid password",
            data: {},
        });

    const token = await jwt.createToken(user);
    (req.session as any).token = token;

    return res
        .status(200)
        .json({ success: true, message: "Logged in", data: { user, token } });
});

router.get("/user", auth, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "User found",
        data: { user: (req as any).user },
    });
});

router.get("/token", auth, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Token",
        data: { token: (req.session as any).token },
    });
});

router.delete("/logout", auth, async (req, res) => {
    const { token } = req.session as any;
    const { user } = req as any;
    if (token) {
        await jwt.blacklistToken(token);
        delete (req.session as any).token;
        delete (req as any).user;
    }

    return res
        .status(200)
        .json({ success: true, message: "Logged out", data: { user } });
});

export default router;
