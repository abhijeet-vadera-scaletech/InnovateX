import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Copy,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
} from "lucide-react";
import { CanvasElement, TextData, SHAPE_COLORS } from "./types";

interface TextElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  scale: number;
  readOnly?: boolean;
}

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 72, 96];

export function TextElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  scale,
  readOnly = false,
}: TextElementProps) {
  const data = element.data as TextData;
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content);
  const [isDragging, setIsDragging] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
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

  // Close formatting menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        elementRef.current &&
        !elementRef.current.contains(e.target as Node)
      ) {
        setShowFormatting(false);
      }
    };

    if (showFormatting) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFormatting]);

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

  const updateStyle = (updates: Partial<TextData>) => {
    onUpdate({
      data: { ...data, ...updates },
    });
  };

  return (
    <div
      ref={elementRef}
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
        minWidth: element.size.width,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Text content */}
      <div
        className={cn(
          "px-2 py-1 rounded transition-all duration-200",
          isSelected && "ring-2 ring-blue-500 ring-offset-2"
        )}
      >
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsEditing(false);
                setContent(data.content);
              }
            }}
            className="bg-transparent resize-none outline-none min-w-[100px]"
            style={{
              fontSize: data.fontSize,
              fontWeight: data.fontWeight,
              fontFamily: data.fontFamily,
              color: data.color,
              textAlign: data.align,
            }}
            rows={content.split("\n").length || 1}
          />
        ) : (
          <p
            className="whitespace-pre-wrap break-words"
            style={{
              fontSize: data.fontSize,
              fontWeight: data.fontWeight,
              fontFamily: data.fontFamily,
              color: data.color,
              textAlign: data.align,
            }}
          >
            {data.content || "Double-click to edit..."}
          </p>
        )}
      </div>

      {/* Selection controls - hidden in read-only mode */}
      {!readOnly && isSelected && !isEditing && (
        <>
          {/* Top toolbar */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            {/* Font size */}
            <select
              value={data.fontSize}
              onChange={(e) =>
                updateStyle({ fontSize: Number(e.target.value) })
              }
              className="text-xs bg-transparent border-none outline-none cursor-pointer"
            >
              {fontSizes.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Bold */}
            <button
              onClick={() =>
                updateStyle({
                  fontWeight: data.fontWeight === "bold" ? "normal" : "bold",
                })
              }
              className={cn(
                "p-1 rounded transition-colors",
                data.fontWeight === "bold"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600"
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-500"
              )}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>

            {/* Alignment */}
            <button
              onClick={() => {
                const alignments: ("left" | "center" | "right")[] = [
                  "left",
                  "center",
                  "right",
                ];
                const currentIndex = alignments.indexOf(data.align);
                const nextIndex = (currentIndex + 1) % alignments.length;
                updateStyle({ align: alignments[nextIndex] });
              }}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
              title="Alignment"
            >
              {data.align === "left" && <AlignLeft className="w-4 h-4" />}
              {data.align === "center" && <AlignCenter className="w-4 h-4" />}
              {data.align === "right" && <AlignRight className="w-4 h-4" />}
            </button>

            {/* Color picker */}
            <div className="relative">
              <button
                onClick={() => setShowFormatting(!showFormatting)}
                className="w-6 h-6 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: data.color }}
                title="Text color"
              />
              {showFormatting && (
                <div className="absolute top-full mt-2 left-0 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 min-w-[160px]">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Text Color
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {SHAPE_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          updateStyle({ color });
                          setShowFormatting(false);
                        }}
                        className={cn(
                          "w-6 h-6 rounded transition-transform hover:scale-110",
                          data.color === color &&
                            "ring-2 ring-blue-500 ring-offset-1"
                        )}
                        style={{ backgroundColor: color }}
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
        </>
      )}
    </div>
  );
}
