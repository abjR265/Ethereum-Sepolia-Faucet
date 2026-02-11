import { JsonRpcProvider, Wallet, isAddress, parseEther, formatEther } from "ethers";
import { config } from "../config";

export interface SendFundsResult {
  txHash: string;
  amount: string;
}

export class EthereumFaucetService {
  private provider: JsonRpcProvider;
  private wallet: Wallet;

  constructor() {
    if (!config.sepoliaRpcUrl || !config.faucetPrivateKey) {
      throw new Error("SEPOLIA_RPC_URL and FAUCET_PRIVATE_KEY must be set");
    }
    this.provider = new JsonRpcProvider(config.sepoliaRpcUrl);
    this.wallet = new Wallet(config.faucetPrivateKey, this.provider);
  }

  async getBalance(): Promise<bigint> {
    return this.provider.getBalance(this.wallet.address);
  }

  async sendFunds(to: string): Promise<SendFundsResult> {
    if (!isAddress(to)) {
      throw new Error("INVALID_ADDRESS");
    }

    const amountWei = parseEther(config.faucetAmountEth);
    const bufferWei = parseEther(config.minBalanceBufferEth);
    const requiredMinimum = amountWei + bufferWei;

    const balance = await this.getBalance();
    if (balance < requiredMinimum) {
      throw new Error("FAUCET_EXHAUSTED");
    }

    const nonce = await this.provider.getTransactionCount(this.wallet.address, "pending");
    const feeData = await this.provider.getFeeData();
    if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
      throw new Error("TRANSACTION_FAILED");
    }

    const tx = await this.wallet.sendTransaction({
      to,
      value: amountWei,
      nonce,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      type: 2,
    });

    const amount = formatEther(amountWei);
    return { txHash: tx.hash, amount };
  }
}
