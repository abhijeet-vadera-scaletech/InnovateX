import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ideasApi } from "@/lib/api";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { FileText, Eye } from "lucide-react";

export default function ReviewQueue() {
  const { data: ideas, isLoading } = useQuery({
    queryKey: ["ideas-for-review"],
    queryFn: () => ideasApi.getForReview().then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Review Queue</h1>
        <p className="text-muted-foreground">Ideas waiting for your review</p>
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
                      <span>
                        {formatDate(idea.submittedAt || idea.createdAt)}
                      </span>
                      {idea.domain && (
                        <Badge variant="outline">{idea.domain.name}</Badge>
                      )}
                      {!idea.isAnonymous && idea.author && (
                        <span>by {idea.author.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(idea.status)}>
                      {getStatusLabel(idea.status)}
                    </Badge>
                    <Link to={`/reviewer/ideas/${idea.id}`}>
                      <Button size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">No ideas to review</h3>
            <p className="text-muted-foreground">
              All caught up! Check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
