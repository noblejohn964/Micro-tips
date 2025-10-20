import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Wallet } from "lucide-react";

interface Creator {
  id: string;
  username: string;
  display_name: string | null;
  profession: string;
  bio: string | null;
  hedera_account_id: string | null;
  avatar_url: string | null;
}

const Creators = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] = useState<string>("all");

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .not("hedera_account_id", "is", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCreators(data);
    }
    setLoading(false);
  };

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch =
      creator.username.toLowerCase().includes(search.toLowerCase()) ||
      creator.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      creator.bio?.toLowerCase().includes(search.toLowerCase());
    
    const matchesProfession =
      selectedProfession === "all" || creator.profession === selectedProfession;

    return matchesSearch && matchesProfession;
  });

  const professions = [
    { value: "all", label: "All" },
    { value: "developer", label: "Developer" },
    { value: "content_creator", label: "Content Creator" },
    { value: "artist", label: "Artist" },
    { value: "musician", label: "Musician" },
    { value: "writer", label: "Writer" },
    { value: "educator", label: "Educator" },
    { value: "other", label: "Other" },
  ];

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
        <div className="mb-8">
          <h1 className="text-5xl font-bold gradient-text mb-4">Discover Creators</h1>
          <p className="text-muted-foreground text-lg">
            Support amazing creators with micro-tips in HBAR
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 glass border-primary/20"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {professions.map((prof) => (
              <Button
                key={prof.value}
                variant={selectedProfession === prof.value ? "default" : "outline"}
                onClick={() => setSelectedProfession(prof.value)}
                className={
                  selectedProfession === prof.value
                    ? "bg-gradient-to-r from-primary to-secondary"
                    : "border-primary/20"
                }
              >
                {prof.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Creators Grid */}
        {filteredCreators.length === 0 ? (
          <Card className="glass border-primary/20">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No creators found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <Card
                key={creator.id}
                className="glass border-primary/20 hover:border-primary/40 transition-all cursor-pointer group"
                onClick={() => navigate(`/creator/${creator.username}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="group-hover:gradient-text transition-all">
                        {creator.display_name || creator.username}
                      </CardTitle>
                      <CardDescription className="capitalize">
                        {creator.profession.replace("_", " ")}
                      </CardDescription>
                    </div>
                    {creator.hedera_account_id && (
                      <Badge className="bg-accent/20 text-accent border-accent/30">
                        <Wallet className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {creator.bio || "No bio available"}
                  </p>
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/creator/${creator.username}`);
                    }}
                  >
                    Send Tip
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Creators;
