"""
Deployment script for EscrowClaimLink smart contract
"""
import os
import sys
from pathlib import Path

# Add contracts directory to path
sys.path.append(str(Path(__file__).parent))

try:
    from algokit_utils import (
        get_account,
        get_algod_client,
        Account,
    )
    from algosdk import transaction
    from algosdk.v2client import algod
    
    # Note: Import after compiling with puya
    # from escrow_claim_link import EscrowClaimLink
except ImportError as e:
    print(f"Error importing required packages: {e}")
    print("Please install required packages:")
    print("  pip install algokit-utils py-algorand-sdk")
    sys.exit(1)


def deploy_escrow_contract(
    algod_client: algod.AlgodClient,
    deployer_account: Account,
    network: str = "testnet",
) -> tuple[int, str]:
    """Deploy the EscrowClaimLink contract
    
    Args:
        algod_client: Algod client
        deployer_account: Account to deploy from
        network: Network name (testnet/mainnet)
        
    Returns:
        Tuple of (Application ID, Application Address)
    """
    print(f"Deploying EscrowClaimLink contract to {network}...")
    print(f"Deployer address: {deployer_account.address}")
    
    # NOTE: You need to compile the contract first using puya:
    # puya compile escrow_claim_link.py
    
    # This will generate approval.teal and clear.teal files
    # Read the compiled TEAL files
    approval_teal_path = Path(__file__).parent / "artifacts" / "EscrowClaimLink" / "approval.teal"
    clear_teal_path = Path(__file__).parent / "artifacts" / "EscrowClaimLink" / "clear.teal"
    
    if not approval_teal_path.exists() or not clear_teal_path.exists():
        print("\nError: Compiled TEAL files not found!")
        print("Please compile the contract first:")
        print("  cd contracts")
        print("  puya compile escrow_claim_link.py")
        sys.exit(1)
    
    with open(approval_teal_path) as f:
        approval_teal = f.read()
    
    with open(clear_teal_path) as f:
        clear_teal = f.read()
    
    # Compile TEAL to bytecode
    approval_result = algod_client.compile(approval_teal)
    approval_program = approval_result["result"]
    
    clear_result = algod_client.compile(clear_teal)
    clear_program = clear_result["result"]
    
    # Get suggested params
    params = algod_client.suggested_params()
    
    # Create application transaction
    # Global schema: 1 uint (claim_count)
    # Local schema: none (using box storage)
    global_schema = transaction.StateSchema(num_uints=1, num_byte_slices=0)
    local_schema = transaction.StateSchema(num_uints=0, num_byte_slices=0)
    
    txn = transaction.ApplicationCreateTxn(
        sender=deployer_account.address,
        sp=params,
        on_complete=transaction.OnComplete.NoOpOC,
        approval_program=approval_program,
        clear_program=clear_program,
        global_schema=global_schema,
        local_schema=local_schema,
        extra_pages=1,  # Extra pages for larger contract
    )
    
    # Sign transaction
    signed_txn = txn.sign(deployer_account.private_key)
    
    # Send transaction
    tx_id = algod_client.send_transaction(signed_txn)
    print(f"Transaction sent with ID: {tx_id}")
    
    # Wait for confirmation
    result = transaction.wait_for_confirmation(algod_client, tx_id, 4)
    
    # Get application ID
    app_id = result["application-index"]
    app_address = transaction.logic.get_application_address(app_id)
    
    print(f"\n✓ Contract deployed successfully!")
    print(f"  Application ID: {app_id}")
    print(f"  Application Address: {app_address}")
    
    # Fund the contract with minimum balance for box storage
    print(f"\nFunding contract with minimum balance...")
    fund_txn = transaction.PaymentTxn(
        sender=deployer_account.address,
        sp=params,
        receiver=app_address,
        amt=500_000,  # 0.5 ALGO for box storage
    )
    signed_fund_txn = fund_txn.sign(deployer_account.private_key)
    fund_tx_id = algod_client.send_transaction(signed_fund_txn)
    transaction.wait_for_confirmation(algod_client, fund_tx_id, 4)
    print(f"✓ Contract funded")
    
    return app_id, app_address


if __name__ == "__main__":
    # Get network from environment
    network = os.getenv("ALGORAND_NETWORK", "testnet")
    
    # Get algod client
    if network == "testnet":
        algod_address = "https://testnet-api.algonode.cloud"
        algod_token = ""
    else:
        algod_address = "https://mainnet-api.algonode.cloud"
        algod_token = ""
    
    algod_client = algod.AlgodClient(algod_token, algod_address)
    
    # Get deployer account
    deployer_mnemonic = os.getenv("DEPLOYER_MNEMONIC")
    if not deployer_mnemonic:
        print("Error: DEPLOYER_MNEMONIC environment variable not set")
        print("Please set your deployer account mnemonic:")
        print("  export DEPLOYER_MNEMONIC='your mnemonic here'")
        sys.exit(1)
    
    try:
        deployer = get_account(deployer_mnemonic)
    except Exception as e:
        print(f"Error getting deployer account: {e}")
        print("Please check your mnemonic is correct")
        sys.exit(1)
    
    # Deploy contract
    app_id, app_address = deploy_escrow_contract(algod_client, deployer, network)
    
    print(f"\n{'='*60}")
    print(f"DEPLOYMENT COMPLETE")
    print(f"{'='*60}")
    print(f"\nAdd this to your .env file:")
    print(f"VITE_CLAIM_APP_ID={app_id}")
    print(f"VITE_CLAIM_APP_ADDRESS={app_address}")
    print(f"\nApplication ID: {app_id}")
    print(f"Application Address: {app_address}")
    print(f"Network: {network}")
    print(f"{'='*60}\n")


