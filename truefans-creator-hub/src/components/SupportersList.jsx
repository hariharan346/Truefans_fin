import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRecentTips } from "@/services/api";
import { Heart, TrendingUp, Clock, Medal, Trophy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollReveal } from "@/components/ScrollReveal";

export function SupportersList({ creatorId, isSelf, showTipsPublic }) {
  const [supporters, setSupporters] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest"); // 'latest' | 'highest'
  const navigate = useNavigate();

  useEffect(() => {
    if (creatorId) {
      fetchSupporters();
    }
  }, [creatorId]);

  const fetchSupporters = async () => {
    setLoading(true);
    const res = await getRecentTips(creatorId);
    if (res.success && res.data) {
      setSupporters(res.data.supporters || []);
      setTotalAmount(res.data.totalAmount || 0);
    }
    setLoading(false);
  };

  // Calculate top 3 unique supporters by total volume
  const top3Ids = useMemo(() => {
    const agg = supporters.reduce((acc, tip) => {
      const id = tip.senderId?._id;
      if (!id) return acc;
      acc[id] = (acc[id] || 0) + tip.amount;
      return acc;
    }, {});
    return Object.entries(agg)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(x => x[0]);
  }, [supporters]);

  // Sort the tips list
  const sortedSupporters = useMemo(() => {
    return [...supporters].sort((a, b) => {
      if (sortBy === "highest") {
        return b.amount - a.amount;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [supporters, sortBy]);

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground animate-pulse">Loading supporters...</div>;
  }

  // If tips are hidden and we aren't the owner, we might just show total amount or nothing.
  // Wait, backend logic returns `supporters: []` if `!isSelf && !showTipsPublic`.
  // The spec says: "IF showTipsPublic = false: Hide supporters list, Show only total tip amount".
  if (!isSelf && !showTipsPublic) {
    if (totalAmount === 0) return null; // Nothing to show
    return (
      <ScrollReveal>
        <div className="mb-10 bg-secondary/20 rounded-2xl p-6 border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-primary" />
            <h3 className="font-display font-semibold text-lg">Total Support Received</h3>
          </div>
          <span className="text-2xl font-bold text-primary">₹{totalAmount}</span>
        </div>
      </ScrollReveal>
    );
  }

  // If no tips at all
  if (supporters.length === 0) {
    return (
      <ScrollReveal>
        <div className="mb-10 flex flex-col items-center justify-center py-12 px-4 bg-secondary/30 rounded-2xl border border-dashed border-border text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-bold mb-2">No supporters yet</h3>
          <p className="text-muted-foreground">Share your profile to start receiving support!</p>
        </div>
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal>
      <div className="mb-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" /> Supporters & Tips
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Total received: <strong className="text-primary text-base">₹{totalAmount}</strong>
            </p>
          </div>
          
          <div className="w-full sm:w-48">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Latest</div>
                </SelectItem>
                <SelectItem value="highest">
                  <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Highest Amount</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Supporters Grid / List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSupporters.map((tip, idx) => {
            const sender = tip.senderId || {};
            const isTop = top3Ids.includes(sender._id);

            return (
              <div 
                key={tip._id} 
                className="group relative flex items-center gap-4 bg-card hover:bg-card/60 p-5 rounded-3xl border border-border shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => {
                  if (sender._id) navigate(`/dashboard/${sender._id}`);
                }}
              >
                {/* Profile Image */}
                <div className="relative shrink-0">
                  <img 
                    src={sender.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender.username || 'Anonymous'}`} 
                    alt={sender.username} 
                    className="w-16 h-16 rounded-full object-cover bg-secondary border-2 border-background shadow-sm group-hover:border-primary/30 transition-colors duration-300"
                  />
                  {isTop && (
                    <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-accent to-amber-500 text-white p-1.5 rounded-full shadow-lg" title="Top Supporter">
                      <Medal className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                      {sender.username || 'Anonymous'}
                    </h4>
                    <span className="font-display font-bold text-primary shrink-0">
                      ₹{tip.amount}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate pr-2">
                       {isTop ? <span className="text-accent font-medium">Top Supporter</span> : "Supporter"}
                    </span>
                    <span className="shrink-0">{new Date(tip.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}
