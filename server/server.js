import app from "./src/app.js";
import { PORT } from "./src/config/config.js";
import connectDb from "./src/config/connectDb.js";

const startServer = async () => {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
