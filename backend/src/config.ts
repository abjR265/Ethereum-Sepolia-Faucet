import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  network: "sepolia" as const,
  sepoliaRpcUrl: process.env.SEPOLIA_RPC_URL ?? "",
  faucetPrivateKey: process.env.FAUCET_PRIVATE_KEY ?? "",
  faucetAmountEth: process.env.FAUCET_AMOUNT_ETH ?? "0.00025",
  minBalanceBufferEth: process.env.MIN_BALANCE_BUFFER ?? "0.001",
  addressCooldownMinutes: parseInt(process.env.ADDRESS_COOLDOWN_MINUTES ?? "5", 10),
};
