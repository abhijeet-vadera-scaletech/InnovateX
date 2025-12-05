import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Trash2, Copy, Lock, Unlock, Edit3, Palette } from "lucide-react";
import { CanvasElement, FrameData } from "./types";

// Frame color presets
const FRAME_COLORS = [
  { name: "Purple", value: "rgba(139, 92, 246, 0.15)", border: "#8B5CF6" },
  { name: "Blue", value: "rgba(59, 130, 246, 0.15)", border: "#3B82F6" },
  { name: "Teal", value: "rgba(20, 184, 166, 0.15)", border: "#14B8A6" },
  { name: "Green", value: "rgba(34, 197, 94, 0.15)", border: "#22C55E" },
  { name: "Yellow", value: "rgba(234, 179, 8, 0.15)", border: "#EAB308" },
  { name: "Orange", value: "rgba(249, 115, 22, 0.15)", border: "#F97316" },
  { name: "Red", value: "rgba(239, 68, 68, 0.15)", border: "#EF4444" },
  { name: "Pink", value: "rgba(236, 72, 153, 0.15)", border: "#EC4899" },
  { name: "Gray", value: "rgba(107, 114, 128, 0.15)", border: "#6B7280" },
  { name: "Slate", value: "rgba(100, 116, 139, 0.15)", border: "#64748B" },
];

interface FrameElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  scale: number;
  readOnly?: boolean;
}

export function FrameElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  scale,
  readOnly = false,
}: FrameElementProps) {
  const data = element.data as FrameData;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [title, setTitle] = useState(data.title);
  const frameRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };
    if (showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showColorPicker]);

  const handleColorChange = (color: string) => {
    onUpdate({
      data: { ...data, backgroundColor: color },
    });
    setShowColorPicker(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly || element.locked || isEditingTitle) return;
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
      onUpdate({
        position: { x: newX, y: newY },
      });
    }
    if (isResizing && !element.locked) {
      const deltaX = e.clientX - resizeStart.current.x;
      const deltaY = e.clientY - resizeStart.current.y;
      const newWidth = Math.max(
        200,
        resizeStart.current.width + deltaX / scale
      );
      const newHeight = Math.max(
        150,
        resizeStart.current.height + deltaY / scale
      );
      onUpdate({
        size: { width: newWidth, height: newHeight },
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  const handleResizeStart = (e: React.MouseEvent) => {
    if (readOnly || element.locked) return;
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = {
      width: element.size.width,
      height: element.size.height,
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title !== data.title) {
      onUpdate({
        data: { ...data, title },
      });
    }
  };

  return (
    <div
      ref={frameRef}
      className={cn(
        "absolute select-none",
        !readOnly && "group cursor-move",
        readOnly && "cursor-default",
        isSelected && "z-50",
        isDragging && "cursor-grabbing"
      )}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        // Don't call onSelect here - it's already called in onMouseDown
        // This prevents double-selection issues
      }}
    >
      {/* Frame body */}
      <div
        className={cn(
          "w-full h-full rounded-xl border-2 border-dashed transition-all duration-200",
          isSelected
            ? "border-blue-500 shadow-lg"
            : "border-slate-300 dark:border-slate-600",
          element.locked && "opacity-80"
        )}
        style={{ backgroundColor: data.backgroundColor }}
      >
        {/* Title bar */}
        <div className="absolute -top-7 left-0 flex items-center gap-2">
          {isEditingTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleBlur();
                if (e.key === "Escape") {
                  setTitle(data.title);
                  setIsEditingTitle(false);
                }
              }}
              className="px-2 py-0.5 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <span
              className={cn(
                "px-2 py-0.5 text-sm font-medium rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700",
                isSelected
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400"
              )}
              onDoubleClick={() =>
                !readOnly && !element.locked && setIsEditingTitle(true)
              }
            >
              {data.title}
            </span>
          )}
        </div>
      </div>

      {/* Selection controls */}
      {!readOnly && isSelected && !isEditingTitle && (
        <>
          {/* Top toolbar */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setIsEditingTitle(true)}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
              title="Edit title"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Color picker button */}
            <div className="relative" ref={colorPickerRef}>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
                title="Change color"
              >
                <Palette className="w-4 h-4" />
              </button>

              {/* Color picker dropdown - positioned relative to button */}
              {showColorPicker && (
                <div
                  className="absolute top-8 left-0 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 z-[9999]"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-5 gap-1.5 w-max">
                    {FRAME_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleColorChange(color.value)}
                        className={cn(
                          "w-6 h-6 rounded transition-all hover:scale-110",
                          data.backgroundColor === color.value &&
                            "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-800"
                        )}
                        style={{ backgroundColor: color.border }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

            <button
              onClick={onDuplicate}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={() => onUpdate({ locked: !element.locked })}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
              title={element.locked ? "Unlock" : "Lock"}
            >
              {element.locked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onDelete}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Resize handle */}
          {!element.locked && (
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={handleResizeStart}
            />
          )}
        </>
      )}
    </div>
  );
}
