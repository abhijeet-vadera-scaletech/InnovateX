import { cn } from "@/lib/utils";
import {
  MousePointer2,
  Hand,
  StickyNote,
  Type,
  Shapes,
  Minus,
  Pencil,
  Eraser,
  Image,
  Frame,
  Smile,
  MessageSquare,
  Square,
  Circle,
  Triangle,
  Diamond,
  Hexagon,
  Star,
  ArrowRight,
  Cloud,
  MoreHorizontal,
} from "lucide-react";
import { ToolType, ShapeType } from "./types";
import { useState, useEffect, useRef } from "react";

interface CanvasToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  activeShape?: ShapeType;
  onShapeChange?: (shape: ShapeType) => void;
}

const mainTools: {
  id: ToolType;
  icon: React.ElementType;
  label: string;
  shortcut: string;
}[] = [
  { id: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { id: "pan", icon: Hand, label: "Pan", shortcut: "H" },
  { id: "sticky-note", icon: StickyNote, label: "Sticky Note", shortcut: "N" },
  { id: "text", icon: Type, label: "Text", shortcut: "T" },
  { id: "shape", icon: Shapes, label: "Shapes", shortcut: "S" },
  { id: "connector", icon: Minus, label: "Connector", shortcut: "L" },
  { id: "draw", icon: Pencil, label: "Draw", shortcut: "P" },
  { id: "eraser", icon: Eraser, label: "Eraser", shortcut: "E" },
  { id: "image", icon: Image, label: "Image", shortcut: "I" },
  { id: "frame", icon: Frame, label: "Frame", shortcut: "F" },
  { id: "icon", icon: Smile, label: "Icons", shortcut: "O" },
  { id: "comment", icon: MessageSquare, label: "Comment", shortcut: "C" },
];

const shapeOptions: {
  id: ShapeType;
  icon: React.ElementType;
  label: string;
}[] = [
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "triangle", icon: Triangle, label: "Triangle" },
  { id: "diamond", icon: Diamond, label: "Diamond" },
  { id: "hexagon", icon: Hexagon, label: "Hexagon" },
  { id: "star", icon: Star, label: "Star" },
  { id: "arrow", icon: ArrowRight, label: "Arrow" },
  { id: "cloud", icon: Cloud, label: "Cloud" },
];

export function CanvasToolbar({
  activeTool,
  onToolChange,
  activeShape = "rectangle",
  onShapeChange,
}: CanvasToolbarProps) {
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const visibleTools = mainTools.slice(0, 8);
  const moreTools = mainTools.slice(8);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        setShowShapeMenu(false);
        setShowMoreTools(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus when tool changes (except for shape tool)
  useEffect(() => {
    if (activeTool !== "shape") {
      setShowShapeMenu(false);
    }
    setShowMoreTools(false);
  }, [activeTool]);

  return (
    <div
      ref={toolbarRef}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-50"
    >
      <div className="flex flex-col gap-1 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
        {visibleTools.map((tool) => (
          <div key={tool.id} className="relative">
            <button
              onClick={() => {
                if (tool.id === "shape") {
                  setShowShapeMenu(!showShapeMenu);
                } else {
                  setShowShapeMenu(false);
                }
                onToolChange(tool.id);
              }}
              className={cn(
                "group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                activeTool === tool.id
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
              title={`${tool.label} (${tool.shortcut})`}
            >
              <tool.icon className="w-5 h-5" />

              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {tool.label}
                <span className="ml-2 text-slate-400">{tool.shortcut}</span>
              </div>
            </button>

            {/* Shape submenu */}
            {tool.id === "shape" && showShapeMenu && activeTool === "shape" && (
              <div className="absolute left-full ml-3 top-0 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 min-w-[180px]">
                <div className="grid grid-cols-4 gap-2">
                  {shapeOptions.map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => {
                        onShapeChange?.(shape.id);
                        setShowShapeMenu(false);
                      }}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg transition-all",
                        activeShape === shape.id
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      )}
                      title={shape.label}
                    >
                      <shape.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Divider */}
        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

        {/* More tools */}
        <div className="relative">
          <button
            onClick={() => setShowMoreTools(!showMoreTools)}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
              showMoreTools
                ? "bg-slate-100 dark:bg-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
            title="More tools"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMoreTools && (
            <div className="absolute left-full ml-3 top-0 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col gap-1">
                {moreTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onToolChange(tool.id);
                      setShowMoreTools(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all whitespace-nowrap",
                      activeTool === tool.id
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    <tool.icon className="w-4 h-4" />
                    <span className="text-sm">{tool.label}</span>
                    <span className="text-xs text-slate-400 ml-auto">
                      {tool.shortcut}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
