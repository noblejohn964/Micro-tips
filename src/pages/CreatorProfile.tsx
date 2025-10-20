import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";
import { useHederaWallet } from "@/hooks/useHederaWallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wallet, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  profession: string;
  bio: string | null;
  hedera_account_id: string | null;
  avatar_url: string | null;
}

const CreatorProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wallet, sendTip } = useHederaWallet();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tipAmount, setTipAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Creator not found",
        variant: "destructive",
      });
      navigate("/creators");
      return;
    }

    setProfile(data);
    setLoading(false);
  };

  const handleSendTip = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send tips",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!profile?.hedera_account_id) {
      toast({
        title: "Wallet Not Connected",
        description: "This creator hasn't connected their wallet yet",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid tip amount",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      await sendTip(profile.hedera_account_id, amount, tipMessage);
      setTipAmount("");
      setTipMessage("");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/creators")}
          className="mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Creators
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card className="glass border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-4xl gradient-text mb-2">
                      {profile.display_name || profile.username}
                    </CardTitle>
                    <CardDescription className="text-lg capitalize">
                      {profile.profession.replace("_", " ")}
                    </CardDescription>
                  </div>
                  {profile.hedera_account_id && (
                    <Badge className="bg-accent/20 text-accent border-accent/30">
                      <Wallet className="h-4 w-4 mr-2" />
                      Wallet Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground">
                      {profile.bio || "This creator hasn't added a bio yet."}
                    </p>
                  </div>
                  {profile.hedera_account_id && (
                    <div>
                      <h3 className="font-semibold mb-2">Hedera Account</h3>
                      <code className="text-sm bg-muted/50 px-3 py-2 rounded block">
                        {profile.hedera_account_id}
                      </code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tip Card */}
          <div className="lg:col-span-1">
            <Card className="glass border-primary/20 sticky top-8">
              <CardHeader>
                <CardTitle>Send a Tip</CardTitle>
                <CardDescription>Support this creator with HBAR</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Amount (HBAR)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="glass border-primary/20"
                    step="0.01"
                    min="0"
                  />
                  <div className="flex gap-2 mt-2">
                    {[1, 5, 10, 25].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setTipAmount(amount.toString())}
                        className="border-primary/20 hover:bg-primary/10"
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Message (Optional)
                  </label>
                  <Textarea
                    placeholder="Say something nice..."
                    value={tipMessage}
                    onChange={(e) => setTipMessage(e.target.value)}
                    className="glass border-primary/20 resize-none"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSendTip}
                  disabled={sending || !wallet.isConnected || !profile.hedera_account_id}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {sending ? "Sending..." : "Send Tip"}
                </Button>

                {!wallet.isConnected && (
                  <p className="text-xs text-muted-foreground text-center">
                    Connect your wallet in the dashboard to send tips
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
