import { Link } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Wallet, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useWallet();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AlgoPayMe
              </span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/create" className="text-foreground hover:text-primary transition-smooth">
              Create Payment
            </Link>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-smooth">
              How It Works
            </a>
            <a href="#features" className="text-foreground hover:text-primary transition-smooth">
              Features
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected && walletAddress ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-2"
              >
                <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium">
                  {truncateAddress(walletAddress)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectWallet}
                  className="hidden md:flex"
                >
                  Disconnect
                </Button>
              </motion.div>
            ) : (
              <Button onClick={connectWallet} className="gradient-primary shadow-glow">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
            
            <button className="md:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
