import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/themeStore";
import {
  X,
  Layout,
  GitBranch,
  Grid3X3,
  Lightbulb,
  ArrowRight,
  BarChart3,
  Brain,
  Columns3,
} from "lucide-react";
import { CANVAS_TEMPLATES } from "./templates";
import { CanvasTemplate, TemplateType } from "./types";

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CanvasTemplate) => void;
}

const TEMPLATE_ICONS: Record<TemplateType, React.ReactNode> = {
  "idea-canvas": <Columns3 className="w-8 h-8" />,
  kanban: <Layout className="w-8 h-8" />,
  timeline: <ArrowRight className="w-8 h-8" />,
  "priority-matrix": <Grid3X3 className="w-8 h-8" />,
  brainstorm: <Lightbulb className="w-8 h-8" />,
  flowchart: <GitBranch className="w-8 h-8" />,
  swot: <BarChart3 className="w-8 h-8" />,
  mindmap: <Brain className="w-8 h-8" />,
};

const TEMPLATE_COLORS: Record<TemplateType, string> = {
  "idea-canvas": "bg-violet-500",
  kanban: "bg-blue-500",
  timeline: "bg-green-500",
  "priority-matrix": "bg-purple-500",
  brainstorm: "bg-yellow-500",
  flowchart: "bg-cyan-500",
  swot: "bg-red-500",
  mindmap: "bg-pink-500",
};

export function TemplatePicker({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplatePickerProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={cn(
          "w-full max-w-3xl max-h-[80vh] rounded-xl shadow-2xl overflow-hidden",
          isDark ? "bg-slate-800" : "bg-white"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between px-6 py-4 border-b",
            isDark ? "border-slate-700" : "border-gray-200"
          )}
        >
          <div>
            <h2
              className={cn(
                "text-xl font-semibold",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Choose a Template
            </h2>
            <p
              className={cn(
                "text-sm mt-1",
                isDark ? "text-slate-400" : "text-gray-500"
              )}
            >
              Start with a pre-built layout or create from scratch
            </p>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDark
                ? "hover:bg-slate-700 text-slate-400"
                : "hover:bg-gray-100 text-gray-500"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CANVAS_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all hover:scale-105",
                  isDark
                    ? "border-slate-700 hover:border-blue-500 bg-slate-700/50"
                    : "border-gray-200 hover:border-blue-500 bg-gray-50"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3",
                    TEMPLATE_COLORS[template.id]
                  )}
                >
                  {TEMPLATE_ICONS[template.id]}
                </div>
                <h3
                  className={cn(
                    "font-semibold mb-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {template.name}
                </h3>
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-slate-400" : "text-gray-500"
                  )}
                >
                  {template.description}
                </p>
              </button>
            ))}

            {/* Blank Canvas Option */}
            <button
              onClick={onClose}
              className={cn(
                "p-4 rounded-xl border-2 border-dashed text-left transition-all hover:scale-105",
                isDark
                  ? "border-slate-600 hover:border-slate-500"
                  : "border-gray-300 hover:border-gray-400"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
                  isDark ? "bg-slate-700" : "bg-gray-200"
                )}
              >
                <span
                  className={cn(
                    "text-2xl",
                    isDark ? "text-slate-400" : "text-gray-400"
                  )}
                >
                  +
                </span>
              </div>
              <h3
                className={cn(
                  "font-semibold mb-1",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Blank Canvas
              </h3>
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-slate-400" : "text-gray-500"
                )}
              >
                Start from scratch
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
