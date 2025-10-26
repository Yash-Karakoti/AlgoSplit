import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  contractAddress?: string;
}

export interface Contributor {
  address: string;
  amount: number;
  timestamp: Date;
}

interface PaymentContextType {
  payments: Payment[];
  createPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'collected' | 'contributors' | 'status'>) => string;
  getPayment: (id: string) => Payment | undefined;
  contributeToPayment: (id: string, amount: number, address: string) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<Payment[]>([]);

  const createPayment = (paymentData: Omit<Payment, 'id' | 'createdAt' | 'collected' | 'contributors' | 'status'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    const newPayment: Payment = {
      ...paymentData,
      id,
      createdAt: new Date(),
      collected: 0,
      contributors: [],
      status: 'active',
      txHash: 'TX' + Math.random().toString(36).substring(2, 15).toUpperCase(),
      contractAddress: 'CONTRACT' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    };
    setPayments((prev) => [...prev, newPayment]);
    return id;
  };

  const getPayment = (id: string) => {
    return payments.find((p) => p.id === id);
  };

  const contributeToPayment = (id: string, amount: number, address: string) => {
    setPayments((prev) =>
      prev.map((payment) => {
        if (payment.id === id) {
          const newCollected = payment.collected + amount;
          const newContributor: Contributor = {
            address,
            amount,
            timestamp: new Date(),
          };
          return {
            ...payment,
            collected: newCollected,
            contributors: [...payment.contributors, newContributor],
            status: newCollected >= payment.totalAmount ? 'completed' : 'active',
          };
        }
        return payment;
      })
    );
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
