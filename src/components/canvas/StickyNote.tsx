import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  Trash2,
  Copy,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";
import { CanvasElement, StickyNoteData, STICKY_COLORS } from "./types";

interface StickyNoteProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  scale: number;
  readOnly?: boolean;
}

export function StickyNote({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  scale,
  readOnly = false,
}: StickyNoteProps) {
  const data = element.data as StickyNoteData;
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly || element.locked || isEditing) return;
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
        150,
        resizeStart.current.width + deltaX / scale
      );
      const newHeight = Math.max(
        100,
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

  // Close color picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (noteRef.current && !noteRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showColorPicker]);

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

  const handleDoubleClick = () => {
    if (!readOnly && !element.locked) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (content !== data.content) {
      onUpdate({
        data: { ...data, content },
      });
    }
  };

  const handleColorChange = (color: string) => {
    onUpdate({
      data: { ...data, color },
    });
    setShowColorPicker(false);
  };

  return (
    <div
      ref={noteRef}
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
      onDoubleClick={handleDoubleClick}
      onClick={(e) => {
        e.stopPropagation();
        // Don't call onSelect here - it's already called in onMouseDown
        // This prevents double-selection issues
      }}
    >
      {/* Sticky note body */}
      <div
        className={cn(
          "w-full h-full rounded-lg shadow-lg transition-shadow duration-200",
          isSelected && "ring-2 ring-blue-500 ring-offset-2 shadow-xl",
          element.locked && "opacity-80"
        )}
        style={{ backgroundColor: data.color }}
      >
        {/* Fold effect */}
        <div
          className="absolute top-0 right-0 w-8 h-8"
          style={{
            background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)`,
          }}
        />

        {/* Content */}
        <div className="p-4 h-full">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setContent(data.content);
                }
              }}
              className="w-full h-full bg-transparent resize-none outline-none text-slate-800"
              style={{ fontSize: data.fontSize }}
              placeholder="Type your note..."
            />
          ) : (
            <p
              className="text-slate-800 whitespace-pre-wrap break-words h-full overflow-hidden"
              style={{ fontSize: data.fontSize }}
            >
              {data.content || "Double-click to edit..."}
            </p>
          )}
        </div>
      </div>

      {/* Selection controls - hidden in read-only mode */}
      {!readOnly && isSelected && !isEditing && (
        <>
          {/* Top toolbar */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            {/* Color picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-6 h-6 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: data.color }}
                title="Change color"
              />
              {showColorPicker && (
                <div className="absolute top-full mt-2 left-0 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 min-w-[160px]">
                  <div className="grid grid-cols-4 gap-2">
                    {STICKY_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleColorChange(color.value)}
                        className={cn(
                          "w-8 h-8 rounded transition-transform hover:scale-110",
                          data.color === color.value &&
                            "ring-2 ring-blue-500 ring-offset-1"
                        )}
                        style={{ backgroundColor: color.value }}
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

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Z-Index controls */}
            <button
              onClick={onBringToFront}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
              title="Bring to Front"
            >
              <ChevronsUp className="w-4 h-4" />
            </button>
            <button
              onClick={onBringForward}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
              title="Bring Forward"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={onSendBackward}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
              title="Send Backward"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={onSendToBack}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
              title="Send to Back"
            >
              <ChevronsDown className="w-4 h-4" />
            </button>
          </div>

          {/* Resize handle */}
          {!element.locked && (
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={handleResizeStart}
            />
          )}

          {/* Drag handle */}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-slate-400" />
          </div>
        </>
      )}
    </div>
  );
}
