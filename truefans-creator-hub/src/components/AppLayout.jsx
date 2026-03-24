import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Film, PlusSquare, Radio, User, LogOut, Flame, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/CreatePostModal";
import { useState } from "react";

export function AppLayout({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [postModalOpen, setPostModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const NavLinks = () => (
    <>
      <Link to="/" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${pathname === "/" ? "bg-primary/10 text-primary font-bold" : "hover:bg-accent/10"}`}>
        <Home className="w-6 h-6" />
        <span className="hidden md:block text-lg">Home</span>
      </Link>
      <Link to="/search" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${pathname === "/search" ? "bg-primary/10 text-primary font-bold" : "hover:bg-accent/10"}`}>
        <Search className="w-6 h-6" />
        <span className="hidden md:block text-lg">Search</span>
      </Link>
      <Link to="/reels" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${pathname === "/reels" ? "bg-primary/10 text-primary font-bold" : "hover:bg-accent/10"}`}>
        <Film className="w-6 h-6" />
        <span className="hidden md:block text-lg">Reels</span>
      </Link>
      <button onClick={() => setPostModalOpen(true)} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-accent/10 transition-colors w-full text-left">
        <PlusSquare className="w-6 h-6" />
        <span className="hidden md:block text-lg">Create Post</span>
      </button>
      <button className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-accent/10 transition-colors w-full text-left">
        <Radio className="w-6 h-6" />
        <span className="hidden md:block text-lg">Go Live</span>
      </button>
      <Link to="/dashboard" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${pathname.includes("/dashboard") ? "bg-primary/10 text-primary font-bold" : "hover:bg-accent/10"}`}>
        <User className="w-6 h-6" />
        <span className="hidden md:block text-lg">Profile</span>
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/60 fixed h-screen p-4 bg-background z-50">
        <Link to="/" className="flex items-center gap-3 font-display font-bold text-2xl px-4 py-4 mb-4">
          <Flame className="w-8 h-8 text-primary" />
          TrueFans
        </Link>
        <nav className="flex-1 flex flex-col gap-2">
          <NavLinks />
        </nav>
        <Button variant="ghost" className="justify-start gap-4 px-4 py-6 mt-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
          <LogOut className="w-6 h-6" />
          <span className="text-lg">Log Out</span>
        </Button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-0 relative min-h-screen z-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border/60 sticky top-0 bg-background/80 backdrop-blur z-40">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <Flame className="w-6 h-6 text-primary" />
            TrueFans
          </Link>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </header>
        
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {/* Mobile Bottom Navigation */}
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/80 backdrop-blur-xl z-50 grid grid-cols-5 h-16 items-stretch px-2 pb-safe shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-center h-full">
          <Link to="/" className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${pathname === "/" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary/80"}`}>
            <Home className="w-6 h-6" />
          </Link>
        </div>
        <div className="flex items-center justify-center h-full">
          <Link to="/search" className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${pathname === "/search" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary/80"}`}>
            <Search className="w-6 h-6" />
          </Link>
        </div>
        
        {/* Central Plus Button */}
        <div className="flex items-center justify-center h-full relative">
          <button 
            onClick={() => setPostModalOpen(true)} 
            className="absolute -top-7 left-1/2 -translate-x-1/2 p-3.5 bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-background flex items-center justify-center z-10"
          >
            <PlusSquare className="w-7 h-7" />
          </button>
        </div>

        <div className="flex items-center justify-center h-full">
          <Link to="/reels" className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${pathname === "/reels" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary/80"}`}>
            <Film className="w-6 h-6" />
          </Link>
        </div>
        <div className="flex items-center justify-center h-full">
          <Link to="/dashboard" className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${pathname.includes("/dashboard") ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary/80"}`}>
            <User className="w-6 h-6" />
          </Link>
        </div>
      </nav>

      <CreatePostModal open={postModalOpen} onOpenChange={setPostModalOpen} />
    </div>
  );
}
