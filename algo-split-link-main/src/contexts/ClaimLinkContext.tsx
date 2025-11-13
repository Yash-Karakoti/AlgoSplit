import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
import { supabase, isSupabaseReady } from '@/lib/supabase/config';
import { escrowClaimService } from '@/lib/algorand/contractService';
import toast from 'react-hot-toast';

export interface ClaimLink {
  id: string;
  senderAddress: string;
  receiverAddress?: string; // Optional - if empty, anyone can claim
  amount: number;
  currency: string;
  createdAt: Date;
  expiryDate?: Date;
  claimed: boolean;
  claimedAt?: Date;
  claimedBy?: string;
  status: 'active' | 'claimed' | 'expired' | 'cancelled';
  txHash?: string;
  claimTxHash?: string;
  contractAppId?: number;
  contractAddress?: string;
}

interface ClaimLinkContextType {
  claimLinks: ClaimLink[];
  createClaimLink: (claimLink: Omit<ClaimLink, 'id' | 'createdAt' | 'claimed' | 'status'>) => Promise<string>;
  getClaimLink: (id: string) => ClaimLink | undefined;
  claimLink: (id: string, claimerAddress?: string) => Promise<string>;
  cancelClaimLink: (id: string) => Promise<void>;
}

const ClaimLinkContext = createContext<ClaimLinkContextType | undefined>(undefined);

export const ClaimLinkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { transactionSigner, activeAddress } = useWallet();
  const [claimLinks, setClaimLinks] = useState<ClaimLink[]>([]);

  useEffect(() => {
    loadClaimLinks();
  }, []);

  const loadClaimLinks = async () => {
    try {
      if (!isSupabaseReady) {
        // Fall back to localStorage
        const stored = localStorage.getItem('algoPayMe_claimLinks');
        if (stored) {
          const allClaimLinks = JSON.parse(stored);
          const formattedClaimLinks = Object.values(allClaimLinks).map((details: any) => ({
            id: details.claimLink.id,
            senderAddress: details.claimLink.senderAddress,
            receiverAddress: details.claimLink.receiverAddress,
            amount: details.claimLink.amount,
            currency: details.claimLink.currency,
            createdAt: new Date(details.claimLink.createdAt),
            expiryDate: details.claimLink.expiryDate ? new Date(details.claimLink.expiryDate) : undefined,
            claimed: details.claimed || false,
            claimedAt: details.claimedAt ? new Date(details.claimedAt) : undefined,
            claimedBy: details.claimedBy,
            status: details.status || 'active',
            txHash: details.txHash,
            claimTxHash: details.claimTxHash,
          }));
          setClaimLinks(formattedClaimLinks);
        }
        return;
      }

      // Load from Supabase
      const { data, error } = await supabase
        .from('claim_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error loading claim links from Supabase, falling back to localStorage:', error);
        // Fall back to localStorage
        const stored = localStorage.getItem('algoPayMe_claimLinks');
        if (stored) {
          const allClaimLinks = JSON.parse(stored);
          const formattedClaimLinks = Object.values(allClaimLinks).map((details: any) => ({
            id: details.claimLink.id,
            senderAddress: details.claimLink.senderAddress,
            receiverAddress: details.claimLink.receiverAddress,
            amount: details.claimLink.amount,
            currency: details.claimLink.currency,
            createdAt: new Date(details.claimLink.createdAt),
            expiryDate: details.claimLink.expiryDate ? new Date(details.claimLink.expiryDate) : undefined,
            claimed: details.claimed || false,
            claimedAt: details.claimedAt ? new Date(details.claimedAt) : undefined,
            claimedBy: details.claimedBy,
            status: details.status || 'active',
            txHash: details.txHash,
            claimTxHash: details.claimTxHash,
          }));
          setClaimLinks(formattedClaimLinks);
        }
        return;
      }

      if (data) {
        const formattedClaimLinks = data.map((claimLink: any) => ({
          id: claimLink.id,
          senderAddress: claimLink.sender_address,
          receiverAddress: claimLink.receiver_address,
          amount: claimLink.amount,
          currency: claimLink.currency,
          createdAt: new Date(claimLink.created_at),
          expiryDate: claimLink.expiry_date ? new Date(claimLink.expiry_date) : undefined,
          claimed: claimLink.claimed || false,
          claimedAt: claimLink.claimed_at ? new Date(claimLink.claimed_at) : undefined,
          claimedBy: claimLink.claimed_by,
          status: claimLink.status || 'active',
          txHash: claimLink.tx_hash,
          claimTxHash: claimLink.claim_tx_hash,
        }));
        setClaimLinks(formattedClaimLinks);
      }
    } catch (error) {
      console.error('Error loading claim links:', error);
    }
  };

  const createClaimLink = async (claimLinkData: Omit<ClaimLink, 'id' | 'createdAt' | 'claimed' | 'status'>) => {
    try {
      if (!activeAddress) {
        throw new Error('Please connect your wallet first');
      }

      const id = Math.random().toString(36).substring(2, 15);
      let txHash: string | undefined;
      let contractAppId: number | undefined;
      let contractAddress: string | undefined;

      // Try to use escrow contract if configured
      if (escrowClaimService.isConfigured() && transactionSigner) {
        try {
          const expiryTime = claimLinkData.expiryDate 
            ? Math.floor(claimLinkData.expiryDate.getTime() / 1000) 
            : 0;

          const result = await escrowClaimService.createClaimLink(
            activeAddress,
            claimLinkData.amount,
            claimLinkData.currency as 'ALGO' | 'USDC',
            claimLinkData.receiverAddress || null,
            expiryTime,
            transactionSigner
          );

          txHash = result.txId;
          contractAppId = result.claimId; // Store claim ID as app ID for reference
          
          toast.success('Claim link created and escrowed on-chain! 🎉');
        } catch (escrowError: any) {
          console.warn('Escrow contract creation failed, falling back to direct payment:', escrowError);
          toast.error('Escrow failed: ' + (escrowError.message || 'Unknown error'));
          throw escrowError;
        }
      } else {
        console.warn('Escrow contract not configured. Links will require sender approval to claim.');
        toast('⚠️ Escrow not configured. Deploy escrow_claim_link.py first for production use.', {
          icon: '⚠️',
          duration: 4000,
        });
      }
      
      // Try to save to Supabase, but fall back to localStorage if it fails
      if (isSupabaseReady) {
        const { error } = await supabase
          .from('claim_links')
          .insert({
            id,
            sender_address: claimLinkData.senderAddress,
            receiver_address: claimLinkData.receiverAddress || null,
            amount: claimLinkData.amount,
            currency: claimLinkData.currency,
            created_at: new Date().toISOString(),
            expiry_date: claimLinkData.expiryDate ? claimLinkData.expiryDate.toISOString() : null,
            claimed: false,
            status: 'active',
            tx_hash: txHash,
            contract_app_id: contractAppId,
            contract_address: contractAddress,
          });

        if (error) {
          console.warn('Error creating claim link in Supabase, falling back to localStorage:', error);
          // Fall through to localStorage save
        } else {
          await loadClaimLinks();
          return id;
        }
      }

      // Fall back to localStorage
      const stored = localStorage.getItem('algoPayMe_claimLinks');
      const claimLinks = stored ? JSON.parse(stored) : {};
      
      claimLinks[id] = {
        claimLink: {
          ...claimLinkData,
          id,
          createdAt: new Date(),
        },
        claimed: false,
        status: 'active',
        txHash,
        contractAppId,
        contractAddress,
      };
      
      localStorage.setItem('algoPayMe_claimLinks', JSON.stringify(claimLinks));
      await loadClaimLinks();
      return id;
    } catch (error) {
      console.error('Error creating claim link:', error);
      throw error;
    }
  };

  const getClaimLink = (id: string) => {
    const claimLink = claimLinks.find((cl) => cl.id === id);
    if (claimLink) return claimLink;
    
    // Always try localStorage as fallback (even if Supabase is configured but failed to load)
    try {
      const stored = localStorage.getItem('algoPayMe_claimLinks');
      if (stored) {
        const allClaimLinks = JSON.parse(stored);
        const claimLinkData = allClaimLinks[id];
        
        if (claimLinkData) {
          return {
            id: claimLinkData.claimLink.id,
            senderAddress: claimLinkData.claimLink.senderAddress,
            receiverAddress: claimLinkData.claimLink.receiverAddress,
            amount: claimLinkData.claimLink.amount,
            currency: claimLinkData.claimLink.currency,
            createdAt: new Date(claimLinkData.claimLink.createdAt),
            expiryDate: claimLinkData.claimLink.expiryDate ? new Date(claimLinkData.claimLink.expiryDate) : undefined,
            claimed: claimLinkData.claimed || false,
            claimedAt: claimLinkData.claimedAt ? new Date(claimLinkData.claimedAt) : undefined,
            claimedBy: claimLinkData.claimedBy,
            status: claimLinkData.status || 'active',
            txHash: claimLinkData.txHash,
            claimTxHash: claimLinkData.claimTxHash,
          };
        }
      }
    } catch (error) {
      console.error('Error loading claim link from localStorage:', error);
    }
    
    return undefined;
  };

  const claimLink = async (id: string, claimerAddress?: string): Promise<string> => {
    try {
      const claimer = activeAddress || claimerAddress;
      
      if (!claimer) {
        throw new Error('Please connect your wallet first');
      }

      const claimLink = getClaimLink(id);
      if (!claimLink) {
        throw new Error('Claim link not found');
      }

      if (claimLink.claimed || claimLink.status === 'claimed') {
        throw new Error('This claim link has already been claimed');
      }

      if (claimLink.status !== 'active') {
        throw new Error('This claim link is not active');
      }

      // Check expiry
      if (claimLink.expiryDate && new Date(claimLink.expiryDate) < new Date()) {
        throw new Error('This claim link has expired');
      }

      // Check if receiver is specified
      if (claimLink.receiverAddress && claimLink.receiverAddress !== claimer) {
        throw new Error('Only the specified receiver can claim this link');
      }

      // Check if sender is trying to claim
      if (claimLink.senderAddress === claimer) {
        throw new Error('Sender cannot claim their own link');
      }

      // Try to use escrow contract if available
      if (escrowClaimService.isConfigured() && claimLink.contractAppId && transactionSigner) {
        try {
          const claimTxId = await escrowClaimService.claim(
            claimLink.contractAppId,
            claimer,
            transactionSigner
          );

          // Update claim status
          await updateClaimStatus(id, claimer, claimTxId);
          
          toast.success('Successfully claimed from escrow! 🎉');
          return claimTxId;
        } catch (escrowError: any) {
          console.error('Escrow claim failed:', escrowError);
          toast.error('Escrow claim failed: ' + (escrowError.message || 'Unknown error'));
          throw escrowError;
        }
      }

      // Fallback: Direct payment (requires sender approval - not ideal for production)
      console.warn('Escrow not available. Falling back to direct payment (requires sender approval).');
      toast('⚠️ Claiming via direct payment. Sender must approve.', {
        icon: '⚠️',
        duration: 4000,
      });
      
      const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
      const ALGOD_PORT = '443';
      const ALGOD_TOKEN = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      const algod = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
      
      const suggestedParams = await algod.getTransactionParams().do();
      
      // Create payment transaction from sender to claimer
      // NOTE: This requires the sender to sign, which is a limitation
      // In production, use a smart contract escrow
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: claimLink.senderAddress,
        receiver: claimer,
        amount: Math.floor(claimLink.amount * 1_000_000), // Convert ALGO to microAlgos
        suggestedParams
      });

      // Sign transaction using TxnLab SDK
      // NOTE: This will fail if the sender's wallet is not connected
      // In production, use a smart contract escrow where sender pre-funds
      const signedTxns = await transactionSigner([txn], [0]);
      
      if (!signedTxns || signedTxns.length === 0 || !signedTxns[0]) {
        throw new Error('Transaction not signed. In production, use a smart contract escrow where the sender pre-funds the link.');
      }
      
      // Send transaction
      const response = await algod.sendRawTransaction(signedTxns[0]).do();
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(algod, response.txid, 4);
      
      const claimTxHash = response.txid;

      // Update claim status
      await updateClaimStatus(id, claimer, claimTxHash);
      return claimTxHash;
    } catch (error: any) {
      console.error('Error claiming link:', error);
      throw error;
    }
  };

  // Helper function to update claim status
  const updateClaimStatus = async (id: string, claimer: string, claimTxHash: string) => {
    // Update in Supabase
    if (isSupabaseReady) {
      const { error } = await supabase
        .from('claim_links')
        .update({
          claimed: true,
          claimed_at: new Date().toISOString(),
          claimed_by: claimer,
          status: 'claimed',
          claim_tx_hash: claimTxHash,
        })
        .eq('id', id);

      if (error) {
        console.warn('Error updating claim link in Supabase:', error);
      } else {
        await loadClaimLinks();
        return;
      }
    }

    // Fall back to localStorage
    const stored = localStorage.getItem('algoPayMe_claimLinks');
    const claimLinks = stored ? JSON.parse(stored) : {};
    
    if (claimLinks[id]) {
      claimLinks[id].claimed = true;
      claimLinks[id].claimedAt = new Date();
      claimLinks[id].claimedBy = claimer;
      claimLinks[id].status = 'claimed';
      claimLinks[id].claimTxHash = claimTxHash;
      
      localStorage.setItem('algoPayMe_claimLinks', JSON.stringify(claimLinks));
    }

    await loadClaimLinks();
  };

  const cancelClaimLink = async (id: string) => {
    try {
      if (!activeAddress) {
        throw new Error('Please connect your wallet first');
      }

      const claimLink = getClaimLink(id);
      if (!claimLink) {
        throw new Error('Claim link not found');
      }

      if (claimLink.senderAddress !== activeAddress) {
        throw new Error('Only the sender can cancel this claim link');
      }

      if (claimLink.claimed || claimLink.status === 'claimed') {
        throw new Error('Cannot cancel a claimed link');
      }

      // Try to use escrow contract if available
      if (escrowClaimService.isConfigured() && claimLink.contractAppId && transactionSigner) {
        try {
          const cancelTxId = await escrowClaimService.cancel(
            claimLink.contractAppId,
            activeAddress,
            transactionSigner
          );

          // Update status in database
          await updateCancelStatus(id);
          
          toast.success('Claim link cancelled and refunded! ✅');
          return;
        } catch (escrowError: any) {
          console.error('Escrow cancel failed:', escrowError);
          toast.error('Escrow cancel failed: ' + (escrowError.message || 'Unknown error'));
          throw escrowError;
        }
      }

      // Fallback: Just mark as cancelled (no refund for non-escrow links)
      console.warn('Escrow not available. Marking link as cancelled.');
      toast('Claim link cancelled (no funds were escrowed).', {
        icon: 'ℹ️',
        duration: 3000,
      });
      await updateCancelStatus(id);
    } catch (error: any) {
      console.error('Error cancelling claim link:', error);
      throw error;
    }
  };

  // Helper function to update cancel status
  const updateCancelStatus = async (id: string) => {
    // Update in Supabase
    if (isSupabaseReady) {
      const { error } = await supabase
        .from('claim_links')
        .update({
          status: 'cancelled',
        })
        .eq('id', id);

      if (error) {
        console.warn('Error cancelling claim link in Supabase:', error);
      } else {
        await loadClaimLinks();
        return;
      }
    }

    // Fall back to localStorage
    const stored = localStorage.getItem('algoPayMe_claimLinks');
    const claimLinks = stored ? JSON.parse(stored) : {};
    
    if (claimLinks[id]) {
      claimLinks[id].status = 'cancelled';
      localStorage.setItem('algoPayMe_claimLinks', JSON.stringify(claimLinks));
    }

    await loadClaimLinks();
  };

  return (
    <ClaimLinkContext.Provider value={{ claimLinks, createClaimLink, getClaimLink, claimLink, cancelClaimLink }}>
      {children}
    </ClaimLinkContext.Provider>
  );
};

export const useClaimLink = () => {
  const context = useContext(ClaimLinkContext);
  if (context === undefined) {
    throw new Error('useClaimLink must be used within a ClaimLinkProvider');
  }
  return context;
};

