import express from "express";
import cors from "cors";
import "dotenv/config";
import { visitorRouter } from "./routes/visitor.routes";
import { healthRouter } from "./routes/health.routes";

const app = express();
const PORT = process.env.PORT ?? 4000;

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────
app.use("/visitors", visitorRouter);
app.use("/health", healthRouter);

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});