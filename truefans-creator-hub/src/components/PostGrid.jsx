import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPosts, getCreatorPosts, likePost } from "@/services/api";
import { PostGridSkeleton } from "@/components/Skeletons";
import { PostLikesModal } from "@/components/PostLikesModal";
import { Heart } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export function PostGrid({ creatorId, isGlobalFeed = false }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false); // Pagination disabled globally for simplicity right now unless we added it on backend
  const [loading, setLoading] = useState(true);
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [selectedLikes, setSelectedLikes] = useState([]);
  const sentinelRef = useRef(null);
  const navigate = useNavigate();

  // Retrieve current user for optimistic updates
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser ? (currentUser.id || currentUser._id) : null;

  const fetchPosts = useCallback(async p => {
    setLoading(true);
    const res = isGlobalFeed ? await getAllPosts() : await getCreatorPosts(creatorId);
    if (res.success) {
      setPosts(res.data);
      setHasMore(false); // No pagination natively implemented yet on the backend
    }
    setLoading(false);
  }, [creatorId, isGlobalFeed]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPage(p => p + 1);
      }
    }, {
      threshold: 0.5
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) fetchPosts(page);
  }, [page, fetchPosts]);

  if (loading && posts.length === 0) return <PostGridSkeleton />;

  if (!loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-secondary/30 rounded-2xl border border-dashed border-border mt-4">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
        <h3 className="text-xl font-bold mb-2">No posts yet</h3>
        <p className="text-muted-foreground">{isGlobalFeed ? "Check back later for new content from creators!" : "This creator hasn't posted anything yet."}</p>
      </div>
    );
  }

  const handlePostClick = (post) => {
    if (post.user?._id) {
      navigate(`/dashboard/${post.user._id}`);
    } else if (post.user) {
      // Handle case where user is just an ID (not populated)
      navigate(`/dashboard/${post.user}`);
    }
  };

  const handleLike = async (e, postId, index) => {
    e.stopPropagation(); // Don't trigger post click
    if (!currentUserId) return; // Must be logged in

    const newPosts = [...posts];
    // Deep clone the post to avoid direct state mutation and force re-render correctly
    const post = { ...newPosts[index] };
    newPosts[index] = post;
    
    // Ensure likes is an array
    post.likes = Array.isArray(post.likes) ? post.likes : [];
    
    const hasLiked = post.likes.some(u => (u._id || u) === currentUserId);
    
    if (hasLiked) {
      post.likes = post.likes.filter(u => (u._id || u) !== currentUserId);
    } else {
      post.likes.push({ _id: currentUserId, name: currentUser.name || 'You', profileImage: currentUser.profileImage });
    }
    setPosts(newPosts);

    // Call API
    const res = await likePost(postId);
    if (res.success && res.data?.likes) {
      // Sync with server state
      const syncedPosts = [...newPosts];
      const syncedPost = { ...syncedPosts[index] };
      syncedPost.likes = res.data.likes;
      syncedPosts[index] = syncedPost;
      setPosts(syncedPosts);
    }
  };

  const handleLikesClick = (e, post) => {
    e.stopPropagation(); // Don't trigger post click
    setSelectedLikes(Array.isArray(post.likes) ? post.likes : []);
    setLikesModalOpen(true);
  };

  return <>
      <div className="grid grid-cols-3 md:grid-cols-3 gap-1 sm:gap-2 md:gap-4">
        {posts.map((post, i) => <ScrollReveal key={post._id || post.id} delay={i % 3 * 60}>
            <div 
              className="group relative aspect-square rounded-md sm:rounded-xl md:rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 bg-secondary/20 border border-border/40"
              onClick={() => handlePostClick(post)}
            >
              <img src={post.mediaUrl || post.image} alt={post.content || post.caption} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-2 md:p-4">
                
                {/* Top Section: Author Info */}
                {post.user && (
                  <div className="flex items-center gap-2 text-white -translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <img 
                      src={post.user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.name || 'User'}`} 
                      alt={post.user.name} 
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/50 object-cover bg-black/50" 
                    />
                    <span className="font-semibold text-xs md:text-sm shadow-black drop-shadow-md truncate max-w-[100px] md:max-w-[150px]">
                      {post.user.name || 'User'}
                    </span>
                  </div>
                )}

                {/* Bottom Section: Likes (and push to center somewhat) */}
                <div className="flex items-center justify-center gap-2 text-white font-display font-bold text-lg md:text-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300 mb-auto mt-auto">
                  <button 
                    onClick={(e) => handleLike(e, post._id, i)} 
                    className="p-2 -m-2 hover:scale-110 active:scale-95 transition-transform"
                  >
                    <Heart className={`w-6 h-6 md:w-8 md:h-8 transition-colors drop-shadow-md ${post.likes?.some(u => (u._id || u) === currentUserId) ? 'fill-red-500 text-red-500' : 'fill-white/80 text-white/80 hover:fill-white/100'}`} />
                  </button>
                  <button 
                    onClick={(e) => handleLikesClick(e, post)}
                    className="tabular-nums drop-shadow-md hover:underline decoration-white/50 underline-offset-4 px-1"
                  >
                    {post.likes?.length || 0}
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>)}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-12" />}
      {loading && posts.length > 0 && <PostGridSkeleton />}

      {/* Likes Modal */}
      <PostLikesModal 
        open={likesModalOpen} 
        onOpenChange={setLikesModalOpen} 
        likes={selectedLikes} 
      />
    </>;
}