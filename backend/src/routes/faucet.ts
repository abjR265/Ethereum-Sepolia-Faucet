import { Router, Request, Response } from "express";
import { EthereumFaucetService } from "../services/ethereum-faucet.service";
import { config } from "../config";

const router = Router();
const faucetService = new EthereumFaucetService();

const COOLDOWN_MS = config.addressCooldownMinutes * 60 * 1000;
const addressLastRequest = new Map<string, number>();

router.post("/api/faucet", async (req: Request, res: Response) => {
  const address = req.body?.address;
  console.info("FAUCET_REQUEST", { address: address ?? "missing" });

  if (!address || typeof address !== "string") {
    return res.status(400).json({
      error: "INVALID_ADDRESS",
      message: "The provided Ethereum address is not valid. Please check and try again.",
    });
  }

  const now = Date.now();
  const addressCooldown = addressLastRequest.get(address.toLowerCase());
  if (addressCooldown != null && now - addressCooldown < COOLDOWN_MS) {
    return res.status(429).json({
      error: "COOLDOWN_ACTIVE",
      message: "This address has recently received funds. Please wait 5 minutes before requesting again.",
    });
  }

  try {
    const { txHash, amount } = await faucetService.sendFunds(address);
    addressLastRequest.set(address.toLowerCase(), now);

    console.info("FAUCET_TX_SENT", { address, txHash });

    return res.json({
      network: config.network,
      amount,
      txHash,
      explorerUrl: `https://sepolia.etherscan.io/tx/${txHash}`,
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : "UNKNOWN_ERROR";

    if (code === "INVALID_ADDRESS") {
      return res.status(400).json({
        error: "INVALID_ADDRESS",
        message: "The provided Ethereum address is not valid. Please check and try again.",
      });
    }

    if (code === "FAUCET_EXHAUSTED") {
      return res.status(503).json({
        error: "FAUCET_EXHAUSTED",
        message: "The faucet has temporarily run out of available funds. Please try again later.",
      });
    }

    if (code === "TRANSACTION_FAILED") {
      console.error("FAUCET_ERROR", { address, error: code });
      return res.status(500).json({
        error: "TRANSACTION_FAILED",
        message: "Transaction submission failed due to a network issue. Please try again.",
      });
    }

    console.error("FAUCET_ERROR", { address, error: code });
    return res.status(500).json({
      error: "TRANSACTION_FAILED",
      message: "Transaction submission failed due to a network issue. Please try again.",
    });
  }
});

export default router;
