import express from "express";
import authRouter from "./routes/auth.js";
import { connectToDb } from "./models/User.js";
import mongoose from "mongoose";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "Todo REST API",
    version: "1.0.0",
    links: {
      api: "/api",
      health: "/health",
      todos: "/api/users",
    },
  });
});

app.use('/api/auth', authRouter);

async function startServer() {
  try {
    await connectToDb();

    app.listen(PORT, () => {
      console.log("Server started on port 3000");
    });

  } catch(err) {
    console.log("Failed to start server: ", err)
    process.exit(1);
  }
}

startServer()