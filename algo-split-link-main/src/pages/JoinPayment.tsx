import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePayment } from '@/contexts/PaymentContext';
import { useWallet } from '@/contexts/WalletContext';
import { CheckCircle, Clock, User, Loader2, ExternalLink, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

const JoinPayment = () => {
  const { id } = useParams<{ id: string }>();
  const { getPayment, contributeToPayment } = usePayment();
  const { isConnected, walletAddress, connectWallet } = useWallet();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const payment = getPayment(id!);

  useEffect(() => {
    if (payment?.status === 'completed' && !showCompletionModal) {
      setShowCompletionModal(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [payment?.status]);

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Payment not found</h1>
        </div>
      </div>
    );
  }

  const progressPercentage = (payment.collected / payment.totalAmount) * 100;
  const perPersonAmount = payment.totalAmount / payment.participants;
  const hasContributed = payment.contributors.some((c) => c.address === walletAddress);

  const handlePayment = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    
    // Simulate transaction
    setTimeout(() => {
      contributeToPayment(id!, perPersonAmount, walletAddress!);
      setIsProcessing(false);
      toast.success('Payment successful!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header Card */}
          <Card className="p-8 shadow-card">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold">{payment.title}</h1>
                  {payment.description && (
                    <p className="text-muted-foreground">{payment.description}</p>
                  )}
                </div>
                
                {payment.expiryDate && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      Expires: {new Date(payment.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Target</div>
                  <div className="text-xl font-bold text-primary">
                    {payment.totalAmount} {payment.currency}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Collected</div>
                  <div className="text-xl font-bold text-accent">
                    {payment.collected.toFixed(2)} {payment.currency}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Your Share</div>
                  <div className="text-xl font-bold">
                    {perPersonAmount.toFixed(2)} {payment.currency}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Contributors</div>
                  <div className="text-xl font-bold">
                    {payment.contributors.length} / {payment.participants}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Progress Section */}
          <Card className="p-8 shadow-card">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Payment Progress</span>
                  <span className="text-muted-foreground">
                    {progressPercentage.toFixed(0)}% Complete
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>

              <div className="text-sm text-muted-foreground text-center p-4 rounded-lg bg-muted/30">
                💡 Funds are securely held in a smart contract until the target is reached
              </div>
            </div>
          </Card>

          {/* Payment Action */}
          {payment.status === 'active' && (
            <Card className="p-8 shadow-card">
              {hasContributed ? (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
                    <CheckCircle className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">You've Contributed!</h3>
                    <p className="text-muted-foreground">
                      Thank you for your payment of {perPersonAmount.toFixed(2)} {payment.currency}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Ready to Pay Your Share?</h3>
                    <p className="text-muted-foreground">
                      You'll be charged {perPersonAmount.toFixed(2)} {payment.currency}
                    </p>
                  </div>

                  {!isConnected ? (
                    <Button
                      onClick={connectWallet}
                      size="lg"
                      className="w-full gradient-primary shadow-glow"
                    >
                      Connect Wallet to Pay
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePayment}
                      size="lg"
                      className="w-full gradient-primary shadow-glow"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        `Pay ${perPersonAmount.toFixed(2)} ${payment.currency}`
                      )}
                    </Button>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Contributors List */}
          {payment.contributors.length > 0 && (
            <Card className="p-8 shadow-card">
              <h3 className="text-xl font-bold mb-6">Contributors</h3>
              <div className="space-y-3">
                {payment.contributors.map((contributor, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium font-mono text-sm">
                          {contributor.address.slice(0, 8)}...{contributor.address.slice(-6)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(contributor.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-accent">
                        {contributor.amount.toFixed(2)} {payment.currency}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {/* Transaction Info */}
          <Card className="p-6 shadow-card">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Smart Contract</span>
                <span className="font-mono text-xs">{payment.contractAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">View on Explorer</span>
                <a
                  href={`https://algoexplorer.io/tx/${payment.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  AlgoExplorer
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && payment.status === 'completed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-background rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary shadow-glow">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold mb-2">Payment Complete!</h2>
                  <p className="text-muted-foreground">
                    The payment goal has been reached. Funds are being released to the recipient.
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-muted/50 space-y-2">
                  <div className="text-sm text-muted-foreground">Total Collected</div>
                  <div className="text-3xl font-bold text-primary">
                    {payment.totalAmount} {payment.currency}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    from {payment.contributors.length} contributors
                  </div>
                </div>

                <Button
                  onClick={() => setShowCompletionModal(false)}
                  className="w-full gradient-primary"
                >
                  Awesome!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
};

export default JoinPayment;
