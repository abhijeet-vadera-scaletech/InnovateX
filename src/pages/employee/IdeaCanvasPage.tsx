import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { IdeaCanvas, CanvasElement } from "@/components/canvas";
import { ideasApi, organisationsApi } from "@/lib/api";
import { useThemeStore } from "@/stores/themeStore";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Settings,
  X,
  Tag,
  Building2,
  Layers,
  Loader2,
} from "lucide-react";

interface IdeaMetadata {
  title: string;
  summary: string;
  domainId?: string;
  departmentId?: string;
  tags: string[];
}

export default function IdeaCanvasPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  useThemeStore(); // Initialize theme

  const [showSettings, setShowSettings] = useState(false);
  const [metadata, setMetadata] = useState<IdeaMetadata>({
    title: "Untitled Idea",
    summary: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [drawingPaths, setDrawingPaths] = useState<string[]>([]);
  console.log("🚀 ~ IdeaCanvasPage ~ drawingPaths:", drawingPaths);

  // Fetch domains and departments
  const { data: domains } = useQuery({
    queryKey: ["domains"],
    queryFn: () => organisationsApi.getDomains().then((res) => res.data),
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => organisationsApi.getDepartments().then((res) => res.data),
  });

  // Fetch existing idea if editing
  const { data: existingIdea, isLoading: isLoadingIdea } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => ideasApi.getById(id!).then((res) => res.data),
    enabled: isEditing,
  });

  // Load existing idea data
  useEffect(() => {
    if (existingIdea) {
      setMetadata({
        title: existingIdea.title || "Untitled Idea",
        summary: existingIdea.summary || "",
        domainId: existingIdea.domainId,
        departmentId: existingIdea.departmentId,
        tags: existingIdea.tags || [],
      });
      // Load canvas data - now stored as array directly
      if (existingIdea.canvasData) {
        // Handle both array format (new) and JSON string format (legacy)
        if (Array.isArray(existingIdea.canvasData)) {
          setCanvasElements(existingIdea.canvasData);
        } else if (typeof existingIdea.canvasData === "string") {
          try {
            const parsed = JSON.parse(existingIdea.canvasData);
            setCanvasElements(parsed.elements || []);
            setDrawingPaths(parsed.paths || []);
          } catch (e) {
            console.error("Failed to parse canvas data:", e);
          }
        }
      }
      // Load canvas state (paths stored here now)
      if (existingIdea.canvasState) {
        const state = existingIdea.canvasState;
        if (state.paths && Array.isArray(state.paths)) {
          setDrawingPaths(state.paths);
        }
      }
    }
  }, [existingIdea]);

  // Save draft mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return ideasApi.update(id!, data);
      }
      return ideasApi.create(data);
    },
    onSuccess: (response) => {
      toast.success("Idea saved successfully!");
      if (!isEditing) {
        navigate(`/employee/ideas/${response.data.id}/edit`, { replace: true });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save idea");
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      let ideaId = id;
      if (!isEditing) {
        const createResponse = await ideasApi.create(data);
        ideaId = createResponse.data.id;
      } else {
        await ideasApi.update(id!, data);
      }
      await ideasApi.submit(ideaId!);
      return { id: ideaId };
    },
    onSuccess: (response) => {
      toast.success("Idea submitted for review!");
      navigate(`/employee/ideas/${response.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit idea");
    },
  });

  const handleSave = (elements: CanvasElement[], paths: string[]) => {
    // Generate description from canvas elements
    const description = elements
      .filter((el) => el.type === "sticky-note" || el.type === "text")
      .map((el) => {
        if (el.type === "sticky-note") {
          return (el.data as any).content;
        }
        if (el.type === "text") {
          return (el.data as any).content;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");

    const payload = {
      title: metadata.title,
      summary: metadata.summary || description.slice(0, 200),
      description: description || metadata.summary,
      canvasData: elements,
      canvasState: { zoom: 1, pan: { x: 0, y: 0 }, paths },
      tags: metadata.tags,
      ...(metadata.domainId && { domainId: metadata.domainId }),
      ...(metadata.departmentId && { departmentId: metadata.departmentId }),
    };

    saveMutation.mutate(payload);
  };

  const handleSubmit = (elements: CanvasElement[], paths: string[]) => {
    if (!metadata.summary) {
      toast.error("Please add a summary in the settings panel");
      setShowSettings(true);
      return;
    }

    const description = elements
      .filter((el) => el.type === "sticky-note" || el.type === "text")
      .map((el) => {
        if (el.type === "sticky-note") {
          return (el.data as any).content;
        }
        if (el.type === "text") {
          return (el.data as any).content;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");

    if (!description && elements.length === 0) {
      toast.error("Please add some content to your idea canvas");
      return;
    }

    const payload = {
      title: metadata.title,
      summary: metadata.summary,
      description: description || metadata.summary,
      canvasData: elements,
      canvasState: { zoom: 1, pan: { x: 0, y: 0 }, paths },
      tags: metadata.tags,
      ...(metadata.domainId && { domainId: metadata.domainId }),
      ...(metadata.departmentId && { departmentId: metadata.departmentId }),
    };

    submitMutation.mutate(payload);
  };

  const addTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setMetadata((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  if (isEditing && isLoadingIdea) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-600 dark:text-slate-400">Loading idea...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IC</span>
            </div>
            <span className="font-semibold text-lg">IdeaCanvas</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
              showSettings
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Canvas */}
        <IdeaCanvas
          ideaId={id}
          initialElements={canvasElements}
          title={metadata.title}
          onTitleChange={(title) => setMetadata((prev) => ({ ...prev, title }))}
          onSave={handleSave}
          onSubmit={handleSubmit}
        />

        {/* Settings panel */}
        {showSettings && (
          <div className="absolute top-4 right-4 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold">Idea Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Summary */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={metadata.summary}
                  onChange={(e) =>
                    setMetadata((prev) => ({
                      ...prev,
                      summary: e.target.value,
                    }))
                  }
                  placeholder="Brief summary of your idea..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Domain */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Domain
                </label>
                <select
                  value={metadata.domainId || ""}
                  onChange={(e) =>
                    setMetadata((prev) => ({
                      ...prev,
                      domainId: e.target.value || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select domain</option>
                  {domains?.map((domain: any) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Layers className="w-4 h-4 inline mr-1" />
                  Department
                </label>
                <select
                  value={metadata.departmentId || ""}
                  onChange={(e) =>
                    setMetadata((prev) => ({
                      ...prev,
                      departmentId: e.target.value || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select department</option>
                  {departments?.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-xs"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Save indicator */}
            {(saveMutation.isPending || submitMutation.isPending) && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
