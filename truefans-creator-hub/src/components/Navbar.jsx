import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
export function Navbar() {
  const {
    pathname
  } = useLocation();
  const isLanding = pathname === "/";
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <Flame className="w-6 h-6 text-primary" />
          TrueFans
        </Link>
        <div className="flex items-center gap-3">
          {isLanding ? <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </> : <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/reels">Reels</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">Home</Link>
              </Button>
            </>}
        </div>
      </div>
    </nav>;
}