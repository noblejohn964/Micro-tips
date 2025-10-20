import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useHederaWallet } from "@/hooks/useHederaWallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Wallet, LogOut, TrendingUp, DollarSign, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  username: string;
  display_name: string | null;
  profession: string;
  bio: string | null;
  hedera_account_id: string | null;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { wallet, connectWallet, connectManualWallet, syncWalletWithProfile } = useHederaWallet();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tips, setTips] = useState<any[]>([]);
  const [manualWalletId, setManualWalletId] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTips();
      syncWalletWithProfile();
    }
  }, [user, syncWalletWithProfile]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
      return;
    }

    setProfile(data);
  };

  const fetchTips = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("tips")
      .select("*")
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching tips:", error);
      return;
    }

    setTips(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleManualConnect = async () => {
    if (!manualWalletId.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a Hedera account ID",
        variant: "destructive",
      });
      return;
    }
    await connectManualWallet(manualWalletId);
    setManualWalletId("");
    await fetchProfile(); // Refresh profile to show updated wallet
    await syncWalletWithProfile(); // Sync wallet state
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Welcome, {profile?.display_name || profile?.username}
            </h1>
            <p className="text-muted-foreground capitalize">{profile?.profession?.replace("_", " ")}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-primary/20 hover:bg-primary/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">
                {tips.filter(t => t.to_user_id === user?.id).reduce((acc, t) => acc + parseFloat(t.amount), 0).toFixed(4)} HBAR
              </div>
              <p className="text-xs text-muted-foreground">
                From {tips.filter(t => t.to_user_id === user?.id).length} tips
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <DollarSign className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">
                {tips.filter(t => t.from_user_id === user?.id).reduce((acc, t) => acc + parseFloat(t.amount), 0).toFixed(4)} HBAR
              </div>
              <p className="text-xs text-muted-foreground">
                From {tips.filter(t => t.from_user_id === user?.id).length} tips
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Status</CardTitle>
              <Wallet className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {wallet.isConnected || profile?.hedera_account_id ? "Connected" : "Not Connected"}
              </div>
              <p className="text-xs text-muted-foreground">
                {wallet.accountId || profile?.hedera_account_id || "Connect your Hedera wallet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle>Connect Hedera Wallet</CardTitle>
              <CardDescription>
                {wallet.isConnected || profile?.hedera_account_id
                  ? "Your wallet is connected"
                  : "Connect via HashPack or enter your account ID manually"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wallet.isConnected || profile?.hedera_account_id ? (
                <div>
                  <code className="text-sm bg-muted/50 px-3 py-2 rounded block mb-4">
                    {wallet.accountId || profile.hedera_account_id}
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Wallet connected and ready for transactions
                  </p>
                </div>
              ) : (
                <>
                  <Button
                    onClick={connectWallet}
                    disabled={wallet.isConnecting}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    {wallet.isConnecting ? "Connecting..." : "Connect via HashPack"}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Enter Hedera Account ID (e.g., 0.0.1234567)"
                      value={manualWalletId}
                      onChange={(e) => setManualWalletId(e.target.value)}
                      className="bg-background/50 border-primary/20"
                    />
                    <Button
                      onClick={handleManualConnect}
                      disabled={wallet.isConnecting}
                      variant="outline"
                      className="w-full border-primary/20 hover:bg-primary/10"
                    >
                      Connect Manually
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle>Discover Creators</CardTitle>
              <CardDescription>
                Browse and support amazing creators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/creators")}
                className="bg-gradient-to-r from-secondary to-accent hover:opacity-90"
              >
                <Users className="mr-2 h-4 w-4" />
                Browse Creators
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tips */}
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest tip activity</CardDescription>
          </CardHeader>
          <CardContent>
            {tips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet. Start tipping creators!
              </div>
            ) : (
              <div className="space-y-4">
                {tips.map((tip) => (
                  <div
                    key={tip.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div>
                      <p className="font-medium">
                        {tip.to_user_id === user?.id ? "Received" : "Sent"} Tip
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tip.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold gradient-text">
                        {parseFloat(tip.amount).toFixed(4)} HBAR
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{tip.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
