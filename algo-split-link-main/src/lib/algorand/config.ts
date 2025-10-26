export const ALGORAND_CONFIG = {
  // Use Testnet by default, switch to Mainnet for production
  network: import.meta.env.VITE_ALGORAND_NETWORK || 'testnet',
  
  // Testnet configuration
  testnet: {
    algodServer: 'https://testnet-api.algonode.cloud',
    indexerServer: 'https://testnet-idx.algonode.cloud',
  },
  
  // Mainnet configuration
  mainnet: {
    algodServer: 'https://mainnet-api.algonode.cloud',
    indexerServer: 'https://mainnet-idx.algonode.cloud',
  },
};

// USDCa asset IDs (Algorand USDC)
export const USDC_ASSET_ID = {
  testnet: 10458941,
  mainnet: 31566704,
};

// Minimum balance required for an account (in microAlgos)
export const MIN_BALANCE = 100000; // 0.1 ALGO

// App call parameter encoding
export const PAYMENT_APP_ID = 1; // This will be dynamically set when we deploy the smart contract

