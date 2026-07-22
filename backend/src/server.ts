import express from "express";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcryptjs";
import { visitorRouter } from "./routes/visitor.routes";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";
import * as userService from "./services/user.service";

const app = express();
const PORT = process.env.PORT ?? 4000;

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────
app.use("/visitors", visitorRouter);
app.use("/health", healthRouter);
app.use("/auth", authRouter);

// ── Auto-seeding ──────────────────────────────────────────
async function seedUser() {
  try {
    const userCount = await userService.countUsers();
    if (userCount === 0) {
      const email = "admin@coseke.com";
      const passwordHash = await bcrypt.hash("Password123!", 10);
      const fullName = "System Administrator";
      await userService.create({ email, passwordHash, fullName });
      console.log(
        "Seeded default receptionist account: admin@coseke.com / Password123!",
      );
    }
  } catch (error) {
    console.error("Auto-seeding failed:", error);
  }
}

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  await seedUser();
});
