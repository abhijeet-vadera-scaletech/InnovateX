import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SHAPE_COLORS } from "./types";

interface DrawingCanvasProps {
  isActive: boolean;
  strokeColor: string;
  strokeWidth: number;
  onStrokeColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  paths: string[];
  onPathsChange: (paths: string[]) => void;
  isEraser?: boolean;
  scale: number;
  panOffset: { x: number; y: number };
}

export function DrawingCanvas({
  isActive,
  strokeColor,
  strokeWidth,
  onStrokeColorChange,
  onStrokeWidthChange,
  paths,
  onPathsChange,
  isEraser = false,
  scale,
  panOffset,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>("");
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Redraw all paths when paths change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(scale, scale);

    // Draw all paths
    paths.forEach((pathData) => {
      const [color, width, ...points] = pathData.split("|");
      if (points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = Number(width);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const firstPoint = points[0].split(",");
      ctx.moveTo(Number(firstPoint[0]), Number(firstPoint[1]));

      for (let i = 1; i < points.length; i++) {
        const point = points[i].split(",");
        ctx.lineTo(Number(point[0]), Number(point[1]));
      }
      ctx.stroke();
    });

    ctx.restore();
  }, [paths, scale, panOffset]);

  const getCanvasPoint = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panOffset.x) / scale,
      y: (e.clientY - rect.top - panOffset.y) / scale,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;

    const point = getCanvasPoint(e);
    setIsDrawing(true);
    lastPoint.current = point;

    // Start new path
    const pathStart = `${isEraser ? "#FFFFFF" : strokeColor}|${strokeWidth}|${
      point.x
    },${point.y}`;
    setCurrentPath(pathStart);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !isActive) return;

    const point = getCanvasPoint(e);

    // Add point to current path
    setCurrentPath((prev) => `${prev}|${point.x},${point.y}`);

    // Draw the current stroke
    const canvas = canvasRef.current;
    if (!canvas || !lastPoint.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.strokeStyle = isEraser ? "#FFFFFF" : strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    ctx.restore();

    lastPoint.current = point;
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPath) {
      onPathsChange([...paths, currentPath]);
      setCurrentPath("");
    }
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      handleMouseUp();
    }
  };

  // Resize canvas to fill container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 z-10",
          isActive ? "cursor-crosshair" : "pointer-events-none"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {/* Drawing toolbar */}
      {isActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
          {/* Color picker */}
          <div className="flex items-center gap-1">
            {SHAPE_COLORS.slice(0, 6).map((color) => (
              <button
                key={color}
                onClick={() => onStrokeColorChange(color)}
                className={cn(
                  "w-6 h-6 rounded-full transition-transform hover:scale-110",
                  strokeColor === color && "ring-2 ring-offset-2 ring-blue-500"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

          {/* Stroke width */}
          <div className="flex items-center gap-2">
            {[2, 4, 8, 12].map((width) => (
              <button
                key={width}
                onClick={() => onStrokeWidthChange(width)}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                  strokeWidth === width
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
              >
                <div
                  className="rounded-full bg-current"
                  style={{
                    width: width,
                    height: width,
                    backgroundColor: strokeColor,
                  }}
                />
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

          {/* Clear all */}
          <button
            onClick={() => onPathsChange([])}
            className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </>
  );
}
