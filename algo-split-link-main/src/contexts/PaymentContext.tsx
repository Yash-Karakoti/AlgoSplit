import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
import { supabase } from '@/lib/supabase/config';

export interface Payment {
  id: string;
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  participants: number;
  receiverAddress: string;
  createdAt: Date;
  expiryDate?: Date;
  collected: number;
  contributors: Contributor[];
  status: 'active' | 'completed';
  txHash?: string;
}

export interface Contributor {
  address: string;
  amount: number;
  timestamp: Date;
}

interface PaymentContextType {
  payments: Payment[];
  createPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'collected' | 'contributors' | 'status'>) => Promise<string>;
  getPayment: (id: string) => Payment | undefined;
  contributeToPayment: (id: string, amount: number, address?: string) => Promise<string>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { transactionSigner, activeAddress } = useWallet();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      // Check if Supabase is configured
      if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
        // Fall back to localStorage if Supabase not configured
        const stored = localStorage.getItem('algoPayMe_payments');
        if (stored) {
          const allPayments = JSON.parse(stored);
          const formattedPayments = Object.values(allPayments).map((details: any) => ({
            id: details.payment.id,
            title: details.payment.title,
            description: details.payment.description,
            totalAmount: details.payment.totalAmount,
            currency: details.payment.currency,
            participants: details.payment.participants,
            receiverAddress: details.payment.receiverAddress,
            createdAt: new Date(details.payment.createdAt),
            expiryDate: details.payment.expiryDate ? new Date(details.payment.expiryDate) : undefined,
            collected: details.collected || 0,
            contributors: details.contributors || [],
            status: details.status || 'active',
            txHash: details.txHash,
          }));
          setPayments(formattedPayments);
        }
        return;
      }

      // Load from Supabase
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading payments from Supabase:', error);
        return;
      }

      if (data) {
        const formattedPayments = data.map((payment: any) => ({
          id: payment.id,
          title: payment.title,
          description: payment.description,
          totalAmount: payment.total_amount,
          currency: payment.currency,
          participants: payment.participants,
          receiverAddress: payment.receiver_address,
          createdAt: new Date(payment.created_at),
          expiryDate: payment.expiry_date ? new Date(payment.expiry_date) : undefined,
          collected: payment.collected || 0,
          contributors: payment.contributors || [],
          status: payment.status || 'active',
          txHash: payment.tx_hash,
        }));
        setPayments(formattedPayments);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const createPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt' | 'collected' | 'contributors' | 'status'>) => {
    try {
      const id = Math.random().toString(36).substring(2, 15);
      
      // Check if Supabase is configured
      if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
        // Fall back to localStorage
        const stored = localStorage.getItem('algoPayMe_payments');
        const payments = stored ? JSON.parse(stored) : {};
        
        payments[id] = {
          payment: {
            ...paymentData,
            id,
            createdAt: new Date(),
          },
          collected: 0,
          contributors: [],
          status: 'active',
        };
        
        localStorage.setItem('algoPayMe_payments', JSON.stringify(payments));
        await loadPayments();
        return id;
      }

      // Save to Supabase
      const { error } = await supabase
        .from('payments')
        .insert({
          id,
          title: paymentData.title,
          description: paymentData.description,
          total_amount: paymentData.totalAmount,
          currency: paymentData.currency,
          participants: paymentData.participants,
          receiver_address: paymentData.receiverAddress,
          created_at: new Date().toISOString(),
          expiry_date: paymentData.expiryDate ? paymentData.expiryDate.toISOString() : null,
          collected: 0,
          contributors: [],
          status: 'active',
        });

      if (error) {
        console.error('Error creating payment in Supabase:', error);
        throw error;
      }

      await loadPayments();
      return id;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  };

  const getPayment = (id: string) => {
    // First try the in-memory array
    const payment = payments.find((p) => p.id === id);
    if (payment) return payment;
    
    // If not found in memory, try localStorage (for fallback)
    if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
      try {
        const stored = localStorage.getItem('algoPayMe_payments');
        if (stored) {
          const allPayments = JSON.parse(stored);
          const paymentData = allPayments[id];
          
          if (paymentData) {
            return {
              id: paymentData.payment.id,
              title: paymentData.payment.title,
              description: paymentData.payment.description,
              totalAmount: paymentData.payment.totalAmount,
              currency: paymentData.payment.currency,
              participants: paymentData.payment.participants,
              receiverAddress: paymentData.payment.receiverAddress,
              createdAt: new Date(paymentData.payment.createdAt),
              expiryDate: paymentData.payment.expiryDate ? new Date(paymentData.payment.expiryDate) : undefined,
              collected: paymentData.collected,
              contributors: paymentData.contributors,
              status: paymentData.status,
              txHash: paymentData.txHash,
            };
          }
        }
      } catch (error) {
        console.error('Error loading payment from localStorage:', error);
      }
    }
    
    return undefined;
  };

  const contributeToPayment = async (id: string, amount: number, address?: string): Promise<string> => {
    try {
      console.log('contributeToPayment called with:', { id, amount, address, activeAddress });
      
      const contributorAddress = activeAddress || address;
      
      if (!contributorAddress) {
        throw new Error('Please connect your wallet first');
      }
      
      const payment = getPayment(id);
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      // Check if payment is already completed
      if (payment.status === 'completed') {
        throw new Error('This payment is already completed');
      }
      
      // Check if user has already contributed
      const hasContributed = payment.contributors.some(
        (c) => c.address === contributorAddress
      );
      
      if (hasContributed) {
        throw new Error('You have already contributed to this payment');
      }
      
      // Verify amount matches expected per-person amount
      const expectedAmount = payment.totalAmount / payment.participants;
      if (Math.abs(amount - expectedAmount) > 0.0001) {
        throw new Error(`Amount must be exactly ${expectedAmount.toFixed(4)} ALGO`);
      }
      
      if (!payment.receiverAddress) {
        throw new Error('Payment receiver address is missing');
      }
      
      // Direct Algorand payment using TxnLab SDK
      const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
      const ALGOD_PORT = '443';
      const ALGOD_TOKEN = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      const algod = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
      
      // Get transaction parameters
      const suggestedParams = await algod.getTransactionParams().do();
      
      // Create payment transaction
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: contributorAddress,
        receiver: payment.receiverAddress,
        amount: Math.floor(amount * 1_000_000), // Convert ALGO to microAlgos
        suggestedParams
      });
      
      // Sign transaction using TxnLab SDK (works with all wallets)
      const signedTxns = await transactionSigner([txn], [0]);
      
      if (!signedTxns || signedTxns.length === 0 || !signedTxns[0]) {
        throw new Error('Transaction not signed');
      }
      
      // Send transaction
      const response = await algod.sendRawTransaction(signedTxns[0]).do();
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(algod, response.txid, 4);
      
      const txHash = response.txid;
      
      // Update payment in Supabase or localStorage
      if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
        // Fall back to localStorage
        const stored = localStorage.getItem('algoPayMe_payments');
        const payments = stored ? JSON.parse(stored) : {};
        
        if (payments[id]) {
          payments[id].collected += amount;
          
          const existingContributor = payments[id].contributors.find(
            (c) => c.address === contributorAddress
          );
          
          if (!existingContributor) {
            payments[id].contributors.push({
              address: contributorAddress,
              amount,
              timestamp: new Date(),
            });
          }
          
          payments[id].txHash = txHash;
          
          if (payments[id].collected >= payments[id].payment.totalAmount) {
            payments[id].status = 'completed';
          }
          
          localStorage.setItem('algoPayMe_payments', JSON.stringify(payments));
        }
      } else {
        // Update in Supabase
        // First, get the current payment data
        const { data: currentPayment, error: fetchError } = await supabase
          .from('payments')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error('Error fetching payment from Supabase:', fetchError);
          throw fetchError;
        }

        const updatedContributors = [...(currentPayment.contributors || [])];
        const existingContributor = updatedContributors.find(
          (c: any) => c.address === contributorAddress
        );

        if (!existingContributor) {
          updatedContributors.push({
            address: contributorAddress,
            amount,
            timestamp: new Date().toISOString(),
          });
        }

        const newCollected = (currentPayment.collected || 0) + amount;
        const newStatus = newCollected >= currentPayment.total_amount ? 'completed' : 'active';

        const { error: updateError } = await supabase
          .from('payments')
          .update({
            collected: newCollected,
            contributors: updatedContributors,
            tx_hash: txHash,
            status: newStatus,
          })
          .eq('id', id);

        if (updateError) {
          console.error('Error updating payment in Supabase:', updateError);
          throw updateError;
        }
      }
      
      // Reload payments to update UI
      await loadPayments();
      
      return txHash;
    } catch (error) {
      console.error('Error contributing to payment:', error);
      throw error;
    }
  };

  return (
    <PaymentContext.Provider value={{ payments, createPayment, getPayment, contributeToPayment }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
