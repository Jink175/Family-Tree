"use client"

import { useRef, useEffect, useState } from "react"
import type React from "react"
import { useTree } from "@/lib/tree-context"
import type { FamilyNode } from "@/lib/types"
import {
  renderNodeOnCanvas,
  isPointInNode,
  getClosestConnectionPoint,
  isPointNearNodeEdge,
  renderSnapPoints,
  NODE_WIDTH_CONST,
  NODE_HEIGHT_CONST,
} from "./family-node-renderer"
import { drawArrow, isPointNearArrow, isPointNearEndpoint, getClosestNode } from "./arrow-renderer"
function getSnapPoints(node: FamilyNode) {
  const { x, y, width, height } = node

  const top = [
    { x: x + width * 0.25, y },
    { x: x + width * 0.5, y },
    { x: x + width * 0.75, y },
  ]

  const bottom = [
    { x: x + width * 0.25, y: y + height },
    { x: x + width * 0.5, y: y + height },
    { x: x + width * 0.75, y: y + height },
  ]

  const left = [
    { x, y: y + height * 0.25 },
    { x, y: y + height * 0.5 },
    { x, y: y + height * 0.75 },
  ]

  const right = [
    { x: x + width, y: y + height * 0.25 },
    { x: x + width, y: y + height * 0.5 },
    { x: x + width, y: y + height * 0.75 },
  ]

  const corners = [
    { x, y },
    { x: x + width, y },
    { x, y: y + height },
    { x: x + width, y: y + height },
  ]

  return [...top, ...bottom, ...left, ...right, ...corners]
}

function findNearestSnapPoint(x: number, y: number, nodes: FamilyNode[]) {
  let nearest = null
  let minDist = 12 // snap radius
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

const NODE_WIDTH = NODE_WIDTH_CONST
const NODE_HEIGHT = NODE_HEIGHT_CONST

export function FamilyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    tree,
    canvasState,
    dragState,
    connectionDrawState,
    updateNode,
    selectNode,
    setDragState,
    setConnectionDrawState,
    addConnection,
    arrows,
    arrowDragState,
    addArrow,
    updateArrow,
    deleteArrow,
    setArrowDragState,
    deleteNode,
  } = useTree()
  const [hoveredNodeId, setHoveredNodeId] = useState<string>()
  const [selectedArrowId, setSelectedArrowId] = useState<string | null>(null)
  const [isDraggingStarted, setIsDraggingStarted] = useState(false)
  const mouseDownPosRef = useRef({ x: 0, y: 0 })

  // Handle keyboard events for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete selected arrow
        if (selectedArrowId) {
          deleteArrow(selectedArrowId)
          setSelectedArrowId(null)
          e.preventDefault()
        }
        // Delete selected node
        else if (canvasState.selectedNodeId) {
          deleteNode(canvasState.selectedNodeId)
          selectNode(null)
          e.preventDefault()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedArrowId, canvasState.selectedNodeId, deleteArrow, deleteNode, selectNode])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Draw grid background
    ctx.strokeStyle = "#f0f0f0"
    ctx.lineWidth = 1
    const gridSize = 20
    for (let i = 0; i <= width; i += gridSize) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let i = 0; i <= height; i += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }

    // Draw existing connections
    ctx.strokeStyle = "#94a3b8"
    ctx.lineWidth = 2
    tree.connections.forEach((connection) => {
      const source = tree.nodes.find((n) => n.id === connection.sourceId)
      const target = tree.nodes.find((n) => n.id === connection.targetId)
      if (source && target) {
        // Determine connection points based on node positions
        const sourceX = source.x + NODE_WIDTH / 2
        const sourceY = source.y + NODE_HEIGHT

        const targetX = target.x + NODE_WIDTH / 2
        const targetY = target.y

        // Calculate control points for bezier curve based on distance
        const dx = targetX - sourceX
        const dy = targetY - sourceY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Adjust control point offset based on horizontal/vertical layout
        let controlOffsetX = 0
        let controlOffsetY = distance * 0.3

        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal layout - use more horizontal control offset
          controlOffsetX = dx > 0 ? 80 : -80
          controlOffsetY = distance * 0.2
        }

        // Draw connection line based on type
        if (connection.type === "parent-child") {
          ctx.strokeStyle = "#3b82f6"
        } else if (connection.type === "spouse") {
          ctx.strokeStyle = "#f59e0b"
          ctx.setLineDash([5, 5])
        } else {
          ctx.strokeStyle = "#8b5cf6"
          ctx.setLineDash([2, 2])
        }

        ctx.beginPath()
        ctx.moveTo(sourceX, sourceY)

        // Use quadratic bezier for smoother curves
        const controlX = (sourceX + targetX) / 2 + controlOffsetX
        const controlY = (sourceY + targetY) / 2 + controlOffsetY

        ctx.quadraticCurveTo(controlX, controlY, targetX, targetY)
        ctx.stroke()
        ctx.setLineDash([])

        // Calculate derivative of quadratic bezier at endpoint for accurate arrow angle
        const t = 0.99 // Near end of curve
        const mt = 1 - t

        // Derivative of quadratic bezier: 2(1-t)(control - start) + 2t(end - control)
        const derivX = 2 * mt * (controlX - sourceX) + 2 * t * (targetX - controlX)
        const derivY = 2 * mt * (controlY - sourceY) + 2 * t * (targetY - controlY)

      }
    })

    if (connectionDrawState.isDrawing && connectionDrawState.fromNodeId) {
      const fromNode = tree.nodes.find((n) => n.id === connectionDrawState.fromNodeId)
      tree.nodes.forEach(node => {
        renderSnapPoints(ctx, node)
      })
      if (fromNode) {
        const startPoint = getClosestConnectionPoint(
          fromNode.x,
          fromNode.y,
          connectionDrawState.currentX,
          connectionDrawState.currentY,
        )

        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(connectionDrawState.currentX, connectionDrawState.currentY)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // Draw arrows
    arrows.forEach((arrow) => {
      const isSelected = selectedArrowId === arrow.id
      drawArrow(ctx, arrow, isSelected, tree.nodes)
    })

    // Draw snap points when dragging arrow endpoint
    if (arrowDragState.isArrowDragging && arrowDragState.draggedEndpoint && hoveredNodeId) {
      const hoveredNode = tree.nodes.find(n => n.id === hoveredNodeId)
      if (hoveredNode) {
        renderSnapPoints(ctx, hoveredNode)
      }
    }

    // Draw nodes
    tree.nodes.forEach((node) => {
      const isSelected = canvasState.selectedNodeId === node.id
      renderNodeOnCanvas(ctx, node, isSelected, hoveredNodeId)
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = containerRef.current
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    draw()
  }, [tree, canvasState.selectedNodeId, hoveredNodeId, connectionDrawState, arrows, selectedArrowId])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Store initial mouse position
    mouseDownPosRef.current = { x, y }
    setIsDraggingStarted(false)

    let arrowClicked = false

    // Check if clicking on arrow (prioritize endpoints for selected arrows)
    for (const arrow of arrows) {
      const isSelected = selectedArrowId === arrow.id

      // Check endpoints first (only if arrow is selected)
      if (isSelected && isPointNearEndpoint(x, y, arrow, "start", 10)) {
        setArrowDragState({
          isArrowDragging: true,
          draggedArrowId: arrow.id,
          draggedEndpoint: "start",
          offsetX: x - arrow.startX,
          offsetY: y - arrow.startY,
        })
        selectNode(null)
        arrowClicked = true
        break
      }

      if (isSelected && isPointNearEndpoint(x, y, arrow, "end", 10)) {
        setArrowDragState({
          isArrowDragging: true,
          draggedArrowId: arrow.id,
          draggedEndpoint: "end",
          offsetX: x - arrow.endX,
          offsetY: y - arrow.endY,
        })
        selectNode(null)
        arrowClicked = true
        break
      }

      // Check if clicking on arrow body
      if (isPointNearArrow(x, y, arrow)) {
        // If clicking same arrow, deselect it
        if (selectedArrowId === arrow.id) {
          setSelectedArrowId(null)
        } else {
          // Select new arrow
          setSelectedArrowId(arrow.id)
        }
        selectNode(null)
        arrowClicked = true
        break
      }
    }

    if (arrowClicked) return

    let clickedNode: FamilyNode | undefined

    for (const node of tree.nodes) {
      if (isPointInNode(x, y, node)) {
        clickedNode = node
        break
      }
    }

    if (clickedNode) {
      // Check if clicking near edge for connection drawing
      if (isPointNearNodeEdge(x, y, clickedNode)) {
        setConnectionDrawState({
          isDrawing: true,
          fromNodeId: clickedNode.id,
          currentX: x,
          currentY: y,
        })
        selectNode(null)
        setSelectedArrowId(null)
        return
      }

      // If clicking same node that's already selected, deselect it
      if (canvasState.selectedNodeId === clickedNode.id) {
        selectNode(null)
        setSelectedArrowId(null)
      } else {
        // Select new node but don't start dragging yet
        selectNode(clickedNode.id)
        setSelectedArrowId(null)
        // Prepare for potential drag
        setDragState({
          isDragging: false,
          draggedNodeId: clickedNode.id,
          offsetX: x - clickedNode.x,
          offsetY: y - clickedNode.y,
        })
      }
      return
    }

    // Click on empty space - deselect all
    setSelectedArrowId(null)
    selectNode(null)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if mouse moved enough to start dragging (5px threshold)
    const dragThreshold = 5
    const dx = Math.abs(x - mouseDownPosRef.current.x)
    const dy = Math.abs(y - mouseDownPosRef.current.y)
    
    if (!isDraggingStarted && (dx > dragThreshold || dy > dragThreshold)) {
      setIsDraggingStarted(true)
      
      // Start dragging node if one is prepared
      if (dragState.draggedNodeId && !dragState.isDragging) {
        setDragState({
          ...dragState,
          isDragging: true,
        })
      }
    }

    if (connectionDrawState.isDrawing) {
      setConnectionDrawState({
        currentX: x,
        currentY: y,
      })
    }

    if (arrowDragState.isArrowDragging && arrowDragState.draggedArrowId) {
      const arrow = arrows.find((a) => a.id === arrowDragState.draggedArrowId)
      if (!arrow) return

      if (arrowDragState.draggedEndpoint === "start") {
        // Drag start endpoint with snap
        const newStartX = x - arrowDragState.offsetX
        const newStartY = y - arrowDragState.offsetY
        
        // Find nearest snap point
        const snapPoint = findNearestSnapPoint(newStartX, newStartY, tree.nodes)
        
        if (snapPoint) {
          // Snap to node
          updateArrow(arrow.id, {
            startX: snapPoint.x,
            startY: snapPoint.y,
            startNodeId: snapPoint.nodeId,
          })
          setHoveredNodeId(snapPoint.nodeId)
        } else {
          // Free position
          updateArrow(arrow.id, {
            startX: newStartX,
            startY: newStartY,
            startNodeId: undefined,
          })
          setHoveredNodeId(undefined)
        }
      } else if (arrowDragState.draggedEndpoint === "end") {
        // Drag end endpoint with snap
        const newEndX = x - arrowDragState.offsetX
        const newEndY = y - arrowDragState.offsetY
        
        // Find nearest snap point
        const snapPoint = findNearestSnapPoint(newEndX, newEndY, tree.nodes)
        
        if (snapPoint) {
          // Snap to node
          updateArrow(arrow.id, {
            endX: snapPoint.x,
            endY: snapPoint.y,
            endNodeId: snapPoint.nodeId,
          })
          setHoveredNodeId(snapPoint.nodeId)
        } else {
          // Free position
          updateArrow(arrow.id, {
            endX: newEndX,
            endY: newEndY,
            endNodeId: undefined,
          })
          setHoveredNodeId(undefined)
        }
      } else {
        // Drag entire arrow
        const centerX = (arrow.startX + arrow.endX) / 2
        const centerY = (arrow.startY + arrow.endY) / 2
        const dx = x - arrowDragState.offsetX - centerX
        const dy = y - arrowDragState.offsetY - centerY

        updateArrow(arrow.id, {
          startX: arrow.startX + dx,
          startY: arrow.startY + dy,
          endX: arrow.endX + dx,
          endY: arrow.endY + dy,
        })
      }
    }

    // Check for hovered node (only when not dragging arrow)
    if (!arrowDragState.isArrowDragging) {
      let hoveredNode: FamilyNode | undefined
      for (const node of tree.nodes) {
        if (isPointInNode(x, y, node)) {
          hoveredNode = node
          break
        }
      }
      setHoveredNodeId(hoveredNode?.id)
    }

    // Handle node dragging (only if dragging has started)
    if (dragState.isDragging && dragState.draggedNodeId && isDraggingStarted) {
      const newX = x - dragState.offsetX
      const newY = y - dragState.offsetY

      updateNode(dragState.draggedNodeId, { x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDraggingStarted(false)
    
    setDragState({
      isDragging: false,
      draggedNodeId: null,
      offsetX: 0,
      offsetY: 0,
    })
    
    if (connectionDrawState.isDrawing && connectionDrawState.fromNodeId) {
      const startNode = tree.nodes.find(n => n.id === connectionDrawState.fromNodeId)
      const endSnap = findNearestSnapPoint(connectionDrawState.currentX, connectionDrawState.currentY, tree.nodes)
      
      if (startNode && endSnap) {
        addConnection({
          sourceId: startNode.id,
          targetId: endSnap.nodeId,
          type: "parent-child",
        })
      }

      setConnectionDrawState({
        isDrawing: false,
        fromNodeId: null,
        currentX: 0,
        currentY: 0,
        fromConnectionPoint: "bottom",
      })
    }

    // Reset hover state when mouse up
    setHoveredNodeId(undefined)

    setArrowDragState({
      isArrowDragging: false,
      draggedArrowId: null,
      draggedEndpoint: null,
      offsetX: 0,
      offsetY: 0,
    })
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white cursor-crosshair overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="absolute top-0 left-0 cursor-move"
      />
    </div>
  )
}