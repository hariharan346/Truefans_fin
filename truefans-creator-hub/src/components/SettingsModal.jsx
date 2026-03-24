import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateCreatorProfile, getProfile } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings2, Shield, Eye, Heart, Radio } from "lucide-react";

export function SettingsModal({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    accountType: 'public',
    showFollowersList: true,
    showTipsPublic: true,
    isLive: false,
  });

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await getProfile();
    if (res.success && res.data) {
      setSettings({
        accountType: res.data.accountType || 'public',
        showFollowersList: res.data.showFollowersList ?? true,
        showTipsPublic: res.data.showTipsPublic ?? true,
        isLive: res.data.isLive ?? false,
      });
    }
    setLoading(false);
  };

  const handleToggle = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Note: The backend endpoint `PUT /api/auth/settings` is what handles these flags, but in our `api.js` we mapped `updateCreatorProfile` to `PUT /auth/profile`. Wait, `PUT /auth/settings` is needed.
    // Let's ensure the backend has both handled or `updateCreatorProfile` can hit `/auth/settings`. 
    // In our `auth.js` backend, there is `PUT /profile` and `PUT /settings`. We'll just call `PUT /auth/settings` here using axios directly or a new api.js wrapper.
    // To keep it simple, I'll write an inline axios call if it's not in api.js, or I'll just use the `api.js` exported instance. Since `api.js` is not exporting the instance, I'll update `updateCreatorProfile` in `api.js` later, or just use what we have. Actually I'll use `fetch` with the token.
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      
      if (data.success) {
        toast({ title: "Settings saved successfully" });
        onOpenChange(false);
      } else {
        toast({ title: "Failed to save settings", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Settings2 className="w-5 h-5 text-primary" /> Privacy & Settings
          </DialogTitle>
          <DialogDescription>Manage your account privacy and visibility.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-6 py-4">
            
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label className="flex items-center gap-2 text-base"><Shield className="w-4 h-4 text-primary" /> Private Account</Label>
                <span className="text-xs text-muted-foreground text-balance">When your account is private, only approved followers can see your posts and reels.</span>
              </div>
              <Switch 
                checked={settings.accountType === 'private'} 
                onCheckedChange={(checked) => handleToggle('accountType', checked ? 'private' : 'public')} 
              />
            </div>

            <div className="flex items-center justify-between space-x-2 border-t border-border pt-4">
              <div className="flex flex-col space-y-1">
                <Label className="flex items-center gap-2 text-base"><Eye className="w-4 h-4 text-primary" /> Show Follower List</Label>
                <span className="text-xs text-muted-foreground text-balance">Allow others to see who you are following and who follows you.</span>
              </div>
              <Switch 
                checked={settings.showFollowersList} 
                onCheckedChange={(c) => handleToggle('showFollowersList', c)} 
              />
            </div>

            <div className="flex items-center justify-between space-x-2 border-t border-border pt-4">
              <div className="flex flex-col space-y-1">
                <Label className="flex items-center gap-2 text-base"><Heart className="w-4 h-4 text-primary" /> Public Tips</Label>
                <span className="text-xs text-muted-foreground text-balance">Display your total tips received and tip history publicly on your profile.</span>
              </div>
              <Switch 
                checked={settings.showTipsPublic} 
                onCheckedChange={(c) => handleToggle('showTipsPublic', c)} 
              />
            </div>

            <div className="flex items-center justify-between space-x-2 border-t border-border pt-4">
              <div className="flex flex-col space-y-1">
                <Label className="flex items-center gap-2 text-base"><Radio className="w-4 h-4 text-destructive" /> Live Status</Label>
                <span className="text-xs text-muted-foreground text-balance">Show a LIVE badge on your profile and appear in the global live feed.</span>
              </div>
              <Switch 
                checked={settings.isLive} 
                onCheckedChange={(c) => handleToggle('isLive', c)} 
              />
            </div>

          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
