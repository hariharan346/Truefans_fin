import { useState, useEffect } from "react";
import { getAllPosts, getAllReels, getLiveUsers } from "@/services/api";
import { PostGrid } from "@/components/PostGrid";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Users, Radio } from "lucide-react";

export default function HomePage() {
  const [liveUsers, setLiveUsers] = useState([]);
  const [reelsPreview, setReelsPreview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [liveRes, reelsRes] = await Promise.all([
          getLiveUsers(),
          getAllReels()
        ]);
        if (liveRes.success) setLiveUsers(liveRes.data);
        if (reelsRes.success) setReelsPreview(reelsRes.data.slice(0, 5)); // First 5 for preview
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Live Users Strip */}
      {liveUsers.length > 0 && (
        <ScrollReveal>
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-4 uppercase tracking-wider">
              <Radio className="w-4 h-4 text-destructive animate-pulse" /> Live Now
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory px-1">
              {liveUsers.map((user) => (
                <div key={user._id} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer snap-center group">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 rounded-full border-2 border-destructive animate-ping opacity-20 group-hover:opacity-40"></div>
                    <img 
                      src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                      className="relative z-10 w-16 h-16 md:w-18 md:h-18 rounded-full border-2 border-destructive p-[2px] object-cover ring-2 ring-background group-hover:scale-105 transition-transform duration-300 shadow-md" 
                      alt={user.name} 
                    />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-20 shadow-sm border border-background">
                      LIVE
                    </div>
                  </div>
                  <span className="text-xs font-semibold truncate w-16 text-center text-foreground/90 group-hover:text-primary transition-colors">{user.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Reels Preview */}
      {reelsPreview.length > 0 && (
        <ScrollReveal>
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-4 uppercase tracking-wider">
              <Users className="w-4 h-4" /> Trending Reels
            </h2>
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
              {reelsPreview.map((reel) => (
                <div key={reel._id} className="relative w-36 md:w-40 h-60 md:h-64 flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer group snap-center shadow-md bg-black">
                  <video 
                    src={reel.videoUrl} 
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-80 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-3 pointer-events-none">
                    <div className="flex items-center gap-2 text-white">
                      <img 
                        src={reel.user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.user.name}`} 
                        className="w-6 h-6 rounded-full object-cover border-2 border-white/50 bg-background shadow-sm"
                        alt={reel.user.name}
                      />
                      <span className="text-xs font-semibold truncate w-20 shadow-black drop-shadow-md tracking-wide">{reel.user.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Global Post Feed */}
      <ScrollReveal>
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold">Your Feed</h2>
          <p className="text-muted-foreground text-sm">Discover what's happening</p>
        </div>
        
        {/* We use PostGrid but without creatorId, so it fetches all posts */}
        <PostGrid isGlobalFeed={true} />
      </ScrollReveal>
    </div>
  );
}
