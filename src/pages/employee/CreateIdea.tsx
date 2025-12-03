import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ideasApi, organisationsApi, aiApi } from "@/lib/api";
import { ArrowLeft, Loader2, Sparkles, Send, Save } from "lucide-react";

const ideaSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  summary: z.string().min(20, "Summary must be at least 20 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  domainId: z.string().optional(),
  departmentId: z.string().optional(),
  tags: z.string().optional(),
});

type IdeaForm = z.infer<typeof ideaSchema>;

export default function CreateIdea() {
  const navigate = useNavigate();
  const [isRefining, setIsRefining] = useState(false);

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
    formState: { errors },
  } = useForm<IdeaForm>({
    resolver: zodResolver(ideaSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => ideasApi.create(data),
    onSuccess: (response) => {
      toast.success("Idea created successfully!");
      navigate(`/employee/ideas/${response.data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create idea");
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const createResponse = await ideasApi.create(data);
      await ideasApi.submit(createResponse.data.id);
      return createResponse;
    },
    onSuccess: (response) => {
      toast.success("Idea submitted for review!");
      navigate(`/employee/ideas/${response.data.id}`);
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

  const onSaveDraft = (data: IdeaForm) => {
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
    createMutation.mutate(payload);
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

  const isLoading = createMutation.isPending || submitMutation.isPending;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Idea</h1>
          <p className="text-muted-foreground">
            Share your innovative idea with the organization
          </p>
        </div>
      </div>

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
                placeholder="Describe your idea in detail. Include the problem it solves, how it works, and potential benefits..."
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
                onClick={handleSubmit(onSaveDraft)}
                disabled={isLoading}
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {submitMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Send className="w-4 h-4 mr-2" />
                Submit for Review
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
