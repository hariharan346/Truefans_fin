import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Navbar } from "@/components/Navbar";
import { Flame, Zap, Shield, TrendingUp, Heart, Users, ArrowRight } from "lucide-react";
const features = [{
  icon: Heart,
  title: "Direct Support",
  desc: "Fans tip creators directly — no middlemen, no delays."
}, {
  icon: Shield,
  title: "Own Your Audience",
  desc: "Your followers, your rules. No algorithm gatekeeping."
}, {
  icon: TrendingUp,
  title: "Analytics That Matter",
  desc: "Understand what resonates. Grow with real insights."
}, {
  icon: Users,
  title: "Community First",
  desc: "Build genuine connections, not just follower counts."
}];
export default function LandingPage() {
  return <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-32 px-4">
        <div className="container max-w-5xl mx-auto text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" /> Now in early access
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              Turn your passion into
              <br />
              <span className="gradient-text">a livelihood</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              TrueFans helps creators monetize through tips, exclusive content,
              and real community — not ads or algorithms.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" asChild>
                <Link to="/register">
                  Start Creating <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="hero-outline" asChild>
                <Link to="/dashboard">See Demo</Link>
              </Button>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal delay={450}>
            <div className="flex items-center justify-center gap-8 md:gap-16 mt-16 text-center">
              {[{
              num: "2,340+",
              label: "Creators"
            }, {
              num: "₹18L+",
              label: "Tips Sent"
            }, {
              num: "89K",
              label: "True Fans"
            }].map(s => <div key={s.label}>
                  <div className="font-display text-2xl md:text-3xl font-bold tabular-nums">{s.num}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>)}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 bg-secondary/40 px-4">
        <div className="container max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Built for creators who mean it
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Everything you need to build a sustainable creative practice.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-5">
            {features.map((f, i) => <ScrollReveal key={f.title} delay={i * 100}>
                <div className="glass-card p-8 hover-lift group">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <Flame className="w-10 h-10 text-primary mx-auto mb-6 animate-float" />
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to find your true fans?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of creators already earning on their own terms.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/register">Create Your Page <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-display font-semibold text-foreground">
            <Flame className="w-4 h-4 text-primary" /> TrueFans
          </div>
          <p>© 2026 TrueFans. All rights reserved.</p>
        </div>
      </footer>
    </div>;
}