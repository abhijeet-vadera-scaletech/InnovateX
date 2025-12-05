import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ideasApi } from "@/lib/api";
import { getStatusColor, getStatusLabel, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Loader2,
  Edit,
  Star,
  Trash2,
  Maximize2,
} from "lucide-react";
import { IdeaCanvas, CanvasElement } from "@/components/canvas";
import toast from "react-hot-toast";

export default function IdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: idea, isLoading } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => ideasApi.getById(id!).then((res) => res.data),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => ideasApi.delete(id!),
    onSuccess: () => {
      toast.success("Idea deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-ideas"] });
      navigate("/employee/ideas");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete idea");
    },
  });

  // Parse canvas data
  const { canvasElements, drawingPaths } = useMemo(() => {
    let elements: CanvasElement[] = [];
    let paths: string[] = [];

    if (idea?.canvasData) {
      if (Array.isArray(idea.canvasData)) {
        elements = idea.canvasData;
      } else if (typeof idea.canvasData === "string") {
        try {
          const parsed = JSON.parse(idea.canvasData);
          elements = parsed.elements || [];
          paths = parsed.paths || [];
        } catch (e) {
          console.error("Failed to parse canvas data:", e);
        }
      }
    }

    if (idea?.canvasState?.paths && Array.isArray(idea.canvasState.paths)) {
      paths = idea.canvasState.paths;
    }

    return { canvasElements: elements, drawingPaths: paths };
  }, [idea]);

  const hasCanvasContent = canvasElements.length > 0 || drawingPaths.length > 0;

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
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
        <div className="flex items-center gap-2">
          {idea.status === "DRAFT" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
          {(idea.status === "DRAFT" || idea.status === "NEEDS_REVISION") && (
            <Button onClick={() => navigate(`/employee/ideas/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              {idea.status === "NEEDS_REVISION" ? "Edit & Revise" : "Edit"}
            </Button>
          )}
        </div>
      </div>

      {/* Canvas Preview - Link to full-screen preview */}
      {hasCanvasContent && (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-lg">Canvas Preview</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/employee/ideas/${id}/preview`)}
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              View Full Canvas
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] border-t">
              <IdeaCanvas
                initialElements={canvasElements}
                readOnly={true}
                title={idea.title}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {(idea.description || idea.content) && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {idea.description ||
                    (typeof idea.content === "object"
                      ? idea.content.text
                      : idea.content)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback */}
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

          {/* Review Notes for NEEDS_REVISION */}
          {idea.status === "NEEDS_REVISION" && idea.reviewNotes && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-amber-700 dark:text-amber-400">
                  Revision Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {idea.reviewNotes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDateTime(idea.createdAt)}</p>
              </div>
              {idea.updatedAt && idea.updatedAt !== idea.createdAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {formatDateTime(idea.updatedAt)}
                  </p>
                </div>
              )}
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

          {/* Review Score */}
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
                {idea.reviewNotes && idea.status !== "NEEDS_REVISION" && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {idea.reviewNotes}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Idea"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold">"{idea.title}"</span>? This action
            cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
