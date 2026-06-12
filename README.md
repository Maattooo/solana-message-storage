# Solana Message Storage (SSMS)

A decentralized application (dApp) built on the Solana blockchain (Devnet) that allows users to create, read, update, and delete a persistent on-chain message tied to their wallet using Program Derived Addresses (PDAs).

---

## Core Features

- **On-chain Message Storage**: Tied to your wallet address using Solana PDAs derived from `["message", user_pubkey]`.
- **Custom Wallet Selection**: A customized dropdown selector that filters for installed browser extensions on desktop and provides recommended options on mobile.
- **Mobile Compatibility**: Fully optimized for mobile phone browsers, listing Solflare, MetaMask, and Backpack with interactive deep-linking and download redirects.
- **Smart UX Actions**:
  - The Create/Update button highlights yellow when active and outlines white when inactive.
  - The Update button is disabled if the input message is identical to the current on-chain message.
  - The input field is automatically cleared upon successful transaction confirmation (create, update, or delete).
  - Bypasses duplicate wallet signing requests on page refresh by persisting the tab's session authentication.

---

## Tech Stack

- **Smart Contract**: Rust, Anchor Framework
- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS, Lucide Icons

---

## Local Development Setup

To run the frontend project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/Maattooo/solana-message-storage.git
cd solana-message-storage/app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file inside the `app/` directory:
```env
# Network Node endpoint (e.g. custom RPC for speed and avoiding rate limits)
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# Solana Network Cluster
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### 4. Run the Development Server
```bash
npm run dev
```
Open http://localhost:3000 in your browser to view the dApp.

---
*Made by Maattooo.*
