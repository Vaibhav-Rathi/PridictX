import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

// credentials: true lets the web app send the session cookie
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:4000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;
