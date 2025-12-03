import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ideasApi, reviewsApi } from "@/lib/api";
import { getStatusColor, getStatusLabel, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Loader2,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function ReviewIdea() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [score, setScore] = useState(5);
  const [stars, setStars] = useState(3);
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState<
    "shortlist" | "reject" | "needs_revision" | null
  >(null);

  const { data: idea, isLoading } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => ideasApi.getById(id!).then((res) => res.data),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    mutationFn: (data: any) => reviewsApi.reviewIdea(id!, data),
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["ideas-for-review"] });
      navigate("/reviewer/queue");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });

  const handleSubmit = () => {
    if (!decision) {
      toast.error("Please select a decision");
      return;
    }
    reviewMutation.mutate({
      score,
      stars,
      notes,
      decision,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!idea) {
    return <div className="text-center py-12">Idea not found</div>;
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Idea Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {typeof idea.content === "object"
                  ? idea.content.text
                  : idea.content}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Submitted:</span>
                <span className="ml-2">
                  {formatDateTime(idea.submittedAt || idea.createdAt)}
                </span>
              </div>
              {!idea.isAnonymous && idea.author && (
                <div>
                  <span className="text-muted-foreground">Author:</span>
                  <span className="ml-2">{idea.author.name}</span>
                </div>
              )}
              {idea.domain && (
                <div>
                  <span className="text-muted-foreground">Domain:</span>
                  <Badge variant="outline" className="ml-2">
                    {idea.domain.name}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Rating (Stars)</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setStars(s)}>
                      <Star
                        className={`w-6 h-6 ${
                          s <= stars
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Score (1-10)</Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full mt-2"
                />
                <div className="text-center font-bold">{score}/10</div>
              </div>

              <div>
                <Label>Notes</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-2 p-2 border rounded-md text-sm min-h-[100px]"
                  placeholder="Add your review notes..."
                />
              </div>

              <div>
                <Label>Decision</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <Button
                    variant={decision === "shortlist" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setDecision("shortlist")}
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Shortlist
                  </Button>
                  <Button
                    variant={
                      decision === "needs_revision" ? "default" : "outline"
                    }
                    className="justify-start"
                    onClick={() => setDecision("needs_revision")}
                  >
                    <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                    Needs Revision
                  </Button>
                  <Button
                    variant={decision === "reject" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setDecision("reject")}
                  >
                    <XCircle className="w-4 h-4 mr-2 text-red-500" />
                    Reject
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Submit Review
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
