import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Trash2, Copy, ChevronsUp, ChevronsDown } from "lucide-react";
import { CanvasElement, ConnectorData } from "./types";

interface ConnectorElementProps {
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
  allElements?: CanvasElement[];
}

export function ConnectorElement({
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
  allElements = [],
}: ConnectorElementProps) {
  const data = element.data as ConnectorData;
  const [isDragging, setIsDragging] = useState(false);
  const [dragPoint, setDragPoint] = useState<"start" | "end" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  // Calculate the bounding box for the connector
  const minX = Math.min(data.startPoint.x, data.endPoint.x) - 20;
  const minY = Math.min(data.startPoint.y, data.endPoint.y) - 20;
  const maxX = Math.max(data.startPoint.x, data.endPoint.x) + 20;
  const maxY = Math.max(data.startPoint.y, data.endPoint.y) + 20;
  const width = maxX - minX;
  const height = maxY - minY;

  // Relative positions within the SVG
  const startX = data.startPoint.x - minX;
  const startY = data.startPoint.y - minY;
  const endX = data.endPoint.x - minX;
  const endY = data.endPoint.y - minY;

  // Calculate control points for curved lines
  const midX = (startX + endX) / 2;

  // Generate path based on line type
  const getPath = () => {
    switch (data.lineType) {
      case "curved":
        // Bezier curve
        const cx1 = startX + (endX - startX) * 0.5;
        const cy1 = startY;
        const cx2 = startX + (endX - startX) * 0.5;
        const cy2 = endY;
        return `M ${startX} ${startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endX} ${endY}`;
      case "elbow":
        // Right-angle connector
        return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
      default:
        // Straight line
        return `M ${startX} ${startY} L ${endX} ${endY}`;
    }
  };

  // Arrow marker size
  const arrowSize = 10;

  const handleMouseDown = (e: React.MouseEvent, point?: "start" | "end") => {
    if (readOnly) return;
    e.stopPropagation();
    onSelect(e);

    if (point) {
      setDragPoint(point);
      setIsDragging(true);
      const pointData = point === "start" ? data.startPoint : data.endPoint;
      dragStart.current = {
        x: e.clientX - pointData.x * scale,
        y: e.clientY - pointData.y * scale,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragPoint) return;

    const newX = (e.clientX - dragStart.current.x) / scale;
    const newY = (e.clientY - dragStart.current.y) / scale;

    // Check for snapping to elements
    let snappedX = newX;
    let snappedY = newY;
    let snappedElementId: string | null = null;

    for (const el of allElements) {
      if (el.id === element.id) continue;

      const centerX = el.position.x + el.size.width / 2;
      const centerY = el.position.y + el.size.height / 2;
      const snapThreshold = 20;

      // Check edges
      const edges = [
        { x: el.position.x, y: centerY }, // left
        { x: el.position.x + el.size.width, y: centerY }, // right
        { x: centerX, y: el.position.y }, // top
        { x: centerX, y: el.position.y + el.size.height }, // bottom
      ];

      for (const edge of edges) {
        if (
          Math.abs(newX - edge.x) < snapThreshold &&
          Math.abs(newY - edge.y) < snapThreshold
        ) {
          snappedX = edge.x;
          snappedY = edge.y;
          snappedElementId = el.id;
          break;
        }
      }
    }

    if (dragPoint === "start") {
      onUpdate({
        data: {
          ...data,
          startPoint: { x: snappedX, y: snappedY },
          startElementId: snappedElementId,
        },
      });
    } else {
      onUpdate({
        data: {
          ...data,
          endPoint: { x: snappedX, y: snappedY },
          endElementId: snappedElementId,
        },
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragPoint(null);
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
  }, [isDragging, dragPoint]);

  return (
    <div
      className={cn(
        "absolute select-none",
        !readOnly && "group",
        isSelected && "z-50"
      )}
      style={{
        left: minX,
        top: minY,
        width,
        height,
        zIndex: element.zIndex,
        pointerEvents: "none",
      }}
      onClick={(e) => {
        e.stopPropagation();
        // Selection is handled in onMouseDown of the path elements
      }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ pointerEvents: "stroke" }}
      >
        {/* Arrow marker definition */}
        <defs>
          <marker
            id={`arrow-${element.id}`}
            markerWidth={arrowSize}
            markerHeight={arrowSize}
            refX={arrowSize - 2}
            refY={arrowSize / 2}
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <polygon
              points={`0 0, ${arrowSize} ${arrowSize / 2}, 0 ${arrowSize}`}
              fill={data.color}
            />
          </marker>
          <marker
            id={`arrow-start-${element.id}`}
            markerWidth={arrowSize}
            markerHeight={arrowSize}
            refX={2}
            refY={arrowSize / 2}
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <polygon
              points={`0 0, ${arrowSize} ${arrowSize / 2}, 0 ${arrowSize}`}
              fill={data.color}
            />
          </marker>
        </defs>

        {/* Main path */}
        <path
          d={getPath()}
          fill="none"
          stroke={data.color}
          strokeWidth={data.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd={data.arrowEnd ? `url(#arrow-${element.id})` : undefined}
          markerStart={
            data.arrowStart ? `url(#arrow-start-${element.id})` : undefined
          }
          className={cn(
            "cursor-pointer transition-all",
            isSelected && "stroke-blue-500"
          )}
          style={{ pointerEvents: "stroke" }}
          onMouseDown={(e) => handleMouseDown(e as any)}
        />

        {/* Invisible wider path for easier selection */}
        <path
          d={getPath()}
          fill="none"
          stroke="transparent"
          strokeWidth={Math.max(data.strokeWidth + 10, 15)}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="cursor-pointer"
          style={{ pointerEvents: "stroke" }}
          onMouseDown={(e) => handleMouseDown(e as any)}
        />
      </svg>

      {/* Endpoint handles */}
      {!readOnly && isSelected && (
        <>
          {/* Start point handle */}
          <div
            className={cn(
              "absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-move transform -translate-x-1/2 -translate-y-1/2",
              data.startElementId && "bg-green-100 border-green-500"
            )}
            style={{
              left: startX,
              top: startY,
              pointerEvents: "auto",
            }}
            onMouseDown={(e) => handleMouseDown(e, "start")}
          />

          {/* End point handle */}
          <div
            className={cn(
              "absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-move transform -translate-x-1/2 -translate-y-1/2",
              data.endElementId && "bg-green-100 border-green-500"
            )}
            style={{
              left: endX,
              top: endY,
              pointerEvents: "auto",
            }}
            onMouseDown={(e) => handleMouseDown(e, "end")}
          />

          {/* Toolbar */}
          <div
            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
            style={{ pointerEvents: "auto" }}
          >
            {/* Line type selector */}
            <select
              value={data.lineType}
              onChange={(e) =>
                onUpdate({
                  data: {
                    ...data,
                    lineType: e.target.value as ConnectorData["lineType"],
                  },
                })
              }
              className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded border-none outline-none"
            >
              <option value="straight">Straight</option>
              <option value="curved">Curved</option>
              <option value="elbow">Elbow</option>
            </select>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Arrow toggles */}
            <button
              onClick={() =>
                onUpdate({ data: { ...data, arrowStart: !data.arrowStart } })
              }
              className={cn(
                "p-1 rounded transition-colors",
                data.arrowStart
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600"
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-500"
              )}
              title="Arrow at start"
            >
              <span className="text-xs">←</span>
            </button>
            <button
              onClick={() =>
                onUpdate({ data: { ...data, arrowEnd: !data.arrowEnd } })
              }
              className={cn(
                "p-1 rounded transition-colors",
                data.arrowEnd
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600"
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-500"
              )}
              title="Arrow at end"
            >
              <span className="text-xs">→</span>
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
              onClick={onSendToBack}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
              title="Send to Back"
            >
              <ChevronsDown className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
