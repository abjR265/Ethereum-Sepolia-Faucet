import express from "express";
import cors from "cors";
import { config } from "./config";
import faucetRoutes from "./routes/faucet";

const app = express();

const corsOrigin = config.corsOrigin === "*"
  ? "*"
  : config.corsOrigin.split(",").map((o) => o.trim());

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", network: config.network });
});

app.use(faucetRoutes);

app.listen(config.port, () => {
  console.info("FAUCET_SERVER_START", { port: config.port });
});
