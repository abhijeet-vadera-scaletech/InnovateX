import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Trash2, Copy, Lock, Unlock, Maximize2, Minimize2 } from "lucide-react";
import { CanvasElement, ImageData } from "./types";

interface ImageElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  scale: number;
  readOnly?: boolean;
}

export function ImageElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  scale,
  readOnly = false,
}: ImageElementProps) {
  const data = element.data as ImageData;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly || element.locked) return;
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
      const aspectRatio =
        resizeStart.current.width / resizeStart.current.height;
      const newWidth = Math.max(
        100,
        resizeStart.current.width + deltaX / scale
      );
      const newHeight = newWidth / aspectRatio;
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

  const toggleFit = () => {
    const newFit = data.objectFit === "cover" ? "contain" : "cover";
    onUpdate({
      data: { ...data, objectFit: newFit },
    });
  };

  return (
    <div
      ref={imageRef}
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
        if (!readOnly) onSelect();
      }}
    >
      {/* Image */}
      <div
        className={cn(
          "w-full h-full rounded-lg overflow-hidden shadow-lg transition-all duration-200",
          isSelected && "ring-2 ring-blue-500 ring-offset-2"
        )}
      >
        <img
          src={data.src}
          alt={data.alt}
          className="w-full h-full"
          style={{ objectFit: data.objectFit }}
          draggable={false}
        />
      </div>

      {/* Selection controls - hidden in read-only mode */}
      {!readOnly && isSelected && (
        <>
          {/* Top toolbar */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={toggleFit}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
              title={
                data.objectFit === "cover"
                  ? "Fit to container"
                  : "Fill container"
              }
            >
              {data.objectFit === "cover" ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

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

          {/* Resize handles */}
          {!element.locked && (
            <>
              <div
                className="absolute -top-1 -left-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize"
                onMouseDown={handleResizeStart}
              />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize"
                onMouseDown={handleResizeStart}
              />
              <div
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize"
                onMouseDown={handleResizeStart}
              />
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize"
                onMouseDown={handleResizeStart}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
