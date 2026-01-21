export interface FamilyNode {
  id: string
  name: string
  relationship: "parent" | "child" | "spouse" | "sibling"
  x: number
  y: number
  width: number
  height: number
  image?: string
  notes: string
  birthYear?: number
  deathYear?: number
  gender?: "male" | "female" | "other"
  _pendingImage?: File // 🔹 file tạm, không lưu DB

}

export interface Connection {
  id: string
  sourceId: string
  targetId: string
  type: "parent-child" | "spouse" | "sibling"
}

export interface FamilyTree {
  id?: string
  nodes: FamilyNode[]
  connections: Connection[]
  created_at?: Date
  updated_at?: Date
}



export interface DragState {
  isDragging: boolean
  draggedNodeId: string | null
  offsetX: number
  offsetY: number
}

export interface ConnectionDrawState {
  isDrawing: boolean
  fromNodeId: string | null
  currentX: number
  currentY: number
  fromConnectionPoint: "top" | "bottom" | "left" | "right"
}

export interface CanvasState {
  scale: number
  panX: number
  panY: number
  selectedNodeId: string | null
  backgroundId?: string | null
  diagramName: string
}

export interface Arrow {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  startNodeId?: string // Optional: gắn vào node nào
  endNodeId?: string // Optional: gắn vào node nào
  type: "solid" | "dashed" | "dotted"
  color: string
  label?: string
}

export interface ArrowDragState {
  isArrowDragging: boolean
  draggedArrowId: string | null
  draggedEndpoint: "start" | "end" | null // Kéo endpoint nào
  offsetX: number
  offsetY: number
}
