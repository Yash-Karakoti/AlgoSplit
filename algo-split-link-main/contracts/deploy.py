"""
Deployment script for PaymentSplit smart contract
"""
import os
from algokit_utils import (
    get_account,
    get_algod_client,
    get_indexer_client,
    deploy,
    Account,
)
from algosdk import transaction
from algosdk.v2client import algod
from pyteal import compileTeal, Mode
from algopy import Contract

# Import the contract
from payment_split import PaymentSplit


def deploy_contract(
    algod_client: algod.AlgodClient,
    deployer_account: Account,
    network: str = "testnet",
) -> int:
    """Deploy the PaymentSplit contract
    
    Args:
        algod_client: Algod client
        deployer_account: Account to deploy from
        network: Network name (testnet/mainnet)
        
    Returns:
        Application ID
    """
    print(f"Deploying PaymentSplit contract to {network}...")
    
    # Compile the contract
    contract = PaymentSplit()
    
    # Deploy using algokit
    app_id, app_address = deploy(
        algod_client=algod_client,
        deployer=deployer_account,
        contract=contract,
        network=network,
    )
    
    print(f"Contract deployed successfully!")
    print(f"Application ID: {app_id}")
    print(f"Application Address: {app_address}")
    
    return app_id


if __name__ == "__main__":
    # Get network from environment
    network = os.getenv("ALGORAND_NETWORK", "testnet")
    
    # Get clients
    algod_client = get_algod_client()
    indexer_client = get_indexer_client()
    
    # Get deployer account
    deployer = get_account(name="DEPLOYER", fund_with_algos=10)
    
    # Deploy contract
    app_id = deploy_contract(algod_client, deployer, network)
    
    print(f"\nDeployment complete!")
    print(f"Save this Application ID: {app_id}")





