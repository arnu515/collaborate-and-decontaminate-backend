import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";

export default (server: HTTPServer) => {
    return new Server(server);
};
