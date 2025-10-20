import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Zap, Shield, TrendingUp, ArrowRight } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Micro-Tips</span> on Hedera
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Support your favorite creators with instant, low-fee micro-tips powered by HBAR.
              The future of digital tipping is here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 smooth-transition text-lg px-8 animate-glow"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/20 hover:bg-primary/10 text-lg px-8"
                onClick={() => navigate("/creators")}
              >
                Browse Creators
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 animate-slide-up">
            <Card className="glass border-primary/20 hover:border-primary/40 smooth-transition">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Instant transactions with Hedera's high-throughput network. No waiting, just tipping.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-primary/20 hover:border-primary/40 smooth-transition">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Ultra Low Fees</CardTitle>
                <CardDescription>
                  Send tips as small as $0.01 with negligible fees. Perfect for micro-transactions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-primary/20 hover:border-primary/40 smooth-transition">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle>For Creators</CardTitle>
                <CardDescription>
                  Built for developers, artists, musicians, writers, and all creators to monetize their work.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold gradient-text mb-2">$0.0001</h3>
              <p className="text-muted-foreground">Average Transaction Fee</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold gradient-text mb-2">3-5s</h3>
              <p className="text-muted-foreground">Transaction Finality</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold gradient-text mb-2">10,000+</h3>
              <p className="text-muted-foreground">Transactions Per Second</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Ready to Start Tipping?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the micro-tipping revolution and support creators directly on the Hedera network.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 smooth-transition text-lg px-8"
          >
            Create Your Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
