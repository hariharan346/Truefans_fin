import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { searchUsers, followCreator } from "@/services/api";
import { Search, Loader2, UserPlus, Clock, Lock, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 0) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (searchTerm) => {
    setLoading(true);
    const res = await searchUsers(searchTerm);
    if (res.success) {
      setResults(res.data);
    }
    setLoading(false);
  };

  const handleFollow = async (e, user) => {
    e.preventDefault();
    e.stopPropagation();
    
    setActionLoading(user._id);
    const res = await followCreator(user._id);
    
    if (res.success) {
      setResults(prev => prev.map(u => {
        if (u._id === user._id) {
          return {
            ...u,
            isFollowing: res.data.isFollowing,
            hasSentRequest: res.data.status === 'requested',
            followersCount: res.data.isFollowing ? u.followersCount + 1 : (res.data.status === 'unfollowed' ? u.followersCount - 1 : u.followersCount)
          };
        }
        return u;
      }));
      toast({ title: res.message });
    } else {
      toast({ title: "Failed", description: res.message, variant: "destructive" });
    }
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto pt-16 md:pt-4">
        
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full shrink-0 hover:bg-secondary">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="font-display font-bold text-3xl">Discover Creators</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              className="pl-10 h-12 text-lg rounded-full shadow-sm bg-card border-border pr-4 placeholder:text-muted-foreground"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setSearchParams({ q: e.target.value })}
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!loading && query.length > 0 && results.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-secondary/30 rounded-2xl border border-dashed border-border">
              No creators found for "{query}"
            </div>
          )}

          {results.map((user) => (
            <div 
              key={user._id} 
              onClick={() => navigate(`/dashboard/${user._id}`)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer"
            >
              <img 
                src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt={user.name} 
                className="w-14 h-14 rounded-full object-cover bg-secondary shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate flex items-center gap-2 group-hover:text-primary transition-colors">
                  {user.name}
                  {user.accountType === 'private' && <Lock className="w-4 h-4 text-muted-foreground" />}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-muted-foreground truncate">@{user.email.split('@')[0]}</p>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full font-medium">
                    {user.followersCount || 0} Followers
                  </span>
                </div>
              </div>
              
              <div className="shrink-0 ml-2">
                {!user.isFollowing && (
                  <Button 
                    size="sm"
                    variant={user.hasSentRequest ? "secondary" : "default"}
                    disabled={actionLoading === user._id}
                    onClick={(e) => handleFollow(e, user)}
                    className="rounded-full shadow-sm"
                  >
                    {user.hasSentRequest ? <><Clock className="w-4 h-4 mr-1.5" /> Requested</> : 
                     <><UserPlus className="w-4 h-4 mr-1.5" /> Follow</>}
                  </Button>
                )}
              </div>
            </div>
          ))}

          {!query && results.length === 0 && (
             <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
               <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                 <Search className="w-10 h-10 text-muted-foreground opacity-50" />
               </div>
               <p className="font-medium">Type something to find your favorite creators.</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
