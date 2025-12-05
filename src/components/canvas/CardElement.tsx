import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/themeStore";
import { useState, useRef, useEffect } from "react";
import { Flag, AlertCircle, CheckCircle } from "lucide-react";
import { CanvasElement, CardData } from "./types";

interface CardElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  scale: number;
  readOnly?: boolean;
}

export function CardElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDelete: _onDelete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDuplicate: _onDuplicate,
  scale,
  readOnly = false,
}: CardElementProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const data = element.data as CardData;

  const [isDragging, setIsDragging] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [localTitle, setLocalTitle] = useState(data.title || "");
  const [localDesc, setLocalDesc] = useState(data.description || "");
  const dragStart = useRef({ x: 0, y: 0 });
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalTitle(data.title || "");
    setLocalDesc(data.description || "");
  }, [data.title, data.description]);

  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDesc && descRef.current) {
      descRef.current.focus();
    }
  }, [isEditingDesc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly || element.locked || isEditingTitle || isEditingDesc) return;
    e.stopPropagation();
    onSelect(e);
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - element.position.x * scale,
      y: e.clientY - element.position.y * scale,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !element.locked) {
      const newX = (e.clientX - dragStart.current.x) / scale;
      const newY = (e.clientY - dragStart.current.y) / scale;
      onUpdate({ position: { x: newX, y: newY } });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (localTitle !== data.title) {
      onUpdate({ data: { ...data, title: localTitle } });
    }
  };

  const handleDescBlur = () => {
    setIsEditingDesc(false);
    if (localDesc !== data.description) {
      onUpdate({ data: { ...data, description: localDesc } });
    }
  };

  const getPriorityIcon = () => {
    switch (data.priority) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "medium":
        return <Flag className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "absolute rounded-lg shadow-md overflow-hidden cursor-move transition-shadow",
        isSelected && "ring-2 ring-blue-500 shadow-lg",
        isDark ? "bg-slate-800" : "bg-white"
      )}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        zIndex: element.zIndex,
        borderLeft: `4px solid ${data.color || "#3B82F6"}`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div
        className={cn(
          "px-3 py-2 border-b",
          isDark ? "border-slate-700" : "border-gray-100"
        )}
      >
        <div className="flex items-center gap-2">
          {getPriorityIcon()}
          {isEditingTitle && !readOnly ? (
            <input
              ref={titleRef}
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleBlur();
                if (e.key === "Escape") {
                  setLocalTitle(data.title || "");
                  setIsEditingTitle(false);
                }
              }}
              className={cn(
                "flex-1 text-sm font-semibold bg-transparent border-none outline-none",
                isDark ? "text-white" : "text-gray-900"
              )}
            />
          ) : (
            <h3
              className={cn(
                "flex-1 text-sm font-semibold truncate",
                isDark ? "text-white" : "text-gray-900"
              )}
              onDoubleClick={() => !readOnly && setIsEditingTitle(true)}
            >
              {localTitle || "Untitled Card"}
            </h3>
          )}
        </div>
        {data.status && (
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full mt-1 inline-block",
              isDark
                ? "bg-slate-700 text-slate-300"
                : "bg-gray-100 text-gray-600"
            )}
          >
            {data.status}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2 flex-1 overflow-hidden">
        {isEditingDesc && !readOnly ? (
          <textarea
            ref={descRef}
            value={localDesc}
            onChange={(e) => setLocalDesc(e.target.value)}
            onBlur={handleDescBlur}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setLocalDesc(data.description || "");
                setIsEditingDesc(false);
              }
            }}
            className={cn(
              "w-full h-full text-xs bg-transparent border-none outline-none resize-none",
              isDark ? "text-slate-300" : "text-gray-600"
            )}
          />
        ) : (
          <p
            className={cn(
              "text-xs line-clamp-3",
              isDark ? "text-slate-300" : "text-gray-600"
            )}
            onDoubleClick={() => !readOnly && setIsEditingDesc(true)}
          >
            {localDesc || "Double-click to add description..."}
          </p>
        )}
      </div>

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <div className="px-3 py-2 flex flex-wrap gap-1">
          {data.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
