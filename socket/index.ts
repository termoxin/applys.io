import { Server, Socket } from "socket.io";

let socket: Socket;

export const getSocket = async (): Promise<Socket | undefined> =>
  new Promise((resolve) => {
    if (socket) {
      resolve(socket);
    } else {
      const io = new Server(3001);

      io.on("connection", (io) => {
        socket = io;
        resolve(socket);
      });
    }
  });
