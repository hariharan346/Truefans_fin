import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserNetwork, followCreator } from "@/services/api";
import { Loader2, UserPlus, UserCheck, Clock, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function FollowListModal({ isOpen, onClose, userId, initialTab = 'followers' }) {
  const [loading, setLoading] = useState(true);
  const [network, setNetwork] = useState({ followers: [], following: [], isHidden: false });
  const [actionLoading, setActionLoading] = useState(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchNetwork();
    }
  }, [isOpen, userId]);

  const fetchNetwork = async () => {
    setLoading(true);
    const res = await getUserNetwork(userId);
    if (res.success) {
      setNetwork(res.data);
    }
    setLoading(false);
  };

  const handleFollow = async (e, targetUser, listType) => {
    e.preventDefault();
    e.stopPropagation();
    
    setActionLoading(targetUser._id);
    const res = await followCreator(targetUser._id);
    
    if (res.success) {
      // Optimistically update the specific user inside the specific list
      const updateList = (list) => list.map(u => {
        if (u._id === targetUser._id) {
          return {
            ...u,
            isFollowing: res.data.isFollowing,
            hasSentRequest: res.data.status === 'requested',
            followersCount: res.data.isFollowing ? u.followersCount + 1 : (res.data.status === 'unfollowed' ? u.followersCount - 1 : u.followersCount)
          };
        }
        return u;
      });

      setNetwork(prev => ({
        ...prev,
        followers: updateList(prev.followers),
        following: updateList(prev.following)
      }));
      
      toast({ title: res.message });
    } else {
      toast({ title: "Failed", description: res.message, variant: "destructive" });
    }
    setActionLoading(null);
  };

  const renderList = (users, listType) => {
    if (loading) {
      return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (network.isHidden) {
      return (
        <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
          <Lock className="w-12 h-12 mb-4 opacity-20" />
          <p>This user's network is private.</p>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
          <Users className="w-12 h-12 mb-4 opacity-20" />
          <p>No {listType} yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {users.map(user => (
          <div 
            key={user._id} 
            onClick={() => {
              onClose();
              navigate(`/dashboard/${user._id}`);
            }}
            className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary border border-transparent hover:border-border transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt={user.name} 
                className="w-12 h-12 rounded-full object-cover bg-background shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-semibold text-sm flex items-center gap-2 group-hover:text-primary transition-colors truncate">
                  {user.name}
                  {user.accountType === 'private' && <Lock className="w-3 h-3 text-muted-foreground" />}
                </h4>
                <p className="text-xs text-muted-foreground truncate">@{user.email.split('@')[0]}</p>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="shrink-0 ml-2">
              <Button 
                size="sm"
                variant={user.isFollowing || user.hasSentRequest ? "secondary" : "default"}
                disabled={actionLoading === user._id}
                onClick={(e) => handleFollow(e, user, listType)}
                className="h-8 text-xs rounded-full px-4"
              >
                {user.isFollowing ? 'Following' : 
                 user.hasSentRequest ? 'Requested' : 'Follow'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center">Network</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={initialTab} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 rounded-xl p-1">
            <TabsTrigger value="followers" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-10">
              Followers ({network.isHidden ? '-' : network.followers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="following" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-10">
              Following ({network.isHidden ? '-' : network.following?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="mt-0">
            {renderList(network.followers, 'followers')}
          </TabsContent>
          <TabsContent value="following" className="mt-0">
            {renderList(network.following, 'following')}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
