# Ethereum Sepolia Faucet

A self-hosted faucet that distributes free Sepolia testnet ETH. Built with an Express/TypeScript backend and a React/Vite frontend.

## Features

- Send configurable amounts of Sepolia ETH to any valid Ethereum address
- Per-address cooldown to prevent abuse
- EIP-1559 transaction support
- Balance buffer check to keep the faucet wallet funded
- Client-side address validation for instant feedback

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- An Ethereum wallet funded with Sepolia ETH (the faucet wallet)
- A Sepolia RPC endpoint (e.g. [Alchemy](https://www.alchemy.com/), [Infura](https://www.infura.io/))

## Project Structure

```
├── backend/          Express API server
│   └── src/
│       ├── index.ts                  Server entry point
│       ├── config.ts                 Environment config loader
│       ├── routes/faucet.ts          Faucet API route
│       └── services/
│           └── ethereum-faucet.service.ts  On-chain transaction logic
├── frontend/         React single-page app
│   └── src/
│       ├── main.tsx                  React entry point
│       ├── App.tsx                   Main application component
│       └── index.css                 Global styles
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/abjR265/Ethereum-Sepolia-Faucet.git
cd Ethereum-Sepolia-Faucet
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3001` |
| `SEPOLIA_RPC_URL` | Sepolia JSON-RPC endpoint | — |
| `FAUCET_PRIVATE_KEY` | Private key of the faucet wallet (hex, without `0x` prefix) | — |
| `FAUCET_AMOUNT_ETH` | ETH amount to send per request | `0.00025` |
| `MIN_BALANCE_BUFFER` | Minimum ETH to keep in the wallet | `0.001` |
| `ADDRESS_COOLDOWN_MINUTES` | Cooldown per address between requests | `5` |
| `CORS_ORIGIN` | Allowed CORS origin(s), comma-separated. Use `*` for all origins | `*` |

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env` if your backend runs on a different host/port:

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3001` |

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Deployment

| Service | URL |
|---|---|
| **Frontend** | [https://ethereum-sepolia-faucet.vercel.app](https://ethereum-sepolia-faucet.vercel.app) |
| **Backend** | [https://ethereum-sepolia-faucet.onrender.com](https://ethereum-sepolia-faucet.onrender.com) |

Environment variables for production:

| Variable | Where | Value |
|---|---|---|
| `CORS_ORIGIN` | Backend (Render) | `https://ethereum-sepolia-faucet.vercel.app` |
| `VITE_API_URL` | Frontend (Vercel) | `https://ethereum-sepolia-faucet.onrender.com` |

## Guardrails

The faucet includes multiple layers of protection to prevent abuse and ensure reliable operation:

| Guardrail | Layer | Description |
|---|---|---|
| **Address format validation** | Frontend + Backend | Addresses are validated client-side via regex (`0x` + 40 hex chars) and server-side via ethers `isAddress()` before any transaction is attempted. |
| **Per-address cooldown** | Backend | Each address can only request funds once every `ADDRESS_COOLDOWN_MINUTES` (default: 5). Repeat requests within the window receive a `429` response. |
| **Balance buffer check** | Backend | Before sending, the service verifies the faucet wallet holds at least the send amount plus `MIN_BALANCE_BUFFER`. If funds are too low, the request is rejected with a `503` to prevent the wallet from being fully drained. |
| **Configurable send amount** | Backend | The ETH amount per request is controlled by `FAUCET_AMOUNT_ETH`, keeping individual payouts small and predictable. |
| **CORS origin restriction** | Backend | The `CORS_ORIGIN` env var controls which origins can call the API. Defaults to `*` for development; set to your frontend domain in production. |
| **Required env validation** | Backend | The server refuses to start if `SEPOLIA_RPC_URL` or `FAUCET_PRIVATE_KEY` are missing, preventing misconfigured deployments. |
| **EIP-1559 gas handling** | Backend | Transactions use EIP-1559 fee data (`maxFeePerGas` / `maxPriorityFeePerGas`) fetched at send time. If fee data is unavailable, the transaction is aborted rather than sent with bad gas params. |
| **Pending nonce management** | Backend | The nonce is fetched with the `"pending"` flag to account for in-flight transactions, preventing nonce collisions under concurrent requests. |

## API Reference

### `GET /health`

Returns server health status.

```json
{ "status": "ok", "network": "sepolia" }
```

### `POST /api/faucet`

Request testnet ETH.

**Request body:**

```json
{ "address": "0x..." }
```

**Success response (200):**

```json
{
  "network": "sepolia",
  "amount": "0.00025",
  "txHash": "0x...",
  "explorerUrl": "https://sepolia.etherscan.io/tx/0x..."
}
```

**Error responses:** `400` (invalid address), `429` (cooldown active), `503` (faucet exhausted), `500` (transaction failed).

## License

[MIT](LICENSE)
