import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { IdeaCanvas, CanvasElement } from "@/components/canvas";
import { ideasApi } from "@/lib/api";
import { useThemeStore } from "@/stores/themeStore";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  X,
  Loader2,
  Layout,
  Columns3,
  Sparkles,
  Save,
  Send,
} from "lucide-react";
import { TemplatePicker } from "@/components/canvas/TemplatePicker";
import { DEFAULT_IDEA_TEMPLATE } from "@/components/canvas/templates";
import { CanvasTemplate, TemplateType } from "@/components/canvas/types";

interface IdeaMetadata {
  title: string;
  summary: string;
  domainId?: string;
  departmentId?: string;
  tags: string[];
}

// Template icons for display
const TEMPLATE_ICONS: Record<TemplateType, React.ReactNode> = {
  "idea-canvas": <Columns3 className="w-4 h-4" />,
  kanban: <Layout className="w-4 h-4" />,
  timeline: <Layout className="w-4 h-4" />,
  "priority-matrix": <Layout className="w-4 h-4" />,
  brainstorm: <Layout className="w-4 h-4" />,
  flowchart: <Layout className="w-4 h-4" />,
  swot: <Layout className="w-4 h-4" />,
  mindmap: <Layout className="w-4 h-4" />,
};

export default function IdeaCanvasPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  useThemeStore(); // Initialize theme

  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [submitSummary, setSubmitSummary] = useState("");
  const [metadata, setMetadata] = useState<IdeaMetadata>({
    title: "Untitled Idea",
    summary: "",
    tags: [],
  });
  const [selectedTemplate, setSelectedTemplate] = useState<CanvasTemplate>(
    DEFAULT_IDEA_TEMPLATE
  );
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [drawingPaths, setDrawingPaths] = useState<string[]>([]);
  const [pendingSubmitData, setPendingSubmitData] = useState<{
    elements: CanvasElement[];
    paths: string[];
  } | null>(null);

  // Load default template for new ideas
  useEffect(() => {
    if (!isEditing && canvasElements.length === 0) {
      // Apply default template
      const templateElements = DEFAULT_IDEA_TEMPLATE.elements.map(
        (el, index) => ({
          ...el,
          id: `tpl_${Date.now()}_${index}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
        })
      ) as CanvasElement[];
      setCanvasElements(templateElements);
    }
  }, [isEditing]);

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
    // Open submit modal instead of directly submitting
    setPendingSubmitData({ elements, paths });
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => {
    if (!submitSummary.trim()) {
      toast.error("Please add a summary for your idea");
      return;
    }

    if (!pendingSubmitData) return;

    const { elements, paths } = pendingSubmitData;

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
      summary: submitSummary,
      description: description || submitSummary,
      canvasData: elements,
      canvasState: { zoom: 1, pan: { x: 0, y: 0 }, paths },
      tags: [],
    };

    submitMutation.mutate(payload);
    setShowSubmitModal(false);
    setPendingSubmitData(null);
  };

  const handleSelectTemplate = (template: CanvasTemplate) => {
    setSelectedTemplate(template);
    const templateElements = template.elements.map((el, index) => ({
      ...el,
      id: `tpl_${Date.now()}_${index}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    })) as CanvasElement[];
    setCanvasElements(templateElements);
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
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-50">
        {/* Left side - Back button and Title (like Google Docs) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {metadata.title
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((word) => word.charAt(0).toUpperCase())
                  .join("") || "IC"}
              </span>
            </div>
            {/* Editable Title - like Google Docs */}
            {isEditingTitle ? (
              <input
                type="text"
                value={metadata.title}
                onChange={(e) =>
                  setMetadata((prev) => ({ ...prev, title: e.target.value }))
                }
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingTitle(false);
                }}
                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none text-slate-900 dark:text-white text-base font-medium min-w-[200px] focus:border-blue-500"
                autoFocus
              />
            ) : (
              <span
                className="text-slate-900 dark:text-white text-base font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                onClick={() => setIsEditingTitle(true)}
                title="Click to rename"
              >
                {metadata.title}
              </span>
            )}
          </div>
        </div>

        {/* Right side - Template selector and Actions */}
        <div className="flex items-center gap-2">
          {/* Template selector button */}
          <button
            onClick={() => setShowTemplatePicker(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white"
          >
            {TEMPLATE_ICONS[selectedTemplate.id]}
            <span className="text-sm">{selectedTemplate.name}</span>
          </button>

          <ThemeToggle />

          {/* AI Assistant button */}
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border ${
              showAIAssistant
                ? "bg-blue-500 border-blue-500 text-white"
                : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI Assistant</span>
          </button>

          {/* Save Draft button */}
          <button
            onClick={() => handleSave(canvasElements, drawingPaths)}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">Save Draft</span>
          </button>

          {/* Submit button */}
          <button
            onClick={() => handleSubmit(canvasElements, drawingPaths)}
            disabled={submitMutation.isPending}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-white disabled:opacity-50"
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">Submit</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Canvas - hide top bar since we moved controls to navbar */}
        <IdeaCanvas
          ideaId={id}
          initialElements={canvasElements}
          initialDrawingPaths={drawingPaths}
          title={metadata.title}
          onTitleChange={(title) => setMetadata((prev) => ({ ...prev, title }))}
          onSave={handleSave}
          onSubmit={handleSubmit}
          hideTopBar
          showAIAssistant={showAIAssistant}
          onToggleAIAssistant={() => setShowAIAssistant(!showAIAssistant)}
        />

        {/* Template Picker */}
        <TemplatePicker
          isOpen={showTemplatePicker}
          onClose={() => setShowTemplatePicker(false)}
          onSelectTemplate={handleSelectTemplate}
        />

        {/* Submit Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-lg">Submit Idea</h3>
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setPendingSubmitData(null);
                    setSubmitSummary("");
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Summary <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={submitSummary}
                    onChange={(e) => setSubmitSummary(e.target.value)}
                    placeholder="Provide a brief summary of your idea for reviewers..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none h-32 outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This summary will be visible to reviewers and helps them
                    understand your idea quickly.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setPendingSubmitData(null);
                    setSubmitSummary("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={!submitSummary.trim() || submitMutation.isPending}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Review"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
