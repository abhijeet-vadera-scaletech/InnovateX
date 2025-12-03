import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { aiApi } from "@/lib/api";
import { Search, Sparkles, Layers, Gem } from "lucide-react";

export default function IdeaDiscovery() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: clusters } = useQuery({
    queryKey: ["idea-clusters"],
    queryFn: () => aiApi.getClusters().then((res) => res.data),
  });

  const { data: hiddenGems } = useQuery({
    queryKey: ["hidden-gems"],
    queryFn: () => aiApi.getHiddenGems().then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Discovery</h1>
        <p className="text-muted-foreground">
          Discover insights and patterns in your ideas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Semantic Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Search ideas by meaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button>
              <Sparkles className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Idea Clusters
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clusters?.length > 0 ? (
              <div className="space-y-4">
                {clusters.map((cluster: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{cluster.theme}</h4>
                      <Badge variant="secondary">{cluster.count} ideas</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cluster.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No clusters found yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gem className="w-5 h-5" />
              Hidden Gems
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hiddenGems?.length > 0 ? (
              <div className="space-y-4">
                {hiddenGems.map((idea: any) => (
                  <div key={idea.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium">{idea.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {idea.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">Score: {idea.aiScore}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hidden gems found yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
