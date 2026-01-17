import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Wallet, QrCode, Banknote, PartyPopper } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalPrice: number;
  onConfirm: (method: string) => void;
}

const CONFETTI_COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#EC4899", "#8B5CF6"];

const PaymentModal = ({ open, onOpenChange, totalPrice, onConfirm }: PaymentModalProps) => {
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentMethod, setCurrentMethod] = useState("");
  const [confetti, setConfetti] = useState<React.ReactNode[]>([]);
  const navigate = useNavigate();

  const createConfetti = () => {
    const pieces: React.ReactNode[] = [];
    for (let i = 0; i < 50; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 0.5;
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      pieces.push(
        <div
          key={i}
          className="confetti"
          style={{
            left: `${left}%`,
            backgroundColor: color,
            animationDelay: `${delay}s`,
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
          }}
        />
      );
    }
    setConfetti(pieces);
  };

  const handleCOD = () => {
    setCurrentMethod("cod");
    onConfirm("cod");
  };

  const handleUPI = async () => {
    if (!upiId) return;
    setCurrentMethod("upi");
    setProcessing(true);
    
    // Simulate UPI verification
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    setProcessing(false);
    setSuccess(true);
    createConfetti();
    setTimeout(() => {
      onConfirm("upi");
      resetState();
      navigate("/dashboard");
    }, 2000);
  };

  const handleQR = async () => {
    setCurrentMethod("qr");
    setProcessing(true);
    
    // Simulate QR payment verification
    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    setProcessing(false);
    setSuccess(true);
    createConfetti();
    setTimeout(() => {
      onConfirm("qr");
      resetState();
      navigate("/dashboard");
    }, 2000);
  };

  const resetState = () => {
    setUpiId("");
    setProcessing(false);
    setSuccess(false);
    setCurrentMethod("");
    setConfetti([]);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetState();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        {confetti}
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Complete Payment</DialogTitle>
        </DialogHeader>

        <div className="bg-secondary/50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="text-2xl font-bold text-primary">
              ₹{totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 animate-scale-in">
            <div className="relative">
              <CheckCircle className="w-16 h-16 text-primary mb-4" />
              <PartyPopper className="w-8 h-8 text-accent absolute -top-2 -right-2 animate-bounce" />
            </div>
            <p className="text-lg font-medium text-foreground">Payment Successful!</p>
            <p className="text-sm text-muted-foreground">Redirecting to My Bookings...</p>
          </div>
        ) : (
          <Tabs defaultValue="cod" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cod" className="gap-2">
                <Banknote className="w-4 h-4" />
                COD
              </TabsTrigger>
              <TabsTrigger value="upi" className="gap-2">
                <Wallet className="w-4 h-4" />
                UPI
              </TabsTrigger>
              <TabsTrigger value="qr" className="gap-2">
                <QrCode className="w-4 h-4" />
                QR
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cod" className="mt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Banknote className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Pay cash upon arrival at the property. Your booking will be reserved.
                </p>
                <Button onClick={handleCOD} className="w-full" size="lg">
                  Confirm Booking
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upi" className="mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="upi">UPI ID</Label>
                  <Input
                    id="upi"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleUPI}
                  className="w-full"
                  size="lg"
                  disabled={!upiId || processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying Payment...
                    </>
                  ) : (
                    "Verify & Pay"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="mt-6">
              <div className="text-center space-y-4">
                <div className="w-48 h-48 mx-auto bg-background rounded-lg flex items-center justify-center border-2 border-dashed border-border p-4">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=villanest@upi&pn=VillaNest&am=" 
                    alt="Payment QR Code"
                    className="w-full h-full"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with any UPI app to pay
                </p>
                <Button
                  onClick={handleQR}
                  className="w-full"
                  size="lg"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying Payment...
                    </>
                  ) : (
                    "I've Made the Payment"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
