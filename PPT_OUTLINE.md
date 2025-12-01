# AlgoSplit - Presentation Outline

## Slide 1: Project Name and Tagline
**Title:** AlgoSplit
**Tagline:** "Decentralized Payment Splitting on Algorand"
**Subtitle:** Split bills, share payments, and fund projects effortlessly with blockchain technology

**Visual Elements:**
- AlgoSplit logo/branding
- Algorand blockchain visual
- Modern, clean design

**Key Points:**
- Built on Algorand blockchain
- Live at: algosplit.vercel.app
- Fast, secure, decentralized payments

---

## Slide 2: Problem Statement
**Title:** The Problem We're Solving

**Main Points:**
- **Traditional payment splitting is cumbersome**
  - Manual calculations and tracking
  - Multiple payment apps and platforms
  - Trust issues with intermediaries
  - High transaction fees
  - Slow settlement times

- **Current solutions have limitations**
  - Centralized platforms control funds
  - Geographic restrictions
  - Privacy concerns
  - Limited transparency

- **Blockchain can solve this**
  - But existing solutions are complex or expensive

**Visual:** Comparison chart showing pain points vs. ideal solution

---

## Slide 3: Overview and Our Solution
**Title:** AlgoSplit - Our Solution

**What is AlgoSplit?**
- Decentralized payment splitting application
- Built on Algorand blockchain
- Enables effortless bill splitting and payment sharing
- Uses shareable payment links

**How It Works:**
1. **Create** - Generate a payment link with total amount and participants
2. **Share** - Send link to friends/family via any platform
3. **Pay** - Each person contributes using their Algorand wallet
4. **Complete** - Funds automatically distributed when target is reached

**Key Innovation:**
- Smart contract escrow system for secure fund holding
- Automatic distribution when payment target is met
- Support for ALGO and USDCa tokens
- No intermediaries, no trust required

**Visual:** Simple flow diagram or infographic

---

## Slide 4: Technical Architecture
**Title:** Technical Architecture

**System Components:**

**Frontend:**
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS + shadcn/ui
- Wallet integration (Pera, Defly, Lute)
- Deployed on Vercel

**Blockchain Layer:**
- Algorand blockchain
- Smart contracts (PuyaPy)
  - Escrow Claim Link Contract
  - Payment Split Contract
- Fast, low-cost transactions (4-5 second confirmation)

**Backend:**
- Supabase (PostgreSQL)
- Payment metadata storage
- Real-time updates
- Row Level Security (RLS)

**Architecture Diagram:**
```
Frontend (React/Vercel)
    ↓
Algorand Blockchain ← → Supabase Database
    ↓
Smart Contracts    Payment History
```

**Key Technical Highlights:**
- Decentralized architecture
- Secure wallet-based authentication
- Real-time payment tracking
- Smart contract escrow for security

---

## Slide 5: User Flow
**Title:** User Journey

**Flow 1: Creating a Payment Split**
1. User connects Algorand wallet
2. Navigates to "Create Payment"
3. Enters details:
   - Title and description
   - Total amount (ALGO/USDCa)
   - Number of participants
   - Receiver address
   - Optional expiry date
4. Generates shareable link
5. Shares link with participants

**Flow 2: Contributing to Payment**
1. Participant opens payment link
2. Connects their Algorand wallet
3. Views payment details and their share
4. Clicks "Pay" button
5. Confirms transaction in wallet
6. Receives confirmation (4-5 seconds)
7. Payment link updates in real-time

**Flow 3: Payment Completion**
1. When target amount reached
2. Link automatically stops accepting payments
3. Funds distributed to receiver
4. All participants notified

**Visual:** Step-by-step flow diagram with icons

---

## Slide 6: Use Cases
**Title:** Real-World Use Cases

**1. Group Dining & Bills**
- Split restaurant bills among friends
- Each person pays their exact share
- No need to calculate or chase payments

**2. Event Funding**
- Crowdfund events or parties
- Multiple contributors, one receiver
- Automatic completion when goal reached

**3. Shared Expenses**
- Roommates splitting rent/utilities
- Family members sharing costs
- Transparent, trackable payments

**4. One-Time Payments (Claim Links)**
- Secure escrow-based payments
- Sender funds held until receiver claims
- Perfect for services or goods

**5. International Payments**
- Borderless transactions
- Fast settlement (4-5 seconds)
- Low fees on Algorand

**Visual:** Icons or images representing each use case

---

## Slide 7: Key Features
**Title:** Key Features

**Core Features:**
- ✅ **Multi-Participant Support** - Split between any number of people
- ✅ **Shareable Links** - Easy sharing across any device/platform
- ✅ **Smart Contract Escrow** - Secure fund holding and automatic distribution
- ✅ **Dual Token Support** - ALGO and USDCa (ASA) tokens
- ✅ **Multiple Wallets** - Pera, Defly, and Lute wallet support
- ✅ **Real-Time Tracking** - Live payment status updates
- ✅ **Auto Completion** - Stops accepting when target reached
- ✅ **Payment History** - Track all created and contributed payments
- ✅ **Expiry Management** - Optional expiry dates for time-sensitive payments
- ✅ **Beautiful UI** - Modern, responsive design

**Security Features:**
- 🔒 Wallet-based authentication (no passwords)
- 🔒 No private key storage
- 🔒 Duplicate payment prevention
- 🔒 Blockchain-level security
- 🔒 Transparent transaction history

**Technical Advantages:**
- ⚡ Fast transactions (4-5 second confirmation)
- 💰 Low fees on Algorand
- 🌐 Decentralized (no single point of failure)
- 📱 Mobile-friendly interface

**Visual:** Feature icons in a grid or list format

---

## Slide 8: Thank You
**Title:** Thank You

**Closing Points:**
- **Live Demo:** algosplit.vercel.app
- **Built on:** Algorand Blockchain
- **Deployed Smart Contracts:** Available on Algorand TestNet
- **Open Source:** Available on GitHub

**Contact/Next Steps:**
- Questions?
- Try it out: algosplit.vercel.app
- Built with ❤️ on Algorand

**Visual:**
- QR code to the live application
- Algorand logo
- Clean, professional closing slide

---

## Presentation Tips:

1. **Slide 1:** Keep it bold and impactful - first impression matters
2. **Slide 2:** Use data/statistics if available about payment splitting pain points
3. **Slide 3:** Focus on simplicity - emphasize how easy it is to use
4. **Slide 4:** Technical but accessible - don't overwhelm with jargon
5. **Slide 5:** Visual flow is key - use diagrams/icons
6. **Slide 6:** Make it relatable - everyone has split bills before
7. **Slide 7:** Highlight what makes you different - blockchain benefits
8. **Slide 8:** End strong - invite them to try it

**Design Recommendations:**
- Use consistent color scheme (Algorand blue/green)
- Keep text minimal - use visuals
- Use icons and diagrams where possible
- Maintain professional, modern aesthetic
- Ensure readability from a distance


