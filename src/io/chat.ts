import { rd } from "../util/redis";
import { promisify } from "util";
import { socketIOAuth } from "../middlewares/auth";
import type { Server, Socket } from "socket.io";
import User from "../models/User";

export default (io_: Server) => {
    const io = io_.of("/chat");

    io.on("connection", async (socket: Socket) => {
        const auth = promisify(socketIOAuth);
        try {
            await auth(socket);
        } catch (e) {
            socket.emit("error:connect", e);
        }

        const user: User = (socket as any).user;
        await rd.hset("socket:user", socket.id, user.id);
        await rd.hset("user:socket", user.id, socket.id);
        await rd.sadd("queue", user.id);
        socket.join("queue");
        io.to("queue").emit("new-user", await User.findOne(user.id), socket.id);

        socket.emit(
            "users",
            await User.findByIds(
                (await rd.smembers("queue")).map((i) => parseInt(i))
            )
        );

        // Events
        socket.on("disconnect", async () => {
            await rd.hdel("socket:user", socket.id);
            await rd.hdel("user:socket", user.id.toString());
            await rd.srem("queue", user.id.toString());

            if (io._rooms.has("queue"))
                io.to("queue").emit(
                    "remove-user",
                    await User.findOne(user.id),
                    socket.id
                );
            else {
                const socketId = await rd.hget("chat", socket.id);
                io.sockets.get(socketId)?.emit("user-left");
                await rd.hdel("chat", socket.id);
            }
        });

        socket.on("request-chat", async (userId: number) => {
            const u = await User.findOne(userId);
            if (!u) socket.emit("error:request-chat", "User not found");

            const socketId = await rd.hget("user:socket", u.id.toString());
            if (!socketId) socket.emit("error:request-chat", "User not found");

            io.sockets.get(socketId)?.emit("chat-request", user, socket.id);
        });

        socket.on("deny-chat-request", async (userId: number) => {
            const u = await User.findOne(userId);
            if (!user) socket.emit("error:request-chat", "User not found");

            const socketId = await rd.hget("user:socket", u.id.toString());
            if (!socketId) socket.emit("error:request-chat", "User not found");

            io.sockets.get(socketId)?.emit("chat-denied", user, socket.id);
        });

        socket.on("accept-chat-request", async (userId: number) => {
            const u = await User.findOne(userId);
            if (!u) socket.emit("error:request-chat", "User not found");

            const socketId = await rd.hget("user:socket", u.id.toString());
            if (!socketId) socket.emit("error:request-chat", "User not found");

            socket.leave("queue");
            io.sockets.get(socketId)?.leave("queue");
            io.sockets.get(socketId)?.emit("chat-accepted", user, socket.id);

            await rd.srem("queue", u.id);
            await rd.srem("queue", user.id);

            await rd.hset("chat", socket.id, socketId);
            await rd.hset("chat", socketId, socket.id);
        });

        socket.on("chat", async (message: string) => {
            io.sockets
                .get(await rd.hget("chat", socket.id))
                ?.emit("chat", message);
        });
    });
};
