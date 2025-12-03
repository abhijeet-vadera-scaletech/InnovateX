import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ideasApi } from "@/lib/api";
import { getStatusColor, getStatusLabel, formatDateTime } from "@/lib/utils";
import { ArrowLeft, Loader2, Edit, Star } from "lucide-react";

export default function IdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: idea, isLoading } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => ideasApi.getById(id!).then((res) => res.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Idea not found</p>
        <Button variant="link" onClick={() => navigate("/employee/ideas")}>
          Back to My Ideas
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{idea.title}</h1>
            <Badge className={getStatusColor(idea.status)}>
              {getStatusLabel(idea.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground">{idea.summary}</p>
        </div>
        {(idea.status === "DRAFT" || idea.status === "NEEDS_REVISION") && (
          <Button onClick={() => navigate(`/employee/ideas/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            {idea.status === "NEEDS_REVISION" ? "Edit & Revise" : "Edit"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {typeof idea.content === "object"
                  ? idea.content.text
                  : idea.content}
              </div>
            </CardContent>
          </Card>

          {idea.feedback && idea.feedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {idea.feedback.map((fb: any) => (
                  <div key={fb.id} className="p-4 rounded-lg bg-muted">
                    <p className="text-sm">{fb.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {fb.author?.name} • {formatDateTime(fb.createdAt)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDateTime(idea.createdAt)}</p>
              </div>
              {idea.domain && (
                <div>
                  <p className="text-sm text-muted-foreground">Domain</p>
                  <Badge variant="outline">{idea.domain.name}</Badge>
                </div>
              )}
              {idea.department && (
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{idea.department.name}</p>
                </div>
              )}
              {idea.tags && idea.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {idea.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {(idea.reviewScore || idea.reviewStars) && (
            <Card>
              <CardHeader>
                <CardTitle>Review Score</CardTitle>
              </CardHeader>
              <CardContent>
                {idea.reviewStars && (
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < idea.reviewStars
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
                {idea.reviewScore && (
                  <p className="text-2xl font-bold">{idea.reviewScore}/10</p>
                )}
                {idea.reviewNotes && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {idea.reviewNotes}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
