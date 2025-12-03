import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { reviewsApi } from "@/lib/api";
import { Bot, Plus, Settings } from "lucide-react";

export default function ReviewAgents() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ["review-agents"],
    queryFn: () => reviewsApi.getAgents().then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Review Agents</h1>
          <p className="text-muted-foreground">
            Configure AI agents to assist with idea evaluation
          </p>
        </div>
        <Link to="/reviewer/agents/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : agents?.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent: any) => (
            <Card key={agent.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge variant={agent.isActive ? "success" : "secondary"}>
                        {agent.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {agent.description || "No description"}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">No AI agents configured</h3>
            <p className="text-muted-foreground mb-4">
              Create an AI agent to automate idea evaluation
            </p>
            <Link to="/reviewer/agents/new">
              <Button>Create Agent</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
