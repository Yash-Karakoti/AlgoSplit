import React, { createContext, useContext, useState, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = () => {
    // Mock wallet connection
    const mockAddress = 'ALGO' + Math.random().toString(36).substring(2, 15).toUpperCase();
    setWalletAddress(mockAddress);
    setIsConnected(true);
    toast.success('Wallet connected successfully!');
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };

  return (
    <WalletContext.Provider value={{ isConnected, walletAddress, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
