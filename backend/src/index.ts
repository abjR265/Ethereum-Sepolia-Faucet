import express from "express";
import cors from "cors";
import { config } from "./config";
import faucetRoutes from "./routes/faucet";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", network: config.network });
});

app.use(faucetRoutes);

app.listen(config.port, () => {
  console.info("FAUCET_SERVER_START", { port: config.port });
});
