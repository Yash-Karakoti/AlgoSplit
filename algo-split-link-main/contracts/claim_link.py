"""
AlgoSplit Claim Link Smart Contract
Handles claim/redeem links where a sender creates a link and receiver can claim the amount
Uses PuyaPy (Algorand Python) for contract development
"""
from algopy import ARC4Contract, arc4, Account, UInt64, String, Txn, itxn
from algopy.op import App


class ClaimLink(ARC4Contract):
    """Smart contract for managing claim/redeem links"""
    
    @arc4.abimethod()
    def create_claim_link(
        self,
        receiver: Account,
        amount: UInt64,
        currency: String,
        expiry_time: UInt64,
    ) -> arc4.UInt64:
        """Create a new claim link
        
        Args:
            receiver: Account that can claim the amount (optional, can be anyone if empty)
            amount: Amount in microAlgos or asset units
            currency: Currency type ('ALGO' or 'USDCa')
            expiry_time: Unix timestamp when link expires (0 for no expiry)
            
        Returns:
            Claim link ID (transaction ID)
        """
        # Validate inputs
        assert amount > 0, "Amount must be greater than 0"
        assert currency == String("ALGO") or currency == String("USDCa"), "Currency must be ALGO or USDCa"
        
        # Use transaction ID as claim link ID
        claim_id_bytes = Txn.id
        
        # Store claim link details in app local state
        claim_key = String("claim_") + String.from_bytes(claim_id_bytes)
        
        # Store claim link data
        App.global.put(claim_key, String("active"))
        
        # Store details in local state
        App.local.put(claim_key, "receiver", receiver.bytes)
        App.local.put(claim_key, "amount", amount)
        App.local.put(claim_key, "currency", currency)
        App.local.put(claim_key, "expiry_time", expiry_time)
        App.local.put(claim_key, "creator", Txn.sender.bytes)
        App.local.put(claim_key, "claimed", arc4.Bool(False))
        
        return arc4.UInt64.from_bytes(claim_id_bytes[:8])
    
    @arc4.abimethod()
    def claim(
        self,
        claim_id: arc4.UInt64,
        claimer: Account,
    ) -> arc4.Bool:
        """Claim the amount from a claim link
        
        Args:
            claim_id: ID of the claim link
            claimer: Account claiming the amount
            
        Returns:
            True if claim successful
        """
        # Get claim link details
        claim_key = String("claim_") + String.from_bytes(claim_id.native.to_bytes(8))
        
        # Check if claim link exists
        status = App.global.get(claim_key)
        assert status == String("active"), "Claim link not found or already claimed"
        
        # Get claim link details
        receiver_bytes = App.local.get(claim_key, "receiver")
        amount = App.local.get(claim_key, "amount")
        currency = App.local.get(claim_key, "currency")
        expiry_time = App.local.get(claim_key, "expiry_time")
        claimed = App.local.get(claim_key, "claimed")
        
        # Validate claim link
        assert claimed == arc4.Bool(False), "Claim link already claimed"
        
        # Check expiry
        if expiry_time > UInt64(0):
            current_time = Txn.first_valid_time
            assert current_time < expiry_time, "Claim link has expired"
        
        # Check if receiver is specified (if empty, anyone can claim)
        if receiver_bytes:
            receiver = Account.from_bytes(receiver_bytes)
            assert claimer == receiver, "Only specified receiver can claim"
        
        # Send payment to claimer
        if currency == String("ALGO"):
            itxn.Payment(
                receiver=claimer,
                amount=amount,
                sender=Txn.sender,
            ).submit()
        else:
            # For USDCa, would need asset transfer
            # This is a placeholder - would need asset ID
            pass
        
        # Mark as claimed
        App.local.put(claim_key, "claimed", arc4.Bool(True))
        App.global.put(claim_key, String("claimed"))
        
        return arc4.Bool(True)
    
    @arc4.abimethod()
    def get_claim_info(
        self,
        claim_id: arc4.UInt64,
    ) -> arc4.Tuple[Account, UInt64, String, UInt64, arc4.Bool]:
        """Get claim link information
        
        Args:
            claim_id: ID of the claim link
            
        Returns:
            Tuple of (receiver, amount, currency, expiry_time, claimed)
        """
        claim_key = String("claim_") + String.from_bytes(claim_id.native.to_bytes(8))
        
        receiver_bytes = App.local.get(claim_key, "receiver")
        receiver = Account.from_bytes(receiver_bytes) if receiver_bytes else Txn.sender
        amount = App.local.get(claim_key, "amount") or UInt64(0)
        currency = App.local.get(claim_key, "currency") or String("ALGO")
        expiry_time = App.local.get(claim_key, "expiry_time") or UInt64(0)
        claimed = App.local.get(claim_key, "claimed") or arc4.Bool(False)
        
        return arc4.Tuple(
            receiver,
            amount,
            currency,
            expiry_time,
            claimed,
        )
    
    @arc4.abimethod()
    def cancel_claim_link(
        self,
        claim_id: arc4.UInt64,
    ) -> arc4.Bool:
        """Cancel a claim link (only creator can cancel)
        
        Args:
            claim_id: ID of the claim link
            
        Returns:
            True if cancellation successful
        """
        claim_key = String("claim_") + String.from_bytes(claim_id.native.to_bytes(8))
        
        # Check if claim link exists
        status = App.global.get(claim_key)
        assert status == String("active"), "Claim link not found or already claimed"
        
        # Check if caller is creator
        creator_bytes = App.local.get(claim_key, "creator")
        assert creator_bytes == Txn.sender.bytes, "Only creator can cancel"
        
        # Mark as cancelled
        App.global.put(claim_key, String("cancelled"))
        
        return arc4.Bool(True)




