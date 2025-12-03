import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ideasApi } from "@/lib/api";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { FileText } from "lucide-react";

export default function AllIdeas() {
  const { data: ideas, isLoading } = useQuery({
    queryKey: ["all-ideas"],
    queryFn: () => ideasApi.getAll().then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Ideas</h1>
        <p className="text-muted-foreground">
          Complete list of all submitted ideas
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : ideas?.data?.length > 0 ? (
        <div className="grid gap-4">
          {ideas.data.map((idea: any) => (
            <Card key={idea.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{idea.title}</h3>
                    <p className="text-muted-foreground mt-1 line-clamp-2">
                      {idea.summary}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>{formatDate(idea.createdAt)}</span>
                      {idea.domain && (
                        <Badge variant="outline">{idea.domain.name}</Badge>
                      )}
                      {idea.author && <span>by {idea.author.name}</span>}
                    </div>
                  </div>
                  <Badge className={getStatusColor(idea.status)}>
                    {getStatusLabel(idea.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">No ideas yet</h3>
            <p className="text-muted-foreground">
              Ideas will appear here once employees submit them
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
