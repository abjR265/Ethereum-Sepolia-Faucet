import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io";
const ETHEREUM_ORG = "https://ethereum.org";

const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function isValidEthAddress(addr: string): boolean {
  return ETH_ADDRESS_RE.test(addr.trim());
}

type Status = "idle" | "loading" | "success" | "error";

interface SuccessData {
  txHash: string;
  explorerUrl: string;
  amount: string;
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 14h6M9 18h6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default function App() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SuccessData | null>(null);

  const trimmedAddress = address.trim();
  const addressInvalid = trimmedAddress.length > 0 && !isValidEthAddress(trimmedAddress);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (!trimmedAddress || !isValidEthAddress(trimmedAddress)) {
      setError("Please enter a valid Ethereum address (0x followed by 40 hex characters).");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(`${API_URL}/api/faucet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message ?? data.error ?? "Request failed");
        setStatus("error");
        return;
      }

      setSuccess({
        txHash: data.txHash,
        explorerUrl: data.explorerUrl,
        amount: data.amount,
      });
      setStatus("success");
    } catch {
      setError("Network error");
      setStatus("error");
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-logo">
          <img src="/favicon.png" alt="Sepolia Faucet logo" style={{ width: 28, height: 28, borderRadius: "50%" }} />
          <span>Sepolia Faucet</span>
        </div>
        <nav className="header-nav">
          <a href={SEPOLIA_EXPLORER} target="_blank" rel="noopener noreferrer">Explorer</a>
          <a href="https://docs.alchemy.com" target="_blank" rel="noopener noreferrer">Docs</a>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <span className="badge">Ethereum Testnet</span>
          <h1>Sepolia <span className="accent">Faucet</span></h1>
          <p className="hero-sub">
            Get free testnet ETH to build, test, and deploy your smart contracts on Ethereum Sepolia.
          </p>
        </section>

        <div className="faucet-card">
          <form onSubmit={handleSubmit}>
            <label htmlFor="address">Ethereum Address</label>
            <input
              id="address"
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={status === "loading"}
              autoComplete="off"
              aria-invalid={addressInvalid || undefined}
              className={addressInvalid ? "input-invalid" : undefined}
            />
            {addressInvalid && (
              <p className="input-hint">Address must be 0x followed by 40 hex characters.</p>
            )}
            <button type="submit" disabled={status === "loading" || addressInvalid || !trimmedAddress}>
              {status === "loading" ? "Sending…" : "Request Sepolia ETH"}
            </button>
          </form>

          {status === "success" && success && (
            <div className="success-box">
              <p>Sent {success.amount} ETH.</p>
              <a href={success.explorerUrl} target="_blank" rel="noopener noreferrer">
                View on Etherscan →
              </a>
            </div>
          )}

          {status === "error" && error && <p className="error-msg">{error}</p>}
        </div>

        <section className="how">
          <h2>How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-icon"><ClipboardIcon /></div>
              <h3>Paste your address</h3>
              <p>Enter your Ethereum wallet address starting with 0x.</p>
            </div>
            <div className="step">
              <div className="step-icon"><SendIcon /></div>
              <h3>Request ETH</h3>
              <p>Click the button to submit your request to the faucet.</p>
            </div>
            <div className="step">
              <div className="step-icon"><CheckIcon /></div>
              <h3>Receive testnet ETH</h3>
              <p>Funds arrive in seconds. Verify on Etherscan.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>Sepolia testnet faucet. Funds have no real value.</span>
        <div className="footer-links">
          <a href={SEPOLIA_EXPLORER} target="_blank" rel="noopener noreferrer">Etherscan</a>
          <a href={ETHEREUM_ORG} target="_blank" rel="noopener noreferrer">Ethereum.org</a>
        </div>
      </footer>
    </>
  );
}
