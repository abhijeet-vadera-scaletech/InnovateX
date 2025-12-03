import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ideasApi, organisationsApi, aiApi } from "@/lib/api";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Save,
  Send,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

const ideaSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  summary: z.string().min(20, "Summary must be at least 20 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  domainId: z.string().optional(),
  departmentId: z.string().optional(),
  tags: z.string().optional(),
});

type IdeaForm = z.infer<typeof ideaSchema>;

export default function EditIdea() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isRefining, setIsRefining] = useState(false);

  const { data: idea, isLoading } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => ideasApi.getById(id!).then((res) => res.data),
    enabled: !!id,
  });

  const { data: domains } = useQuery({
    queryKey: ["domains"],
    queryFn: () => organisationsApi.getDomains().then((res) => res.data),
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => organisationsApi.getDepartments().then((res) => res.data),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IdeaForm>({
    resolver: zodResolver(ideaSchema),
  });

  // Populate form when idea loads
  useEffect(() => {
    if (idea) {
      reset({
        title: idea.title,
        summary: idea.summary,
        description: idea.content?.text || "",
        domainId: idea.domainId || "",
        departmentId: idea.departmentId || "",
        tags: idea.tags?.join(", ") || "",
      });
    }
  }, [idea, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => ideasApi.update(id!, data),
    onSuccess: () => {
      toast.success("Idea updated successfully!");
      navigate(`/employee/ideas/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update idea");
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      await ideasApi.update(id!, data);
      await ideasApi.submit(id!);
    },
    onSuccess: () => {
      toast.success("Idea submitted for review!");
      navigate(`/employee/ideas/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit idea");
    },
  });

  const handleRefineWithAI = async () => {
    const description = watch("description");
    if (!description || description.length < 20) {
      toast.error("Please write some content first");
      return;
    }

    setIsRefining(true);
    try {
      const response = await aiApi.refineIdea({ content: description });
      if (response.data.refined) {
        setValue("description", response.data.refined);
        toast.success("Content refined with AI suggestions!");
      }
    } catch (error) {
      toast.error("Failed to refine content");
    } finally {
      setIsRefining(false);
    }
  };

  const onSave = (data: IdeaForm) => {
    const payload = {
      title: data.title,
      summary: data.summary,
      description: data.description,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      ...(data.domainId && { domainId: data.domainId }),
      ...(data.departmentId && { departmentId: data.departmentId }),
    };
    updateMutation.mutate(payload);
  };

  const onSubmit = (data: IdeaForm) => {
    const payload = {
      title: data.title,
      summary: data.summary,
      description: data.description,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      ...(data.domainId && { domainId: data.domainId }),
      ...(data.departmentId && { departmentId: data.departmentId }),
    };
    submitMutation.mutate(payload);
  };

  const isUpdating = updateMutation.isPending || submitMutation.isPending;
  const canSubmit =
    idea?.status === "DRAFT" || idea?.status === "NEEDS_REVISION";

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {idea?.status === "NEEDS_REVISION" ? "Revise Idea" : "Edit Idea"}
            </h1>
            {idea?.status && (
              <Badge className={getStatusColor(idea.status)}>
                {getStatusLabel(idea.status)}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {idea?.status === "NEEDS_REVISION"
              ? "Address the feedback and re-submit your idea"
              : "Update your idea details"}
          </p>
        </div>
      </div>

      {/* Revision Notice */}
      {idea?.status === "NEEDS_REVISION" && idea?.reviewNotes && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Revision Required
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {idea.reviewNotes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Give your idea a catchy title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary *</Label>
              <Input
                id="summary"
                placeholder="Brief summary of your idea (1-2 sentences)"
                {...register("summary")}
              />
              {errors.summary && (
                <p className="text-sm text-destructive">
                  {errors.summary.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Detailed Description *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRefineWithAI}
                  disabled={isRefining}
                >
                  {isRefining ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Refine with AI
                </Button>
              </div>
              <textarea
                id="description"
                className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background text-sm"
                placeholder="Describe your idea in detail..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domainId">Domain</Label>
                <select
                  id="domainId"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  {...register("domainId")}
                >
                  <option value="">Select domain</option>
                  {domains?.map((domain: any) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentId">Department</Label>
                <select
                  id="departmentId"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  {...register("departmentId")}
                >
                  <option value="">Select department</option>
                  {departments?.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="innovation, cost-saving, process (comma separated)"
                {...register("tags")}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmit(onSave)}
                disabled={isUpdating}
              >
                {updateMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              {canSubmit && (
                <Button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isUpdating}
                >
                  {submitMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {idea?.status === "NEEDS_REVISION" ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-submit for Review
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
