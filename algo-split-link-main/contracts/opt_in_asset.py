"""
Script to opt the escrow contract into an asset (for ASA support)
"""
import os
import sys
import argparse
from algosdk import transaction
from algosdk.v2client import algod
from algosdk import mnemonic


def opt_in_asset(
    algod_client: algod.AlgodClient,
    app_id: int,
    asset_id: int,
    sender_mnemonic: str,
) -> str:
    """Opt the contract into an asset
    
    Args:
        algod_client: Algod client
        app_id: Application ID of the contract
        asset_id: Asset ID to opt into
        sender_mnemonic: Mnemonic of account calling the contract
        
    Returns:
        Transaction ID
    """
    # Get account from mnemonic
    private_key = mnemonic.to_private_key(sender_mnemonic)
    sender = transaction.account.address_from_private_key(private_key)
    
    print(f"Opting contract {app_id} into asset {asset_id}...")
    print(f"Sender: {sender}")
    
    # Get suggested params
    params = algod_client.suggested_params()
    
    # Create application call transaction
    # Call the opt_in_asset method
    # Method selector: first 4 bytes of sha512_256("opt_in_asset(asset)bool")
    method_selector = b'\x00\x00\x00\x00'  # Placeholder - actual selector from compiled ABI
    
    # Encode asset ID
    asset_arg = asset_id.to_bytes(8, 'big')
    
    txn = transaction.ApplicationCallTxn(
        sender=sender,
        sp=params,
        index=app_id,
        on_complete=transaction.OnComplete.OptInOC,
        app_args=[method_selector, asset_arg],
        foreign_assets=[asset_id],
    )
    
    # Sign transaction
    signed_txn = txn.sign(private_key)
    
    # Send transaction
    tx_id = algod_client.send_transaction(signed_txn)
    print(f"Transaction sent with ID: {tx_id}")
    
    # Wait for confirmation
    result = transaction.wait_for_confirmation(algod_client, tx_id, 4)
    print(f"✓ Contract opted into asset {asset_id}")
    
    return tx_id


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Opt escrow contract into an asset")
    parser.add_argument("--app-id", type=int, required=True, help="Application ID")
    parser.add_argument("--asset-id", type=int, required=True, help="Asset ID to opt into")
    parser.add_argument("--network", default="testnet", choices=["testnet", "mainnet"], help="Network")
    
    args = parser.parse_args()
    
    # Get algod client
    if args.network == "testnet":
        algod_address = "https://testnet-api.algonode.cloud"
        algod_token = ""
    else:
        algod_address = "https://mainnet-api.algonode.cloud"
        algod_token = ""
    
    algod_client = algod.AlgodClient(algod_token, algod_address)
    
    # Get sender mnemonic
    sender_mnemonic = os.getenv("DEPLOYER_MNEMONIC")
    if not sender_mnemonic:
        print("Error: DEPLOYER_MNEMONIC environment variable not set")
        sys.exit(1)
    
    # Opt in
    tx_id = opt_in_asset(algod_client, args.app_id, args.asset_id, sender_mnemonic)
    
    print(f"\n✓ Complete!")
    print(f"Transaction ID: {tx_id}")
    print(f"View on explorer: https://lora.algokit.io/{args.network}/transaction/{tx_id}")


