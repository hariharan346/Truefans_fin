import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

export function PostLikesModal({ open, onOpenChange, likes }) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50 rounded-3xl p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-4 md:p-6 pb-2 border-b border-border/40">
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Likes
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col gap-3">
          {!likes || likes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No likes yet.
            </div>
          ) : (
            likes.map((user) => (
              <div 
                key={user._id || Math.random().toString()} 
                className="flex items-center gap-3 p-2 rounded-2xl hover:bg-secondary/40 transition-colors cursor-pointer group"
                onClick={() => {
                  onOpenChange(false);
                  if (user._id) navigate(`/dashboard/${user._id}`);
                }}
              >
                <div className="relative">
                  <img 
                    src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'User'}`} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-primary/30 transition-colors"
                  />
                  <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 pointer-events-none" />
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {user.name || 'Anonymous User'}
                  </h4>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
