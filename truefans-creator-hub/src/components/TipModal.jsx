import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { sendTip, getRecentTips } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { Heart, Gift, Loader2 } from "lucide-react";

const TIP_AMOUNTS = [50, 100, 500];

export function TipModal({ open, onOpenChange, creatorId, creatorName }) {
  const [selected, setSelected] = useState(null);
  const [sending, setSending] = useState(false);
  const [loadingTips, setLoadingTips] = useState(false);
  const [recentTips, setRecentTips] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const { toast } = useToast();

  useEffect(() => {
    if (open && creatorId) {
      fetchTips();
    }
  }, [open, creatorId]);

  const fetchTips = async () => {
    setLoadingTips(true);
    const res = await getRecentTips(creatorId, true);
    if (res.success && res.data) {
      setRecentTips(res.data.supporters || []);
      setTotalAmount(res.data.totalAmount || 0);
    }
    setLoadingTips(false);
  };

  const handleSend = async () => {
    if (!selected) return;
    setSending(true);
    const res = await sendTip(creatorId, selected);
    setSending(false);

    if (res.success) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
      toast({ title: "Tip sent! 🎉", description: `You tipped ₹${selected} to ${creatorName}` });
      setSelected(null);
      fetchTips(); // Refresh tips list
    } else {
      toast({ title: "Failed to send tip", description: res.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Heart className="w-7 h-7 text-primary animate-pulse" fill="var(--primary)" fillOpacity={0.2} /> Support {creatorName}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">Choose a tip amount to show your appreciation.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 py-6">
          {TIP_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setSelected(amt)}
              className={`rounded-2xl border-2 py-4 md:py-5 text-center font-display font-bold text-xl transition-all duration-300 active:scale-[0.94] ${selected === amt ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20 scale-[1.03]" : "border-border hover:border-primary/40 hover:bg-secondary/50 bg-background"}`}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        <Button 
          onClick={handleSend} 
          disabled={!selected || sending} 
          className="w-full h-14 md:h-16 text-lg md:text-xl font-bold mb-6 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300" 
          variant="hero"
        >
          {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : selected ? `Send ₹${selected}` : "Select an amount"}
        </Button>

        {/* Recent Tips Section */}
        <div className="pt-6 mt-2 border-t border-border/60">
          <h4 className="font-semibold flex items-center gap-2 mb-4 text-foreground/90">
            <Gift className="w-4 h-4 text-primary" /> Your Recent Support
            {totalAmount > 0 && <span className="ml-auto text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium shadow-sm">Total: ₹{totalAmount}</span>}
          </h4>

          {loadingTips ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : recentTips.length > 0 ? (
            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
              {recentTips.map((tip) => (
                <div key={tip._id} className="group/tip flex items-center justify-between bg-card hover:bg-secondary/40 border border-border/50 p-3 rounded-xl transition-all duration-300">
                  <div className="flex items-center gap-3 w-full" key={tip._id}>
                    <img 
                      src={tip.senderId?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tip.senderId?.username || 'Anonymous'}`} 
                      className="w-10 h-10 rounded-full border border-border/50 bg-background object-cover shrink-0" 
                      alt="sender"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate group-hover/tip:text-primary transition-colors">{tip.senderId?.username || 'Someone'}</p>
                      <p className="text-xs text-muted-foreground truncate">{new Date(tip.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-display font-bold text-primary shrink-0 bg-primary/5 px-2 py-1 rounded-md">₹{tip.amount}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-secondary/20 rounded-xl border border-dashed border-border/60">
              <Gift className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No tips yet. Be the first to support!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}