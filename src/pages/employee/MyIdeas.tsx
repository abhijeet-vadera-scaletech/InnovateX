import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ideasApi } from "@/lib/api";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  PlusCircle,
  Search,
  Lightbulb,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Tag,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

// Sticky note colors for visual variety
const noteColors = [
  "from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-yellow-200/50",
  "from-blue-50 to-blue-100 border-blue-200 hover:shadow-blue-200/50",
  "from-green-50 to-green-100 border-green-200 hover:shadow-green-200/50",
  "from-pink-50 to-pink-100 border-pink-200 hover:shadow-pink-200/50",
  "from-purple-50 to-purple-100 border-purple-200 hover:shadow-purple-200/50",
  "from-orange-50 to-orange-100 border-orange-200 hover:shadow-orange-200/50",
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "📝";
    case "SUBMITTED":
      return "📤";
    case "UNDER_REVIEW":
      return "🔍";
    case "SHORTLISTED":
      return "⭐";
    case "APPROVED":
      return "✅";
    case "REJECTED":
      return "❌";
    case "NEEDS_REVISION":
      return "🔄";
    default:
      return "💡";
  }
};

export default function MyIdeas() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ideaId: string;
    ideaTitle: string;
  }>({ isOpen: false, ideaId: "", ideaTitle: "" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ideas, isLoading } = useQuery({
    queryKey: ["my-ideas", { search, status: statusFilter }],
    queryFn: () =>
      ideasApi
        .getMy({ search, status: statusFilter || undefined })
        .then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ideasApi.delete(id),
    onSuccess: () => {
      toast.success("Idea deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-ideas"] });
      setDeleteModal({ isOpen: false, ideaId: "", ideaTitle: "" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete idea");
    },
  });

  const handleDeleteClick = (
    e: React.MouseEvent,
    id: string,
    title: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ isOpen: true, ideaId: id, ideaTitle: title });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.ideaId) {
      deleteMutation.mutate(deleteModal.ideaId);
    }
  };

  const statuses = [
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "APPROVED",
    "REJECTED",
    "NEEDS_REVISION",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            My Ideas
          </h1>
          <p className="text-muted-foreground">
            Your creative space for innovation
          </p>
        </div>
        <Link to="/employee/ideas/new">
          <Button className="shadow-lg hover:shadow-xl transition-shadow">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Idea
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your ideas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("")}
              className="rounded-full"
            >
              All
            </Button>
            {statuses.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="rounded-full"
              >
                <span className="mr-1">{getStatusIcon(status)}</span>
                {getStatusLabel(status)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Ideas Grid - Sticky Note Style */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <Lightbulb className="w-12 h-12 text-yellow-400 animate-bounce" />
            <p className="text-muted-foreground">Loading your ideas...</p>
          </div>
        </div>
      ) : ideas?.data?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.data.map((idea: any, index: number) => (
            <div
              key={idea.id}
              onClick={() => navigate(`/employee/ideas/${idea.id}/preview`)}
              className={cn(
                "group relative bg-gradient-to-br rounded-xl border-2 p-5 cursor-pointer transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-1 hover:rotate-0",
                noteColors[index % noteColors.length],
                index % 3 === 0 && "rotate-[-1deg]",
                index % 3 === 1 && "rotate-[0.5deg]",
                index % 3 === 2 && "rotate-[1deg]"
              )}
            >
              {/* Pin decoration */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-400 rounded-full shadow-md border-2 border-red-300" />

              {/* Status Badge */}
              <div className="flex items-center justify-between mb-3">
                <Badge
                  className={cn(
                    getStatusColor(idea.status),
                    "shadow-sm font-medium"
                  )}
                >
                  <span className="mr-1">{getStatusIcon(idea.status)}</span>
                  {getStatusLabel(idea.status)}
                </Badge>
                {(idea.status === "DRAFT" ||
                  idea.status === "NEEDS_REVISION") && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-white/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/employee/ideas/${idea.id}/edit`);
                      }}
                      title={
                        idea.status === "NEEDS_REVISION"
                          ? "Edit & Revise"
                          : "Edit"
                      }
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {idea.status === "DRAFT" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-100 text-red-500"
                        onClick={(e) =>
                          handleDeleteClick(e, idea.id, idea.title)
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {idea.title}
              </h3>

              {/* Summary */}
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {idea.summary}
              </p>

              {/* Tags */}
              {idea.tags && idea.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {idea.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-white/60 text-muted-foreground"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {idea.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{idea.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Revision Notice */}
              {idea.status === "NEEDS_REVISION" && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 mb-3">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {idea.reviewNotes || "Revision required - click to edit"}
                  </span>
                </div>
              )}

              {/* Footer - Dates */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-black/5">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(idea.createdAt)}</span>
                </div>
                {idea.updatedAt && idea.updatedAt !== idea.createdAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Updated {formatDate(idea.updatedAt)}</span>
                  </div>
                )}
              </div>

              {/* Domain badge */}
              {idea.domain && (
                <div className="absolute bottom-5 right-5">
                  <Badge variant="outline" className="bg-white/80 text-xs">
                    {idea.domain.name}
                  </Badge>
                </div>
              )}

              {/* Hover indicator */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-primary" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl rotate-3 absolute -z-10" />
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl -rotate-3 absolute -z-10 translate-x-2 translate-y-2" />
            <div className="w-32 h-32 bg-white rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center">
              <Lightbulb className="w-12 h-12 text-gray-300" />
            </div>
          </div>
          <h3 className="font-semibold text-lg mt-6 mb-2">No ideas yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-sm">
            {search || statusFilter
              ? "No ideas match your filters. Try adjusting your search."
              : "Every great innovation starts with a single idea. Share yours today!"}
          </p>
          <Link to="/employee/ideas/new">
            <Button size="lg" className="shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Create Your First Idea
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, ideaId: "", ideaTitle: "" })
        }
        onConfirm={handleConfirmDelete}
        title="Delete Idea"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold">"{deleteModal.ideaTitle}"</span>?
            This action cannot be undone.
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
