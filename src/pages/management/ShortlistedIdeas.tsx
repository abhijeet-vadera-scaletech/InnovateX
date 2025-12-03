import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ideasApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { FileText, CheckCircle, XCircle } from "lucide-react";

export default function ShortlistedIdeas() {
  const { data: ideas, isLoading } = useQuery({
    queryKey: ["shortlisted-ideas"],
    queryFn: () => ideasApi.getShortlisted().then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shortlisted Ideas</h1>
        <p className="text-muted-foreground">
          Ideas awaiting management approval
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
                      {idea.reviewStars && (
                        <Badge variant="outline">⭐ {idea.reviewStars}/5</Badge>
                      )}
                      {idea.reviewer && (
                        <span>Reviewed by {idea.reviewer.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button size="sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
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
            <h3 className="font-medium mb-2">No shortlisted ideas</h3>
            <p className="text-muted-foreground">
              Ideas will appear here once reviewers shortlist them
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
