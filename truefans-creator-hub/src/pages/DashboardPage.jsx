import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCreatorProfile, getProfile, followCreator, updateCreatorProfile } from "@/services/api";
import { ProfileSkeleton } from "@/components/Skeletons";
import { PostGrid } from "@/components/PostGrid";
import { TipModal } from "@/components/TipModal";
import { SettingsModal } from "@/components/SettingsModal";
import { SupportersList } from "@/components/SupportersList";
import { FollowListModal } from "@/components/FollowListModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Camera, Heart, UserPlus, UserCheck, Edit2, Lock, Clock, Settings, ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [networkTab, setNetworkTab] = useState('followers');
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = id ? await getCreatorProfile(id) : await getProfile();
      if (res.success) {
        setCreator(res.data);
        setIsSelf(!id || (res.data._id === localStorage.getItem("userId")));
      } else {
        toast({ title: "Error", description: res.message, variant: "destructive" });
      }
      setLoading(false);
    })();
  }, [id, toast]);

  const handleFollow = async () => {
    if (!creator || isSelf) return;
    setFollowLoading(true);
    const res = await followCreator(creator._id);
    if (res.success) {
      setCreator(c => ({
        ...c,
        isFollowing: res.data.isFollowing,
        hasSentRequest: res.data.status === 'requested',
        followersCount: res.data.isFollowing ? c.followersCount + 1 : (res.data.status === 'unfollowed' ? c.followersCount - 1 : c.followersCount)
      }));
      toast({
        title: res.message
      });
    }
    setFollowLoading(false);
  };

  const handleImageUpload = (type, file) => {
    if (!isSelf && !!id) return; // Prevent uploading if not self
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result;
      const updates = type === "avatar" ? { profileImage: base64data } : { banner: base64data };
      
      // Optimistic UI
      setCreator(c => ({ ...c, ...updates }));
      
      const res = await updateCreatorProfile(updates);
      if (res.success) {
        toast({ title: `${type === "avatar" ? "Profile" : "Banner"} image updated` });
      } else {
        toast({ title: "Upload failed", variant: "destructive" });
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 md:pt-8 p-4">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!creator) return <div className="text-center pt-20">User not found</div>;

  const isPrivateAndHidden = id && creator.isPrivateVisible === false;

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative group">
        {!!id && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="absolute top-4 left-4 z-20 rounded-full bg-background/50 hover:bg-background/80 text-foreground backdrop-blur shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="w-full h-32 md:h-72 overflow-hidden bg-secondary relative">
          <img 
            src={creator.banner || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop`} 
            alt="Banner" 
            className="w-full h-full object-cover" 
          />
          {/* Subtle gradient so the profile pic pops more */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/40 to-transparent"></div>
        </div>
        {(!id || isSelf) && (
          <>
            <button onClick={() => bannerInputRef.current?.click()} className="absolute top-4 right-4 bg-foreground/60 text-primary-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 backdrop-blur-sm">
              <Camera className="w-5 h-5" />
            </button>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload("banner", e.target.files[0])} />
          </>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-5 -mt-12 md:-mt-20 relative z-10">
          {/* Avatar */}
          <div className="relative group shrink-0 self-start md:self-auto">
            <img 
              src={creator.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.name}`} 
              alt={creator.name} 
              className="w-24 h-24 md:w-40 md:h-40 rounded-full border-[4px] md:border-[6px] border-background object-cover shadow-xl bg-background transition-transform duration-300 group-hover:scale-[1.02]" 
            />
            {(!id || isSelf) && (
              <>
                <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 rounded-full bg-foreground/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Edit2 className="w-6 h-6 text-primary-foreground drop-shadow-md" />
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload("avatar", e.target.files[0])} />
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pb-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight flex items-center gap-2">
              {creator.name}
              {creator.accountType === 'private' && <Lock className="w-4 h-4 text-muted-foreground" />}
            </h1>
            <p className="text-muted-foreground text-sm">@{creator.email?.split('@')[0] || 'user'}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3 pb-2 mt-4 md:mt-0 w-full md:w-auto">
            {(!id || isSelf) && (
              <Button variant="outline" onClick={() => setSettingsOpen(true)} className="gap-2 w-full md:w-auto rounded-xl">
                <Settings className="w-4 h-4" /> Edit Profile
              </Button>
            )}

            {!!id && !isSelf && (
              <>
                <Button 
                  variant={creator.isFollowing || creator.hasSentRequest ? "secondary" : "default"} 
                  onClick={handleFollow} 
                  disabled={followLoading} 
                  className="gap-2 flex-1 md:flex-none rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {creator.isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : 
                   creator.hasSentRequest ? <><Clock className="w-4 h-4" /> Requested</> : 
                   <><UserPlus className="w-4 h-4" /> Follow</>}
                </Button>

                {!isPrivateAndHidden && (
                  <Button variant="hero" onClick={() => setTipOpen(true)} className="gap-2 rounded-xl px-6 shadow-md shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                    <Heart className="w-4 h-4" /> Tip
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bio + Stats */}
        <ScrollReveal>
          <div className="mt-5 md:mt-6 mb-8">
            <p className="text-foreground/80 max-w-xl leading-relaxed mb-6 text-[15px] md:text-base">{creator.bio}</p>
            <div className="flex max-w-sm gap-4">
              {(!isPrivateAndHidden) ? (
                <>
                  <button 
                    onClick={() => { setNetworkTab('followers'); setNetworkModalOpen(true); }}
                    className="flex-1 bg-secondary/30 hover:bg-secondary/60 rounded-xl p-3 text-center cursor-pointer border border-border/50 transition-all hover:border-primary/30"
                  >
                    <div className="font-display font-bold text-xl md:text-2xl text-foreground">{creator.followersCount || (creator.followers?.length || 0)}</div>
                    <div className="text-muted-foreground text-xs md:text-sm font-medium uppercase tracking-wider mt-0.5">Followers</div>
                  </button>
                  <button 
                    onClick={() => { setNetworkTab('following'); setNetworkModalOpen(true); }}
                    className="flex-1 bg-secondary/30 hover:bg-secondary/60 rounded-xl p-3 text-center cursor-pointer border border-border/50 transition-all hover:border-primary/30"
                  >
                    <div className="font-display font-bold text-xl md:text-2xl text-foreground">{creator.followingCount || (creator.following?.length || 0)}</div>
                    <div className="text-muted-foreground text-xs md:text-sm font-medium uppercase tracking-wider mt-0.5">Following</div>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 bg-secondary/20 rounded-xl p-3 text-center border border-border/50 opacity-60">
                    <div className="font-display font-bold text-xl md:text-2xl text-foreground">{creator.followersCount || (creator.followers?.length || 0)}</div>
                    <div className="text-muted-foreground text-xs md:text-sm font-medium uppercase tracking-wider mt-0.5">Followers</div>
                  </div>
                  <div className="flex-1 bg-secondary/20 rounded-xl p-3 text-center border border-border/50 opacity-60">
                    <div className="font-display font-bold text-xl md:text-2xl text-foreground">{creator.followingCount || (creator.following?.length || 0)}</div>
                    <div className="text-muted-foreground text-xs md:text-sm font-medium uppercase tracking-wider mt-0.5">Following</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Tabbed Content Area */}
        <div className="mt-8 mb-16">
          {isPrivateAndHidden ? (
            <ScrollReveal>
              <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-secondary/10 rounded-2xl border border-dashed border-border">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">This account is private</h3>
                <p className="text-muted-foreground">Follow this account to unlock their content and supporters.</p>
              </div>
            </ScrollReveal>
          ) : (
            <Tabs defaultValue="content" className="w-full">
              <TabsList className={`grid w-full ${isSelf ? 'grid-cols-2' : 'grid-cols-1'} bg-secondary/30 rounded-xl p-1 mb-8`}>
                <TabsTrigger value="content" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-12 text-base">
                  Content
                </TabsTrigger>
                {isSelf && (
                  <TabsTrigger value="supporters" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-12 text-base">
                    Supporters & Tips
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="content" className="mt-0">
                <PostGrid creatorId={creator._id} />
              </TabsContent>
              
              {isSelf && (
                <TabsContent value="supporters" className="mt-0">
                  <SupportersList 
                    creatorId={creator._id} 
                    isSelf={isSelf} 
                    showTipsPublic={creator.showTipsPublic} 
                  />
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </div>

      <TipModal open={tipOpen} onOpenChange={setTipOpen} creatorId={creator._id} creatorName={creator.name} />
      {(!id || isSelf) && <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />}
      
      {creator && (
        <FollowListModal 
          isOpen={networkModalOpen} 
          onClose={() => setNetworkModalOpen(false)} 
          userId={creator._id} 
          initialTab={networkTab}
        />
      )}
    </div>
  );
}