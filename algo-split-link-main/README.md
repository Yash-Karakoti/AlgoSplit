# AlgoSplit

**Split payments effortlessly on Algorand using ALGO**

AlgoSplit is a consumer app on Algorand that makes splitting payments and shared bills effortless. Create payment links that your friends or family can click and pay their share using ALGO.

## Features

- 💰 **ALGO Payments** - Fast and secure blockchain payments
- 🔗 **Shareable Links** - Easy payment link sharing across any device
- 👥 **Multi-participant Support** - Split bills between any number of people
- 🔐 **Secure** - Built on Algorand blockchain with Supabase backend
- 🎨 **Beautiful UI** - Modern, responsive design
- 🔌 **Multiple Wallets** - Support for Pera, Defly, and Lute wallets
- 📊 **Payment History** - Track your created and contributed payments
- ✅ **Auto-Completion** - Payment links stop accepting when target is reached

## How It Works

1. **Create** - Create a payment link with total amount and number of participants
2. **Share** - Send the link to your friends/family
3. **Pay** - Each person clicks and pays their share using their Algorand wallet
4. **Complete** - Payment link stops accepting new contributions when target is reached

## Example

If you create a payment link for 100 ALGO split between 5 people:
- Each participant pays exactly 20 ALGO
- Payment link accepts exactly 5 payments of 20 ALGO each
- After 5 payments, the link stops working (status: completed)
- Funds go directly to the specified receiver address

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Algorand wallet (Pera, Defly, or Exodus)

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project
cd algo-split-link-main

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ALGORAND_NETWORK=testnet
```

Get your Supabase credentials:
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL from `supabase-schema.sql` in the SQL Editor
4. Get your credentials from Settings → API

For mainnet production:
```env
VITE_ALGORAND_NETWORK=mainnet
```

### Getting Testnet Funds

1. Visit [Algorand Testnet Dispenser](https://dispenser.testnet.algorand.network/)
2. Enter your Algorand wallet address
3. Get testnet ALGO

## Usage

### Creating a Payment Link

1. Click "Connect Wallet" in the navbar
2. Select your preferred Algorand wallet
3. Navigate to "Create Payment"
4. Fill in the payment details:
   - Title and description
   - Total amount in ALGO
   - Number of participants
   - Receiver address (automatically filled from your wallet)
   - Optional expiry date
5. Click "Create Payment Link"

### Making a Payment

1. Open the payment link
2. Connect your wallet
3. Click "Pay" to contribute your share
4. Confirm the transaction in your wallet
5. Wait for confirmation (usually 4-5 seconds)

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Blockchain**: Algorand SDK (algosdk)
- **Wallets**: Pera Wallet, Defly, Lute (via TxnLab SDK)
- **Backend**: Supabase (PostgreSQL)
- **State**: React Context API

## Project Structure

```
src/
├── components/        # React components
│   ├── ui/            # shadcn/ui components
│   └── ConnectWallet.tsx
├── contexts/          # React contexts
│   └── PaymentContext.tsx
├── lib/
│   ├── algorand/      # Algorand integration
│   │   ├── config.ts
│   │   └── simplePayment.ts
│   └── supabase/      # Supabase integration
│       └── config.ts
└── pages/             # Page components
    ├── Landing.tsx
    ├── CreatePayment.tsx
    ├── JoinPayment.tsx
    ├── PaymentGenerated.tsx
    └── MyPayments.tsx
```

## Security

- All transactions are signed by user wallets
- No private keys are stored
- Duplicate payment prevention
- Expiry date enforcement
- Row Level Security (RLS) in Supabase
- Data persistence across devices

## Edge Cases Handled

✅ Duplicate contributions (user can only contribute once)  
✅ Payment expiry  
✅ Exact amount validation  
✅ Balance checks before transaction  
✅ Network connectivity issues  
✅ Wallet disconnection handling  
✅ Insufficient balance handling  

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT

## Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Vercel:
```bash
npm install -g vercel
vercel
```

## Links

- [Algorand Documentation](https://developer.algorand.org/)
- [Pera Wallet](https://perawallet.app/)
- [Defly Wallet](https://defly.app/)
- [Supabase](https://supabase.com/)

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ on Algorand
