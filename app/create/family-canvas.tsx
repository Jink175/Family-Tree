"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { useTree } from "@/lib/tree-context"
import type { FamilyNode } from "@/lib/types"
import {
  renderNodeOnCanvas,
  isPointInNode,
  getClosestConnectionPoint,
  NODE_WIDTH_CONST,
  NODE_HEIGHT_CONST,
} from "./family-node-renderer"
import { drawArrow, isPointNearArrow, isPointNearEndpoint, getClosestNode } from "./arrow-renderer"

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
  } = useTree()
  const [hoveredNodeId, setHoveredNodeId] = useState<string>()
  const [selectedArrowId, setSelectedArrowId] = useState<string | null>(null)

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

        const angle = Math.atan2(derivY, derivX)
        const arrowSize = 12

        ctx.fillStyle = ctx.strokeStyle
        ctx.beginPath()
        ctx.moveTo(targetX, targetY)
        ctx.lineTo(
          targetX - arrowSize * Math.cos(angle - Math.PI / 6),
          targetY - arrowSize * Math.sin(angle - Math.PI / 6),
        )
        ctx.lineTo(
          targetX - arrowSize * Math.cos(angle + Math.PI / 6),
          targetY - arrowSize * Math.sin(angle + Math.PI / 6),
        )
        ctx.closePath()
        ctx.fill()
      }
    })

    if (connectionDrawState.isDrawing && connectionDrawState.fromNodeId) {
      const fromNode = tree.nodes.find((n) => n.id === connectionDrawState.fromNodeId)
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

    let arrowClicked = false

    for (const arrow of arrows) {
      // Check if clicking on endpoint
      if (isPointNearEndpoint(x, y, arrow, "start", 10)) {
        setArrowDragState({
          isArrowDragging: true,
          draggedArrowId: arrow.id,
          draggedEndpoint: "start",
          offsetX: x - arrow.startX,
          offsetY: y - arrow.startY,
        })
        setSelectedArrowId(arrow.id)
        selectNode(null)
        arrowClicked = true
        break
      }

      if (isPointNearEndpoint(x, y, arrow, "end", 10)) {
        setArrowDragState({
          isArrowDragging: true,
          draggedArrowId: arrow.id,
          draggedEndpoint: "end",
          offsetX: x - arrow.endX,
          offsetY: y - arrow.endY,
        })
        setSelectedArrowId(arrow.id)
        selectNode(null)
        arrowClicked = true
        break
      }

      // Check if clicking on arrow body
      if (isPointNearArrow(x, y, arrow)) {
        setArrowDragState({
          isArrowDragging: true,
          draggedArrowId: arrow.id,
          draggedEndpoint: null,
          offsetX: x - (arrow.startX + arrow.endX) / 2,
          offsetY: y - (arrow.startY + arrow.endY) / 2,
        })
        setSelectedArrowId(arrow.id)
        selectNode(null)
        arrowClicked = true
        break
      }
    }

    if (arrowClicked) return

    let clickedNode: FamilyNode | undefined
    let isPortClick = false

    for (const node of tree.nodes) {
      if (isPointInNode(x, y, node)) {
        clickedNode = node

        // Check if clicked on a port (within 15px radius of any port)
        const ports = [
          { x: node.x + NODE_WIDTH / 2, y: node.y - 4 },
          { x: node.x + NODE_WIDTH / 2, y: node.y + NODE_HEIGHT + 4 },
          { x: node.x - 4, y: node.y + NODE_HEIGHT / 2 },
          { x: node.x + NODE_WIDTH + 4, y: node.y + NODE_HEIGHT / 2 },
        ]

        for (const port of ports) {
          const dist = Math.hypot(x - port.x, y - port.y)
          if (dist <= 15) {
            isPortClick = true
            break
          }
        }
        break
      }
    }

    if (clickedNode) {
      if (isPortClick) {
        // Start connection drawing
        setConnectionDrawState({
          isDrawing: true,
          fromNodeId: clickedNode.id,
          currentX: x,
          currentY: y,
          fromConnectionPoint: "bottom",
        })
        selectNode(null)
      } else {
        // Regular node selection and dragging
        selectNode(clickedNode.id)
        setDragState({
          isDragging: true,
          draggedNodeId: clickedNode.id,
          offsetX: x - clickedNode.x,
          offsetY: y - clickedNode.y,
        })
      }
    } else {
      selectNode(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

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
        // Drag start endpoint
        const newStartX = x - arrowDragState.offsetX
        const newStartY = y - arrowDragState.offsetY
        const closestNode = getClosestNode(newStartX, newStartY, tree.nodes)

        updateArrow(arrow.id, {
          startX: newStartX,
          startY: newStartY,
          startNodeId: closestNode?.id,
        })
      } else if (arrowDragState.draggedEndpoint === "end") {
        // Drag end endpoint
        const newEndX = x - arrowDragState.offsetX
        const newEndY = y - arrowDragState.offsetY
        const closestNode = getClosestNode(newEndX, newEndY, tree.nodes)

        updateArrow(arrow.id, {
          endX: newEndX,
          endY: newEndY,
          endNodeId: closestNode?.id,
        })
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

    // Check for hovered node
    let hoveredNode: FamilyNode | undefined
    for (const node of tree.nodes) {
      if (isPointInNode(x, y, node)) {
        hoveredNode = node
        break
      }
    }
    setHoveredNodeId(hoveredNode?.id)

    // Handle dragging
    if (dragState.isDragging && dragState.draggedNodeId) {
      const newX = x - dragState.offsetX
      const newY = y - dragState.offsetY

      updateNode(dragState.draggedNodeId, { x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      draggedNodeId: null,
      offsetX: 0,
      offsetY: 0,
    })
    setConnectionDrawState({
      isDrawing: false,
      fromNodeId: null,
      currentX: 0,
      currentY: 0,
      fromConnectionPoint: "bottom",
    })
    setArrowDragState({
      isArrowDragging: false,
      draggedArrowId: null,
      draggedEndpoint: null,
      offsetX: 0,
      offsetY: 0,
    })
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (canvas && !canvas.contains(e.target as Node)) {
        setSelectedArrowId(null)
        selectNode(null)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [selectNode])

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
