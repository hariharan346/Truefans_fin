import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createPost } from "@/services/api";
import { ImagePlus, Loader2, X, Radio } from "lucide-react";

export function CreatePostModal({ open, onOpenChange, onSuccess }) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && !file) {
      toast({ title: "Please add a photo/video or write something!" });
      return;
    }

    setLoading(true);
    const res = await createPost(content, file);
    setLoading(false);

    if (res.success) {
      toast({ title: "Post created successfully!" });
      setContent("");
      setFile(null);
      setPreview(null);
      onOpenChange(false);
      if (onSuccess) onSuccess();
      else window.location.reload(); // Global refresh as fallback
    } else {
      toast({ title: "Error", description: res.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <Textarea 
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none border-none focus-visible:ring-0 px-0 text-lg"
          />

          {preview && (
            <div className="relative rounded-xl overflow-hidden bg-secondary">
              <button 
                type="button"
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              {file?.type.startsWith('video/') ? (
                <video src={preview} className="w-full max-h-[300px] object-cover" controls />
              ) : (
                <img src={preview} alt="Preview" className="w-full max-h-[300px] object-cover" />
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <input 
              type="file" 
              accept="image/*,video/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="gap-2 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Media</span>
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="gap-2 text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10"
              >
                <Radio className="w-4 h-4" />
                <span className="hidden sm:inline">Go Live</span>
              </Button>
            </div>
            
            <Button type="submit" disabled={loading || (!content && !file)}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
