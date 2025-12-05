import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/themeStore";
import {
  Bot,
  Maximize,
  Redo2,
  Save,
  Send,
  Undo2,
  ZoomIn,
  ZoomOut,
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
  Palette,
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
  Lock,
  Unlock,
  Eye,
  Search,
  Home,
  Bookmark,
  Flag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CanvasToolbar } from "./CanvasToolbar";
import { DrawingCanvas } from "./DrawingCanvas";
import { FrameElement } from "./FrameElement";
import { IconElement } from "./IconElement";
import { ImageElement } from "./ImageElement";
import { ShapeElement } from "./ShapeElement";
import { StickyNote } from "./StickyNote";
import { TextElement } from "./TextElement";
import { AIAssistantPanel } from "./AIAssistantPanel";
import {
  CanvasElement,
  Position,
  ShapeType,
  STICKY_COLORS,
  ToolType,
} from "./types";

interface IdeaCanvasProps {
  ideaId?: string;
  initialElements?: CanvasElement[];
  onSave?: (elements: CanvasElement[], drawingPaths: string[]) => void;
  onSubmit?: (elements: CanvasElement[], drawingPaths: string[]) => void;
  readOnly?: boolean;
  title?: string;
  onTitleChange?: (title: string) => void;
}

// Generate unique ID
const generateId = () =>
  `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Icon options for the icon picker - using Lucide icons
const ICON_OPTIONS: { icon: LucideIcon; label: string; id: string }[] = [
  { icon: Star, label: "Star", id: "star" },
  { icon: Lightbulb, label: "Idea", id: "lightbulb" },
  { icon: Target, label: "Target", id: "target" },
  { icon: Rocket, label: "Rocket", id: "rocket" },
  { icon: Check, label: "Check", id: "check" },
  { icon: X, label: "Cross", id: "x" },
  { icon: HelpCircle, label: "Question", id: "help-circle" },
  { icon: AlertCircle, label: "Alert", id: "alert-circle" },
  { icon: MessageCircle, label: "Comment", id: "message-circle" },
  { icon: Pin, label: "Pin", id: "pin" },
  { icon: Flame, label: "Fire", id: "flame" },
  { icon: Diamond, label: "Diamond", id: "diamond" },
  { icon: Trophy, label: "Trophy", id: "trophy" },
  { icon: BarChart3, label: "Chart", id: "bar-chart" },
  { icon: TrendingUp, label: "Growth", id: "trending-up" },
  { icon: Zap, label: "Lightning", id: "zap" },
  { icon: Palette, label: "Art", id: "palette" },
  { icon: Wrench, label: "Tool", id: "wrench" },
  { icon: FileText, label: "Note", id: "file-text" },
  { icon: Bell, label: "Bell", id: "bell" },
  { icon: Heart, label: "Heart", id: "heart" },
  { icon: ThumbsUp, label: "Thumbs Up", id: "thumbs-up" },
  { icon: ThumbsDown, label: "Thumbs Down", id: "thumbs-down" },
  { icon: Clock, label: "Clock", id: "clock" },
  { icon: Calendar, label: "Calendar", id: "calendar" },
  { icon: Users, label: "Team", id: "users" },
  { icon: Settings, label: "Settings", id: "settings" },
  { icon: Lock, label: "Lock", id: "lock" },
  { icon: Unlock, label: "Unlock", id: "unlock" },
  { icon: Eye, label: "View", id: "eye" },
  { icon: Search, label: "Search", id: "search" },
  { icon: Home, label: "Home", id: "home" },
  { icon: Bookmark, label: "Bookmark", id: "bookmark" },
  { icon: Flag, label: "Flag", id: "flag" },
  { icon: Sparkles, label: "Sparkles", id: "sparkles" },
];

export function IdeaCanvas({
  ideaId,
  initialElements = [],
  onSave,
  onSubmit,
  readOnly = false,
  title = "Untitled Idea",
  onTitleChange,
}: IdeaCanvasProps) {
  // Theme
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  // Canvas state
  const [elements, setElements] = useState<CanvasElement[]>(initialElements);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [activeShape, setActiveShape] = useState<ShapeType>("rectangle");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [drawingPaths, setDrawingPaths] = useState<string[]>([]);
  const [strokeColor, setStrokeColor] = useState("#3B82F6");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [history, setHistory] = useState<CanvasElement[][]>([initialElements]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconPickerPosition, setIconPickerPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const panStart = useRef<Position>({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync elements when initialElements changes (e.g., when loading existing idea)
  useEffect(() => {
    if (initialElements && initialElements.length > 0) {
      setElements(initialElements);
      setHistory([initialElements]);
      setHistoryIndex(0);
    }
  }, [initialElements]);

  // Sync title when it changes from parent
  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  // Update history when elements change
  const pushHistory = useCallback(
    (newElements: CanvasElement[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // Tool shortcuts
      if (e.key === "v" || e.key === "V") setActiveTool("select");
      if (e.key === "h" || e.key === "H") setActiveTool("pan");
      if (e.key === "n" || e.key === "N") setActiveTool("sticky-note");
      if (e.key === "t" || e.key === "T") setActiveTool("text");
      if (e.key === "s" && !e.metaKey && !e.ctrlKey) setActiveTool("shape");
      if (e.key === "l" || e.key === "L") setActiveTool("connector");
      if (e.key === "p" || e.key === "P") setActiveTool("draw");
      if (e.key === "e" || e.key === "E") setActiveTool("eraser");

      // Delete selected
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedIds.length > 0
      ) {
        const newElements = elements.filter(
          (el) => !selectedIds.includes(el.id)
        );
        setElements(newElements);
        pushHistory(newElements);
        setSelectedIds([]);
      }

      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      // Save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave?.(elements, drawingPaths);
      }

      // Escape to deselect and close popups
      if (e.key === "Escape") {
        setSelectedIds([]);
        setActiveTool("select");
        setShowIconPicker(false);
        setShowAIAssistant(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [elements, selectedIds, undo, redo, onSave, drawingPaths, pushHistory]);

  // Handle canvas click to create elements
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (readOnly) return;

    // Close popups when clicking on canvas
    setShowAIAssistant(false);
    if (activeTool !== "icon") {
      setShowIconPicker(false);
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    if (activeTool === "select") {
      setSelectedIds([]);
      return;
    }

    if (activeTool === "sticky-note") {
      const newElement: CanvasElement = {
        id: generateId(),
        type: "sticky-note",
        position: { x, y },
        size: { width: 200, height: 200 },
        rotation: 0,
        zIndex: elements.length + 1,
        locked: false,
        visible: true,
        data: {
          content: "",
          color:
            STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)]
              .value,
          fontSize: 14,
        },
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      pushHistory(newElements);
      setSelectedIds([newElement.id]);
      setActiveTool("select");
    }

    if (activeTool === "text") {
      const newElement: CanvasElement = {
        id: generateId(),
        type: "text",
        position: { x, y },
        size: { width: 200, height: 40 },
        rotation: 0,
        zIndex: elements.length + 1,
        locked: false,
        visible: true,
        data: {
          content: "",
          fontSize: 16,
          fontWeight: "normal",
          fontFamily: "Inter, sans-serif",
          color: isDark ? "#FFFFFF" : "#1F2937",
          align: "left" as const,
        },
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      pushHistory(newElements);
      setSelectedIds([newElement.id]);
      setActiveTool("select");
    }

    if (activeTool === "shape") {
      const newElement: CanvasElement = {
        id: generateId(),
        type: "shape",
        position: { x, y },
        size: { width: 100, height: 100 },
        rotation: 0,
        zIndex: elements.length + 1,
        locked: false,
        visible: true,
        data: {
          shapeType: activeShape,
          fill: "#3B82F6",
          stroke: "#1E40AF",
          strokeWidth: 2,
        },
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      pushHistory(newElements);
      setSelectedIds([newElement.id]);
      setActiveTool("select");
    }

    // Frame tool - creates a container frame
    if (activeTool === "frame") {
      const newElement: CanvasElement = {
        id: generateId(),
        type: "frame",
        position: { x, y },
        size: { width: 400, height: 300 },
        rotation: 0,
        zIndex: elements.length + 1,
        locked: false,
        visible: true,
        data: {
          title: "Frame",
          backgroundColor: isDark
            ? "rgba(30, 41, 59, 0.5)"
            : "rgba(241, 245, 249, 0.8)",
        },
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      pushHistory(newElements);
      setSelectedIds([newElement.id]);
      setActiveTool("select");
    }

    // Comment tool - creates a comment marker
    if (activeTool === "comment") {
      const newElement: CanvasElement = {
        id: generateId(),
        type: "sticky-note",
        position: { x, y },
        size: { width: 250, height: 150 },
        rotation: 0,
        zIndex: elements.length + 1,
        locked: false,
        visible: true,
        data: {
          content: "",
          color: "#FEF3C7", // Yellow for comments
          fontSize: 14,
        },
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      pushHistory(newElements);
      setSelectedIds([newElement.id]);
      setActiveTool("select");
    }

    // Connector tool - for now, create a line shape
    if (activeTool === "connector") {
      const newElement: CanvasElement = {
        id: generateId(),
        type: "shape",
        position: { x, y },
        size: { width: 150, height: 4 },
        rotation: 0,
        zIndex: elements.length + 1,
        locked: false,
        visible: true,
        data: {
          shapeType: "arrow",
          fill: isDark ? "#94A3B8" : "#64748B",
          stroke: isDark ? "#94A3B8" : "#64748B",
          strokeWidth: 2,
        },
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      pushHistory(newElements);
      setSelectedIds([newElement.id]);
      setActiveTool("select");
    }

    // Icon tool - show icon picker
    if (activeTool === "icon") {
      setIconPickerPosition({ x, y });
      setShowIconPicker(true);
    }
  };

  // Create icon element with selected icon
  const createIconElement = (iconId: string) => {
    const newElement: CanvasElement = {
      id: generateId(),
      type: "icon",
      position: iconPickerPosition,
      size: { width: 48, height: 48 },
      rotation: 0,
      zIndex: elements.length + 1,
      locked: false,
      visible: true,
      data: {
        iconName: iconId,
        color: isDark ? "#FBBF24" : "#3B82F6",
        size: 32,
      },
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    pushHistory(newElements);
    setSelectedIds([newElement.id]);
    setShowIconPicker(false);
    setActiveTool("select");
  };

  // Handle panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "pan" || e.button === 1) {
      setIsPanning(true);
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.min(Math.max(prev * delta, 0.1), 5));
    }
  };

  // Update element
  const updateElement = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      const newElements = elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      );
      setElements(newElements);
    },
    [elements]
  );

  // Delete element
  const deleteElement = useCallback(
    (id: string) => {
      const newElements = elements.filter((el) => el.id !== id);
      setElements(newElements);
      pushHistory(newElements);
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    },
    [elements, pushHistory]
  );

  // Duplicate element
  const duplicateElement = useCallback(
    (id: string) => {
      const element = elements.find((el) => el.id === id);
      if (!element) return;

      const newElement: CanvasElement = {
        ...element,
        id: generateId(),
        position: {
          x: element.position.x + 20,
          y: element.position.y + 20,
        },
        zIndex: elements.length + 1,
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      pushHistory(newElements);
      setSelectedIds([newElement.id]);
    },
    [elements, pushHistory]
  );

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 400;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        const newElement: CanvasElement = {
          id: generateId(),
          type: "image",
          position: { x: 100, y: 100 },
          size: { width, height },
          rotation: 0,
          zIndex: elements.length + 1,
          locked: false,
          visible: true,
          data: {
            src: event.target?.result as string,
            alt: file.name,
            objectFit: "cover" as const,
          },
        };
        const newElements = [...elements, newElement];
        setElements(newElements);
        pushHistory(newElements);
        setSelectedIds([newElement.id]);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Zoom controls
  const zoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 5));
  const zoomOut = () => setZoom((prev) => Math.max(prev * 0.8, 0.1));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Handle AI Assistant actions - add, modify, or delete elements
  const handleAIActions = useCallback(
    (actions: { type: string; payload: any; targetElementId?: string }[]) => {
      if (!actions || actions.length === 0) return;

      setElements((currentElements) => {
        let updatedElements = [...currentElements];
        const newElements: CanvasElement[] = [];
        const modifiedIds: string[] = [];
        const deletedIds: string[] = [];

        actions.forEach((action, index) => {
          if (action.type === "add_sticky_note") {
            // Calculate position for new elements - spread them out in a grid
            const totalIndex = updatedElements.length + newElements.length;
            const baseX = 100 + (totalIndex % 3) * 260;
            const baseY = 100 + Math.floor(totalIndex / 3) * 240;

            newElements.push({
              id: generateId(),
              type: "sticky-note",
              position: { x: baseX, y: baseY },
              size: { width: 240, height: 180 },
              rotation: 0,
              zIndex: updatedElements.length + newElements.length + 1,
              locked: false,
              visible: true,
              data: {
                content: action.payload.content || "",
                color:
                  action.payload.color ||
                  STICKY_COLORS[index % STICKY_COLORS.length].value,
                fontSize: 14,
              },
            });
          } else if (action.type === "add_text") {
            const totalIndex = updatedElements.length + newElements.length;
            const baseX = 100 + (totalIndex % 3) * 260;
            const baseY = 100 + Math.floor(totalIndex / 3) * 240;

            newElements.push({
              id: generateId(),
              type: "text",
              position: { x: baseX, y: baseY },
              size: { width: 300, height: 50 },
              rotation: 0,
              zIndex: updatedElements.length + newElements.length + 1,
              locked: false,
              visible: true,
              data: {
                content: action.payload.content || "",
                fontSize: 18,
                fontWeight: "bold",
                fontFamily: "Inter, sans-serif",
                color: isDark ? "#FFFFFF" : "#1F2937",
                align: "left" as const,
              },
            });
          } else if (
            action.type === "modify_element" &&
            action.targetElementId
          ) {
            // Find and modify the target element
            updatedElements = updatedElements.map((el) => {
              if (el.id === action.targetElementId) {
                modifiedIds.push(el.id);
                return {
                  ...el,
                  data: {
                    ...el.data,
                    content: action.payload.content || (el.data as any).content,
                  },
                };
              }
              return el;
            });
          } else if (
            action.type === "delete_element" &&
            action.targetElementId
          ) {
            deletedIds.push(action.targetElementId);
            updatedElements = updatedElements.filter(
              (el) => el.id !== action.targetElementId
            );
          }
        });

        // Add new elements
        if (newElements.length > 0) {
          updatedElements = [...updatedElements, ...newElements];
        }

        // Push to history after state update
        if (
          newElements.length > 0 ||
          modifiedIds.length > 0 ||
          deletedIds.length > 0
        ) {
          setTimeout(() => {
            pushHistory(updatedElements);
            if (newElements.length > 0) {
              setSelectedIds(newElements.map((el) => el.id));
            } else if (modifiedIds.length > 0) {
              setSelectedIds(modifiedIds);
            }
          }, 0);
        }

        return updatedElements;
      });
    },
    [pushHistory, isDark]
  );

  // Render element based on type
  const renderElement = (element: CanvasElement) => {
    const isSelected = !readOnly && selectedIds.includes(element.id);
    const commonProps = {
      element,
      isSelected,
      onSelect: () => !readOnly && setSelectedIds([element.id]),
      onUpdate: (updates: Partial<CanvasElement>) =>
        !readOnly && updateElement(element.id, updates),
      onDelete: () => !readOnly && deleteElement(element.id),
      onDuplicate: () => !readOnly && duplicateElement(element.id),
      scale: zoom,
      readOnly,
    };

    switch (element.type) {
      case "sticky-note":
        return <StickyNote key={element.id} {...commonProps} />;
      case "shape":
        return <ShapeElement key={element.id} {...commonProps} />;
      case "text":
        return <TextElement key={element.id} {...commonProps} />;
      case "image":
        return <ImageElement key={element.id} {...commonProps} />;
      case "frame":
        return <FrameElement key={element.id} {...commonProps} />;
      case "icon":
        return <IconElement key={element.id} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Toolbar */}
      {!readOnly && (
        <CanvasToolbar
          activeTool={activeTool}
          onToolChange={(tool) => {
            setActiveTool(tool);
            if (tool === "image") {
              fileInputRef.current?.click();
            }
          }}
          activeShape={activeShape}
          onShapeChange={setActiveShape}
        />
      )}

      {/* Top bar - only show in edit mode */}
      {!readOnly && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
          {/* Title */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            {isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={() => {
                  setIsEditingTitle(false);
                  onTitleChange?.(editedTitle);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsEditingTitle(false);
                    onTitleChange?.(editedTitle);
                  }
                }}
                className="bg-transparent border-none outline-none text-lg font-semibold min-w-[200px]"
                autoFocus
              />
            ) : (
              <h1
                className="text-lg font-semibold cursor-pointer hover:text-blue-500 transition-colors"
                onClick={() => setIsEditingTitle(true)}
              >
                {title}
              </h1>
            )}
          </div>
        </div>
      )}

      {/* Right side actions */}
      {!readOnly && (
        <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
          {/* AI Assistant toggle */}
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border transition-all",
              showAIAssistant
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500"
            )}
          >
            <Bot className="w-4 h-4" />
            <span className="text-sm font-medium">AI Assistant</span>
          </button>

          {/* Save/Submit buttons */}
          <button
            onClick={() => onSave?.(elements, drawingPaths)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm font-medium">Save Draft</span>
          </button>
          <button
            onClick={() => onSubmit?.(elements, drawingPaths)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Submit</span>
          </button>
        </div>
      )}

      {/* Canvas area */}
      <div
        ref={canvasRef}
        className={cn(
          "absolute inset-0",
          activeTool === "pan" && "cursor-grab",
          isPanning && "cursor-grabbing",
          activeTool === "sticky-note" && "cursor-crosshair",
          activeTool === "text" && "cursor-text",
          activeTool === "shape" && "cursor-crosshair"
        )}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Transformed content */}
        <div
          className="absolute origin-top-left"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {elements.map(renderElement)}
        </div>

        {/* Drawing layer */}
        <DrawingCanvas
          isActive={activeTool === "draw" || activeTool === "eraser"}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          onStrokeColorChange={setStrokeColor}
          onStrokeWidthChange={setStrokeWidth}
          paths={drawingPaths}
          onPathsChange={setDrawingPaths}
          isEraser={activeTool === "eraser"}
          scale={zoom}
          panOffset={pan}
        />
      </div>

      {/* Bottom controls - only show in edit mode */}
      {!readOnly && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={zoomOut}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetZoom}
              className="px-3 py-1 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={zoomIn}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={resetZoom}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Fit to screen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* AI Assistant Panel - only show in edit mode */}
      {!readOnly && (
        <AIAssistantPanel
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          ideaId={ideaId}
          ideaTitle={title}
          canvasElements={elements}
          selectedElements={
            selectedIds
              .map((id) => elements.find((el) => el.id === id))
              .filter(Boolean) as CanvasElement[]
          }
          onExecuteActions={handleAIActions}
        />
      )}

      {/* Icon Picker Popup */}
      {showIconPicker && (
        <div
          className="absolute z-50"
          style={{
            left: iconPickerPosition.x * zoom + pan.x,
            top: iconPickerPosition.y * zoom + pan.y,
          }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                Select an Icon
              </h3>
              <button
                onClick={() => {
                  setShowIconPicker(false);
                  setActiveTool("select");
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map((iconOption) => {
                const IconComponent = iconOption.icon;
                return (
                  <button
                    key={iconOption.id}
                    onClick={() => createIconElement(iconOption.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"
                    title={iconOption.label}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}
