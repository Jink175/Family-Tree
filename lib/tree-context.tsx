"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type {
  FamilyNode,
  Connection,
  FamilyTree,
  DragState,
  CanvasState,
  ConnectionDrawState,
  Arrow,
  ArrowDragState,
} from "./types"
import { getCurrentTree } from "./storage"
import { getSnapPoints } from "@/app/create/family-node-renderer"

interface TreeContextType {
  tree: FamilyTree
  canvasState: CanvasState
  dragState: DragState
  connectionDrawState: ConnectionDrawState
  arrows: Arrow[]
  arrowDragState: ArrowDragState
  addNode: (node: Omit<FamilyNode, "id">) => void
  updateNode: (id: string, updates: Partial<FamilyNode>) => void
  deleteNode: (id: string) => void
  addConnection: (connection: Omit<Connection, "id">) => void
  deleteConnection: (id: string) => void
  selectNode: (id: string | null) => void
  setDragState: (state: Partial<DragState>) => void
  setCanvasState: (state: Partial<CanvasState>) => void
  setConnectionDrawState: (state: Partial<ConnectionDrawState>) => void
  getSelectedNode: () => FamilyNode | undefined
  setTreeData: (tree: FamilyTree) => void
  addArrow: (arrow: Omit<Arrow, "id">) => void
  updateArrow: (id: string, updates: Partial<Arrow>) => void
  deleteArrow: (id: string) => void
  setArrowDragState: (state: Partial<ArrowDragState>) => void
  getsnapPoints: (node: FamilyNode) => { x: number; y: number }[]
  getNearestSnapPoint: (x: number, y: number, nodes: FamilyNode[]) => { x: number; y: number; nodeId: string } | null
  zoomIn: () => void
  zoomOut: () => void
  setZoom: (scale: number) => void
}

const TreeContext = createContext<TreeContextType | undefined>(undefined)

export function findNearestSnapPoint(x: number, y: number, nodes: FamilyNode[]) {
  let nearest = null
  let minDist = 15 // bán kính snap
  nodes.forEach(node => {
    getSnapPoints(node).forEach(p => {
      const d = Math.hypot(x - p.x, y - p.y)
      if (d < minDist) {
        minDist = d
        nearest = { ...p, nodeId: node.id }
      }
    })
  })
  return nearest
}


export function TreeProvider({ children }: { children: React.ReactNode }) {
  const [tree, setTree] = useState<FamilyTree>({
    id: `tree-${Date.now()}`,
    name: "My Family Tree",
    nodes: [],
    connections: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const [canvasState, setCanvasState] = useState<CanvasState>({
    scale: 1,
    panX: 0,
    panY: 0,
    selectedNodeId: null,
    backgroundId: null,
  })

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedNodeId: null,
    offsetX: 0,
    offsetY: 0,
  })

  const [connectionDrawState, setConnectionDrawState] = useState<ConnectionDrawState>({
    isDrawing: false,
    fromNodeId: null,
    currentX: 0,
    currentY: 0,
    fromConnectionPoint: "bottom",
  })

  const [arrowDragState, setArrowDragState] = useState<ArrowDragState>({
    isArrowDragging: false,
    draggedArrowId: null,
    draggedEndpoint: null,
    offsetX: 0,
    offsetY: 0,
  })

  const [arrows, setArrows] = useState<Arrow[]>([])

  // Load tree from localStorage on mount
  useEffect(() => {
    const savedTree = getCurrentTree()
    if (savedTree) {
      setTree(savedTree)
      // Load arrows from localStorage if available
      const savedArrows = localStorage.getItem("familyTreeArrows")
      if (savedArrows) {
        setArrows(JSON.parse(savedArrows))
      }
    }
  }, [])

  // Auto-save arrows to localStorage
  useEffect(() => {
    localStorage.setItem("familyTreeArrows", JSON.stringify(arrows))
  }, [arrows])

  const addNode = useCallback((node: Omit<FamilyNode, "id">) => {
    const newNode: FamilyNode = {
      ...node,
      id: `node-${Date.now()}`,
    }
    setTree((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date(),
    }))
  }, [])

  const updateNode = useCallback((id: string, updates: Partial<FamilyNode>) => {
    setTree((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => (node.id === id ? { ...node, ...updates } : node)),
      updatedAt: new Date(),
    }))
  }, [])

  const deleteNode = useCallback((id: string) => {
    setTree((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((node) => node.id !== id),
      connections: prev.connections.filter((conn) => conn.sourceId !== id && conn.targetId !== id),
      updatedAt: new Date(),
    }))
  }, [])

  const addConnection = (connection: Omit<Connection, "id">) => {
    const id = crypto.randomUUID()
    const newConnection: Connection = { id, ...connection }
    setTree(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection],
    }))
    return id
  }

  

  const deleteConnection = useCallback((id: string) => {
    setTree((prev) => ({
      ...prev,
      connections: prev.connections.filter((conn) => conn.id !== id),
      updatedAt: new Date(),
    }))
  }, [])

  const selectNode = useCallback((id: string | null) => {
    setCanvasState((prev) => ({
      ...prev,
      selectedNodeId: id,
    }))
  }, [])

  const getSelectedNode = useCallback(() => {
    return tree.nodes.find((node) => node.id === canvasState.selectedNodeId)
  }, [tree.nodes, canvasState.selectedNodeId])

  const setTreeData = useCallback((newTree: FamilyTree) => {
    setTree(newTree)
  }, [])

  const addArrow = (arrow: Omit<Arrow, "id">): string => {
    const id = crypto.randomUUID()

    const newArrow: Arrow = {
      id,
      ...arrow,
    }

    setArrows(prev => [...prev, newArrow])

    return id
  }


  const updateArrow = useCallback((id: string, updates: Partial<Arrow>) => {
    setArrows((prev) => prev.map((arrow) => (arrow.id === id ? { ...arrow, ...updates } : arrow)))
  }, [])

  const deleteArrow = useCallback((id: string) => {
    setArrows((prev) => prev.filter((arrow) => arrow.id !== id))
  }, [])

    const handleSetDragState = useCallback((state: Partial<DragState>) => {
    setDragState((prev) => ({
      ...prev,
      ...state,
    }))
  }, [])

  const handleSetCanvasState = useCallback((state: Partial<CanvasState>) => {
    setCanvasState((prev) => ({
      ...prev,
      ...state,
    }))
  }, [])

  const handleSetConnectionDrawState = useCallback((state: Partial<ConnectionDrawState>) => {
    setConnectionDrawState((prev) => ({
      ...prev,
      ...state,
    }))
  }, [])

  const handleSetArrowDragState = useCallback((state: Partial<ArrowDragState>) => {
    setArrowDragState((prev) => ({
      ...prev,
      ...state,
    }))
  }, [])

  const zoomIn = () => {
    setCanvasState(prev => ({ 
      ...prev, 
      scale: Math.min(5, prev.scale * 1.2) // Limit max zoom to 5x
    }))
  }

  const zoomOut = () => {
    setCanvasState(prev => ({ 
      ...prev, 
      scale: Math.max(0.1, prev.scale / 1.2) // Limit min zoom to 0.1x
    }))
  }

  const setZoom = (scale: number) => {
    setCanvasState(prev => ({ ...prev, scale }))
  }



  const value: TreeContextType = {
    tree,
    canvasState,
    dragState,
    connectionDrawState,
    arrows,
    arrowDragState,
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    deleteConnection,
    selectNode,
    setDragState: handleSetDragState,
    setCanvasState: handleSetCanvasState,
    setConnectionDrawState: handleSetConnectionDrawState,
    getSelectedNode,
    setTreeData,
    addArrow,
    updateArrow,
    deleteArrow,
    zoomIn,
    zoomOut,
    setZoom,
    setArrowDragState: handleSetArrowDragState,
    getsnapPoints: getSnapPoints,
    getNearestSnapPoint: findNearestSnapPoint,

  }

  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>
}

export function useTree() {
  const context = useContext(TreeContext)
  if (context === undefined) {
    throw new Error("useTree must be used within a TreeProvider")
  }
  return context
}