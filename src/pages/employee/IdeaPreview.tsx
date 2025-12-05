import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ideasApi } from "@/lib/api";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import { ArrowLeft, Loader2, Edit } from "lucide-react";
import { IdeaCanvas, CanvasElement } from "@/components/canvas";

export default function IdeaPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: idea, isLoading } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => ideasApi.getById(id!).then((res) => res.data),
    enabled: !!id,
  });

  // Parse canvas data
  const canvasElements = useMemo(() => {
    let elements: CanvasElement[] = [];

    if (idea?.canvasData) {
      if (Array.isArray(idea.canvasData)) {
        elements = idea.canvasData;
      } else if (typeof idea.canvasData === "string") {
        try {
          const parsed = JSON.parse(idea.canvasData);
          elements = parsed.elements || [];
        } catch (e) {
          console.error("Failed to parse canvas data:", e);
        }
      }
    }

    return elements;
  }, [idea]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground mb-4">Idea not found</p>
        <Button variant="link" onClick={() => navigate("/employee/ideas")}>
          Back to My Ideas
        </Button>
      </div>
    );
  }

  const canEdit = idea.status === "DRAFT" || idea.status === "NEEDS_REVISION";

  return (
    <div className="fixed inset-0 bg-background">
      {/* Top bar */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg shadow border">
          <span className="font-semibold">{idea.title}</span>
          <Badge className={getStatusColor(idea.status)}>
            {getStatusLabel(idea.status)}
          </Badge>
        </div>
      </div>

      {/* Edit button for draft/needs_revision */}
      {canEdit && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={() => navigate(`/employee/ideas/${id}/edit`)}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur"
            variant="outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            {idea.status === "NEEDS_REVISION" ? "Edit & Revise" : "Edit"}
          </Button>
        </div>
      )}

      {/* Full-screen canvas in read-only mode */}
      <IdeaCanvas
        initialElements={canvasElements}
        readOnly={true}
        title={idea.title}
      />
    </div>
  );
}
