import { useState, useEffect, useRef } from "react";
import { getReels, createReel, likeReel } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, UploadCloud, Film } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReels();
  }, []);

  // Retrieve current user for likes
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser ? (currentUser.id || currentUser._id) : null;
  
  const fetchReels = async () => {
    setLoading(true);
    const res = await getReels();
    if (res.success) {
      setReels(res.data);
    }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({ title: "Please select a video file", variant: "destructive" });
      return;
    }
    
    setUploading(true);
    const res = await createReel(caption, file);
    setUploading(false);
    
    if (res.success) {
      toast({ title: "Reel uploaded successfully!" });
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchReels(); // Refresh feed
    } else {
      toast({ title: "Failed to upload reel", description: res.message, variant: "destructive" });
    }
  };

  const handleLike = async (reelId, index) => {
    if (!currentUserId) {
      toast({ title: "Please login to like reels", variant: "destructive" });
      return;
    }

    const newReels = [...reels];
    const reel = { ...newReels[index] };
    newReels[index] = reel;
    
    reel.likes = Array.isArray(reel.likes) ? reel.likes : [];
    const hasLiked = reel.likes.some(u => (u._id || u) === currentUserId);
    
    // Optimistic update
    if (hasLiked) {
      reel.likes = reel.likes.filter(u => (u._id || u) !== currentUserId);
    } else {
      reel.likes.push({ _id: currentUserId, name: currentUser.name || 'You' });
    }
    setReels(newReels);

    // API call
    const res = await likeReel(reelId);
    if (res.success && res.data?.likes) {
      const syncedReels = [...newReels];
      syncedReels[index] = { ...syncedReels[index], likes: res.data.likes };
      setReels(syncedReels);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-4">
      
      {/* Upload Section */}
      <div className="px-4 max-w-lg mx-auto w-full mb-4 md:mb-6">
        <form onSubmit={handleUpload} className="glass-card p-3 md:p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input 
              placeholder="Write a catchy caption..." 
              value={caption} 
              onChange={(e) => setCaption(e.target.value)} 
              className="bg-background/50 border-0 shadow-inner h-10 md:h-11"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="flex-1 md:flex-none flex items-center justify-center p-2 h-10 md:h-11 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer text-sm font-semibold max-w-[140px] truncate">
              <Film className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">{fileInputRef.current?.files?.[0]?.name || "Select Video"}</span>
              <input 
                type="file" 
                accept="video/*" 
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) setCaption(prev => prev);
                }}
              />
            </label>
            <Button type="submit" disabled={uploading || loading} className="h-10 md:h-11 shrink-0 px-4 shadow-md rounded-xl">
              {uploading ? "..." : <><UploadCloud className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Post</span></>}
            </Button>
          </div>
        </form>
      </div>

      {/* Reels Feed */}
      <div className="flex-1 overflow-y-auto snap-y snap-mandatory bg-black rounded-t-3xl border-t border-border mt-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-white/50">Loading reels...</div>
        ) : reels.length === 0 ? (
          <div className="h-[70vh] flex flex-col items-center justify-center text-center p-6 text-white bg-black">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6 border border-white/20 shadow-xl">
              <Film className="w-10 h-10 text-white/70" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">No reels found</h3>
            <p className="text-white/60 max-w-xs text-lg">Be the first to upload a reel and share with your true fans!</p>
          </div>
        ) : (
          reels.map((reel, index) => (
            <div 
              key={reel._id} 
              className="relative w-full h-[calc(100vh-13rem)] md:h-[calc(100vh-6rem)] max-w-md mx-auto snap-start snap-always bg-black md:rounded-2xl overflow-hidden shadow-2xl"
            >
              <video 
                src={reel.videoUrl} 
                className="w-full h-full object-cover"
                autoPlay 
                muted 
                loop 
                playsInline
              />
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none opacity-90" />
              
              <div className="absolute bottom-6 left-4 right-16 text-white drop-shadow-md z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary to-accent">
                    <img 
                      src={reel.user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.user?.name}`} 
                      alt={reel.user?.name} 
                      className="w-10 h-10 rounded-full border-2 border-black object-cover bg-background"
                    />
                  </div>
                  <span className="font-display font-semibold text-lg tracking-wide">{reel.user?.name}</span>
                </div>
                <p className="text-sm md:text-base line-clamp-3 text-white/90 leading-relaxed font-medium">{reel.caption}</p>
              </div>

              {/* Action Buttons */}
              <div className="absolute bottom-6 right-4 flex flex-col gap-6 items-center text-white drop-shadow-lg z-10">
                <button 
                  onClick={() => handleLike(reel._id, index)}
                  className="flex flex-col items-center gap-1.5 hover:scale-110 transition-transform active:scale-95 px-2"
                >
                  <div className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border transition-colors ${reel.likes?.some(u => (u._id || u) === currentUserId) ? 'bg-red-500/20 border-red-500/50' : 'bg-black/40 border-white/10 hover:bg-black/60'}`}>
                    <Heart className={`w-6 h-6 transition-colors ${reel.likes?.some(u => (u._id || u) === currentUserId) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </div>
                  <span className="text-xs font-bold shadow-black bg-black/20 px-2 py-0.5 rounded-full">{reel.likes?.length || 0}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
