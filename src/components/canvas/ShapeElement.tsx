import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Trash2, Copy, Lock, Unlock, Palette } from "lucide-react";
import { CanvasElement, ShapeData, ShapeType, SHAPE_COLORS } from "./types";

interface ShapeElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  scale: number;
  readOnly?: boolean;
}

const ShapeSVG = ({
  type,
  fill,
  stroke,
  strokeWidth,
}: {
  type: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
}) => {
  const commonProps = {
    fill,
    stroke,
    strokeWidth,
  };

  switch (type) {
    case "rectangle":
      return (
        <rect x="5" y="5" width="90" height="90" rx="4" {...commonProps} />
      );
    case "circle":
      return <circle cx="50" cy="50" r="45" {...commonProps} />;
    case "triangle":
      return <polygon points="50,5 95,95 5,95" {...commonProps} />;
    case "diamond":
      return <polygon points="50,5 95,50 50,95 5,50" {...commonProps} />;
    case "hexagon":
      return (
        <polygon points="25,5 75,5 95,50 75,95 25,95 5,50" {...commonProps} />
      );
    case "star":
      return (
        <polygon
          points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35"
          {...commonProps}
        />
      );
    case "arrow":
      return (
        <polygon
          points="5,40 65,40 65,20 95,50 65,80 65,60 5,60"
          {...commonProps}
        />
      );
    case "cloud":
      return (
        <path
          d="M25,60 Q5,60 5,45 Q5,30 25,30 Q25,15 45,15 Q65,15 70,30 Q90,30 90,45 Q90,60 70,60 Z"
          {...commonProps}
        />
      );
    default:
      return (
        <rect x="5" y="5" width="90" height="90" rx="4" {...commonProps} />
      );
  }
};

export function ShapeElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  scale,
  readOnly = false,
}: ShapeElementProps) {
  const data = element.data as ShapeData;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const shapeRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly || element.locked) return;
    e.stopPropagation();
    onSelect();
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
      const newSize = Math.max(
        50,
        Math.min(
          resizeStart.current.width + deltaX / scale,
          resizeStart.current.height + deltaY / scale
        )
      );
      onUpdate({
        size: { width: newSize, height: newSize },
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
      if (shapeRef.current && !shapeRef.current.contains(e.target as Node)) {
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

  const handleColorChange = (color: string, type: "fill" | "stroke") => {
    onUpdate({
      data: { ...data, [type]: color },
    });
  };

  return (
    <div
      ref={shapeRef}
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
      {/* Shape SVG */}
      <svg
        viewBox="0 0 100 100"
        className={cn(
          "w-full h-full transition-all duration-200",
          isSelected && "filter drop-shadow-lg"
        )}
      >
        <ShapeSVG
          type={data.shapeType}
          fill={data.fill}
          stroke={data.stroke}
          strokeWidth={data.strokeWidth}
        />
      </svg>

      {/* Selection ring */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded pointer-events-none" />
      )}

      {/* Selection controls - hidden in read-only mode */}
      {!readOnly && isSelected && (
        <>
          {/* Top toolbar */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            {/* Color picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
                title="Colors"
              >
                <Palette className="w-4 h-4" />
              </button>
              {showColorPicker && (
                <div className="absolute top-full mt-2 left-0 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 min-w-[180px]">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Fill
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {SHAPE_COLORS.map((color) => (
                          <button
                            key={`fill-${color}`}
                            onClick={() => handleColorChange(color, "fill")}
                            className={cn(
                              "w-6 h-6 rounded transition-transform hover:scale-110",
                              data.fill === color &&
                                "ring-2 ring-blue-500 ring-offset-1"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <button
                          onClick={() =>
                            handleColorChange("transparent", "fill")
                          }
                          className={cn(
                            "w-6 h-6 rounded border-2 border-dashed border-slate-300 dark:border-slate-500 transition-transform hover:scale-110",
                            data.fill === "transparent" &&
                              "ring-2 ring-blue-500"
                          )}
                          title="No fill"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Stroke
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {SHAPE_COLORS.map((color) => (
                          <button
                            key={`stroke-${color}`}
                            onClick={() => handleColorChange(color, "stroke")}
                            className={cn(
                              "w-6 h-6 rounded transition-transform hover:scale-110",
                              data.stroke === color &&
                                "ring-2 ring-blue-500 ring-offset-1"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
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
