# Solana Message Storage (SSMS) dApp

A premium, state-of-the-art decentralized application built on the Solana blockchain (Devnet) that allows users to create, read, update, and delete a persistent on-chain message tied to their wallet using Program Derived Addresses (PDAs).

---

## Key Features

### 1. Smart Contract (Anchor Program)
- Uses Solana PDAs derived from `["message", user_pubkey]` to store individual messages securely.
- Program bounds messages to a maximum length of 280 characters with custom on-chain validation (`ErrorCode::MessageTooLong`).
- Supports zero-copy state reallocations on updates to minimize rent/fees.

### 2. Custom Wallet Selector
- **Extension Auto-Detection**: Scans the user's browser for installed wallet extensions (such as Phantom, Backpack) and highlights active wallets with a green `Detected` badge.
- **Smart Recommendations**: If no browser wallet is detected, prompts the user with a download action to install the Backpack wallet.
- **Wallet Standard Integration**: Fully integrated with the Solana Wallet Standard for automatic wallet registration, avoiding legacy adapter bloat.

### 3. Universal Mobile & Deep Link Support
- **Browser Detection**: Detects mobile user agents (iOS/Android) and displays compatible mobile wallets (Phantom, Solflare, Backpack) labeled as `Mobile Link`.
- **Backpack Mobile Redirection**: Provides a custom redirection link that opens the dApp inside the Backpack App's in-app browser utilizing `https://backpack.app/open?uri=<dapp_url>`.
- **In-App Browser Injection**: Natively connects to the user's wallet of choice when opened from mobile apps.

### 4. Optimized UX & Micro-interactions
- **Conditional Action Triggers**:
  - The **Create/Update** button dynamically lights up in **yellow** when active/enabled and dims to a **white outline** state when disabled.
  - The **Update** button remains disabled if the message in the input field matches the current on-chain message.
- **Dynamic Icons**: Shows a green circle button next to the delete trash icon:
  - Displays the `Edit3` (pencil) icon when the text input field is empty (clicking it pre-fills the current message).
  - Displays the `Eraser` icon when the input is populated (clicking it clears the field).
- **Transaction Lifecycle Cleanup**: Automatically clears the input field upon successful transaction confirmation (Create, Update, Delete).
- **Render Loop Prevention**: Data fetching is completely decoupled from signing context hooks, ensuring stable background refreshes with zero rendering loops.

---

## Tech Stack
- **Smart Contract**: Rust, Anchor Framework
- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS
- **State & Wallet**: `@solana/web3.js`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-react-ui`, `lucide-react`

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
Create a `.env` (or `.env.local`) file inside the `app/` directory:
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
Open [http://localhost:3000](http://localhost:3000) in your browser.

