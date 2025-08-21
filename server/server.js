import app from "./src/app.js";
import { PORT } from "./src/config/config.js";
import connectDb from "./src/lib/connectDb.js";
import { initSocket } from "./src/sockets/socket.js";
import { createServer } from "http";

const httpServer = createServer(app);

initSocket(httpServer);

const startServer = async () => {
  await connectDb();

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
