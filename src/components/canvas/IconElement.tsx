import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Trash2, Copy, Lock, Unlock, Palette } from "lucide-react";
import {
  Star,
  Lightbulb,
  Target,
  Rocket,
  Check,
  X,
  HelpCircle,
  AlertCircle,
  MessageCircle,
  Pin,
  Flame,
  Diamond,
  Trophy,
  BarChart3,
  TrendingUp,
  Zap,
  Palette as PaletteIcon,
  Wrench,
  FileText,
  Bell,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Calendar,
  Users,
  Settings,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Eye,
  Search,
  Home,
  Bookmark,
  Flag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { CanvasElement, IconData, SHAPE_COLORS } from "./types";

interface IconElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  scale: number;
  readOnly?: boolean;
}

// Map icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  star: Star,
  lightbulb: Lightbulb,
  target: Target,
  rocket: Rocket,
  check: Check,
  x: X,
  "help-circle": HelpCircle,
  "alert-circle": AlertCircle,
  "message-circle": MessageCircle,
  pin: Pin,
  flame: Flame,
  diamond: Diamond,
  trophy: Trophy,
  "bar-chart": BarChart3,
  "trending-up": TrendingUp,
  zap: Zap,
  palette: PaletteIcon,
  wrench: Wrench,
  "file-text": FileText,
  bell: Bell,
  heart: Heart,
  "thumbs-up": ThumbsUp,
  "thumbs-down": ThumbsDown,
  clock: Clock,
  calendar: Calendar,
  users: Users,
  settings: Settings,
  lock: LockIcon,
  unlock: UnlockIcon,
  eye: Eye,
  search: Search,
  home: Home,
  bookmark: Bookmark,
  flag: Flag,
  sparkles: Sparkles,
};

export function IconElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  scale,
  readOnly = false,
}: IconElementProps) {
  const data = element.data as IconData;
  const [isDragging, setIsDragging] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const IconComponent = ICON_MAP[data.iconName] || Star;

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

  // Close color picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) {
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
      data: { ...data, color },
    });
    setShowColorPicker(false);
  };

  return (
    <div
      ref={iconRef}
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
      {/* Icon */}
      <div
        className={cn(
          "w-full h-full flex items-center justify-center rounded-lg transition-all duration-200",
          isSelected && "ring-2 ring-blue-500 ring-offset-2"
        )}
      >
        <IconComponent
          className="transition-transform"
          style={{
            width: data.size,
            height: data.size,
            color: data.color,
          }}
        />
      </div>

      {/* Selection controls */}
      {!readOnly && isSelected && (
        <>
          {/* Top toolbar */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            {/* Color picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
                title="Color"
              >
                <Palette className="w-4 h-4" />
              </button>
              {showColorPicker && (
                <div className="absolute top-full mt-2 left-0 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 min-w-[160px]">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Icon Color
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {SHAPE_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
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
