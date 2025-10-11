import connectDB from "./DB/connection.js";
import authRoutes from "./modules/authModule/auth.controller.js";

import userRoutes from "./modules/userModule/user.controller.js";
import { NotFoundException } from "./utils/exceptions.js";
import morgan from "morgan";
import chalk from "chalk";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { messageRoutes } from "./modules/massageModule/message.controller.js";

const bootstrap = async (app, express) => {
  const port = process.env.PORT;

  app.use(cors());
  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: 2 * 60 * 1000,
      limit: 10,
      legacyHeaders: false,
      standardHeaders: true,
    })
  );

  app.use(express.json());
  app.use(morgan("combined"));

  await connectDB();

  app.use("/users", userRoutes);
  app.use("/auth", authRoutes);
  app.use("/messages", messageRoutes);
  app.use("/uploads", express.static("./uploads"));

  // app.all("*", (req, res, next) => {
  //   return next(new NotFoundException());
  // });

  app.use((err, req, res, next) => {
    res.status(err.cause || 500).json({
      errMsg: err.message || "Internal Server Error",
      status: err.cause || 500,
    });
  });

  app.listen(port, () => {
    console.log(chalk.yellow.italic.bold(`Server started on port ${port}`));
  });
};

export default bootstrap;
