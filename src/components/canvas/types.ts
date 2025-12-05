// Canvas element types
export type ElementType =
  | "sticky-note"
  | "text"
  | "shape"
  | "image"
  | "connector"
  | "drawing"
  | "frame"
  | "icon";

export type ShapeType =
  | "rectangle"
  | "circle"
  | "triangle"
  | "diamond"
  | "hexagon"
  | "star"
  | "arrow"
  | "cloud";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  data: ElementData;
}

export interface StickyNoteData {
  content: string;
  color: string;
  fontSize: number;
}

export interface TextData {
  content: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  color: string;
  align: "left" | "center" | "right";
}

export interface ShapeData {
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface ImageData {
  src: string;
  alt: string;
  objectFit: "cover" | "contain" | "fill";
}

export interface ConnectorData {
  startElementId: string | null;
  endElementId: string | null;
  startPoint: Position;
  endPoint: Position;
  lineType: "straight" | "curved" | "elbow";
  arrowStart: boolean;
  arrowEnd: boolean;
  color: string;
  strokeWidth: number;
}

export interface DrawingData {
  paths: string[];
  color: string;
  strokeWidth: number;
}

export interface FrameData {
  title: string;
  backgroundColor: string;
}

export interface IconData {
  iconName: string;
  color: string;
  size: number;
}

export type ElementData =
  | StickyNoteData
  | TextData
  | ShapeData
  | ImageData
  | ConnectorData
  | DrawingData
  | FrameData
  | IconData;

export interface CanvasState {
  elements: CanvasElement[];
  selectedIds: string[];
  zoom: number;
  pan: Position;
  tool: ToolType;
  isDrawing: boolean;
}

export type ToolType =
  | "select"
  | "pan"
  | "sticky-note"
  | "text"
  | "shape"
  | "connector"
  | "draw"
  | "eraser"
  | "image"
  | "frame"
  | "icon"
  | "comment";

export interface ToolConfig {
  id: ToolType;
  label: string;
  icon: string;
  shortcut?: string;
}

// Sticky note color presets
export const STICKY_COLORS = [
  { name: "Yellow", value: "#FEF3C7", dark: "#FCD34D" },
  { name: "Pink", value: "#FCE7F3", dark: "#F9A8D4" },
  { name: "Blue", value: "#DBEAFE", dark: "#93C5FD" },
  { name: "Green", value: "#D1FAE5", dark: "#6EE7B7" },
  { name: "Purple", value: "#EDE9FE", dark: "#C4B5FD" },
  { name: "Orange", value: "#FFEDD5", dark: "#FDBA74" },
  { name: "Teal", value: "#CCFBF1", dark: "#5EEAD4" },
  { name: "Gray", value: "#F3F4F6", dark: "#D1D5DB" },
];

// Shape color presets
export const SHAPE_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#6B7280", // Gray
  "#000000", // Black
  "#FFFFFF", // White
];
