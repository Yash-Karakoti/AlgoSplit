# Escrow Claim Link Contract Deployment Guide

## Prerequisites

1. Python 3.10 or higher
2. pip package manager
3. Algorand wallet with testnet ALGO (for deployment)
4. AlgoKit (optional but recommended)

## Step 1: Install Dependencies

```bash
cd contracts
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Step 2: Install PuyaPy Compiler

```bash
pip install puyapy
```

Or install AlgoKit which includes PuyaPy:
```bash
pip install algokit
```

## Step 3: Compile the Contract

```bash
puya compile escrow_claim_link.py
```

This will create:
- `artifacts/EscrowClaimLink/approval.teal`
- `artifacts/EscrowClaimLink/clear.teal`
- `artifacts/EscrowClaimLink/contract.json` (ABI)

## Step 4: Set Up Environment

Create a `.env` file or set environment variables:

```bash
export ALGORAND_NETWORK=testnet
export DEPLOYER_MNEMONIC="your 25-word mnemonic here"
```

Get testnet ALGO:
- Visit https://dispenser.testnet.algorand.network/
- Enter your wallet address
- Get free testnet ALGO

## Step 5: Deploy the Contract

```bash
python deploy_escrow.py
```

The script will:
1. Compile TEAL to bytecode
2. Create the application
3. Fund the contract with minimum balance
4. Output the Application ID and Address

## Step 6: Configure Frontend

Add to your `.env` file in the project root:

```env
VITE_CLAIM_APP_ID=<your_app_id>
VITE_CLAIM_APP_ADDRESS=<your_app_address>
```

## Step 7: Opt Contract into ASAs (USDCa)

For ASA support, the contract needs to opt into the asset:

```bash
# For testnet USDCa (asset ID 10458941)
python opt_in_asset.py --app-id <your_app_id> --asset-id 10458941
```

## Testing

1. Create a claim link (frontend will fund the escrow)
2. Share the link with another wallet
3. Claim the funds (no sender approval needed)
4. Verify the transaction on https://lora.algokit.io/testnet

## Production Deployment

For mainnet:

1. Change network to mainnet:
```bash
export ALGORAND_NETWORK=mainnet
```

2. Use a mainnet wallet with real ALGO
3. Deploy the contract
4. Update frontend `.env`:
```env
VITE_ALGORAND_NETWORK=mainnet
VITE_CLAIM_APP_ID=<mainnet_app_id>
```

5. For mainnet USDCa (asset ID 31566704):
```bash
python opt_in_asset.py --app-id <your_app_id> --asset-id 31566704
```

## Contract Features

- **Escrow funding**: Sender pre-funds the contract when creating the link
- **Anyone can claim**: No receiver restriction (or optional specific receiver)
- **ALGO and ASA support**: Works with ALGO and USDCa
- **Expiry enforcement**: Claims fail after expiry time
- **Cancel/refund**: Sender can cancel and get refund if unclaimed
- **Box storage**: Efficient storage for unlimited claim links

## Security Notes

- Contract uses box storage for scalability
- Each claim link costs ~0.0025 ALGO in box storage fees
- Minimum balance requirements handled automatically
- Only sender can cancel
- Only specified receiver (or anyone) can claim
- Claimed links cannot be claimed again

## Troubleshooting

- **Compilation errors**: Check Python version (must be 3.10+)
- **Deployment fails**: Ensure deployer has enough ALGO (~1 ALGO for deployment + fees)
- **Claim fails**: Check contract has opted into the asset (for ASAs)
- **Box storage errors**: Ensure contract has minimum balance

## Next Steps

After deployment:
1. Test on testnet thoroughly
2. Deploy to mainnet when ready
3. Monitor contract balance
4. Set up monitoring for failed transactions


