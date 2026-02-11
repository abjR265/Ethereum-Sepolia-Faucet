import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  network: "sepolia" as const,
  sepoliaRpcUrl: requireEnv("SEPOLIA_RPC_URL"),
  faucetPrivateKey: requireEnv("FAUCET_PRIVATE_KEY"),
  faucetAmountEth: process.env.FAUCET_AMOUNT_ETH ?? "0.00025",
  minBalanceBufferEth: process.env.MIN_BALANCE_BUFFER ?? "0.001",
  addressCooldownMinutes: parseInt(process.env.ADDRESS_COOLDOWN_MINUTES ?? "5", 10),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
};
