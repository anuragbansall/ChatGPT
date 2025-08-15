import app from "./src/app.js";
import { PORT } from "./src/config/config.js";
import connectDb from "./src/config/connectDb.js";
import { initSocket } from "./src/sockets/socket.js";
import { createServer } from "http";

const server = createServer(app);

initSocket(server);

const startServer = async () => {
  await connectDb();
  
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
