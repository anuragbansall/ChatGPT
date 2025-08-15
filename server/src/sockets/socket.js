import { Server } from "socket.io";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
};
