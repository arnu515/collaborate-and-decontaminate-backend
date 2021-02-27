import { Server, ServerOptions } from "socket.io";
import type { Server as HTTPServer } from "http";

export default (server: HTTPServer, options?: Partial<ServerOptions>) => {
    return new Server(server, options);
};
