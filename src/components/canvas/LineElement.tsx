import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CanvasElement, LineData } from "./types";

interface LineElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  scale: number;
  readOnly?: boolean;
}

export function LineElement({
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
}: LineElementProps) {
  const data = element.data as LineData;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const orientation = data.orientation || "horizontal";
  const color = data.color || "#64748B";
  const strokeWidth = data.strokeWidth || 2;
  const style = data.style || "solid";

  const getStrokeDasharray = () => {
    switch (style) {
      case "dashed":
        return "8 4";
      case "dotted":
        return "2 2";
      default:
        return "none";
    }
  };

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
      onUpdate({ position: { x: newX, y: newY } });
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

  return (
    <div
      className={cn(
        "absolute cursor-move",
        isSelected && "ring-2 ring-blue-500 ring-offset-2"
      )}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        zIndex: element.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      <svg width="100%" height="100%" className="overflow-visible">
        {orientation === "horizontal" ? (
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={getStrokeDasharray()}
            strokeLinecap="round"
          />
        ) : (
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={getStrokeDasharray()}
            strokeLinecap="round"
          />
        )}
      </svg>

      {/* Resize handles */}
      {isSelected && !readOnly && (
        <>
          {orientation === "horizontal" ? (
            <>
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-6 bg-white border border-gray-300 rounded cursor-ew-resize flex items-center justify-center"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsResizing(true);
                }}
              >
                <GripVertical className="w-2 h-2 text-gray-400" />
              </div>
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-6 bg-white border border-gray-300 rounded cursor-ew-resize flex items-center justify-center"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsResizing(true);
                }}
              >
                <GripVertical className="w-2 h-2 text-gray-400" />
              </div>
            </>
          ) : (
            <>
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-3 bg-white border border-gray-300 rounded cursor-ns-resize flex items-center justify-center"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsResizing(true);
                }}
              >
                <GripVertical className="w-2 h-2 text-gray-400 rotate-90" />
              </div>
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-3 bg-white border border-gray-300 rounded cursor-ns-resize flex items-center justify-center"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsResizing(true);
                }}
              >
                <GripVertical className="w-2 h-2 text-gray-400 rotate-90" />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
