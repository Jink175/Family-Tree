"use client"

import { useRef, useEffect, useState, useCallback } from "react"
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
import { drawArrow, isPointNearArrow, isPointNearEndpoint } from "./arrow-renderer"
import { BACKGROUNDS } from "@/lib/backgrounds"

const NODE_WIDTH = NODE_WIDTH_CONST
const NODE_HEIGHT = NODE_HEIGHT_CONST

export function FamilyCanvas() {
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
    updateArrow,
    deleteArrow,
    setArrowDragState,
    deleteNode,
    setCanvasState,
    canvasRef,
    getNearestSnapPoint, // ✅ lấy từ context
  } = useTree()

  const [hoveredNodeId, setHoveredNodeId] = useState<string>()
  const [selectedArrowId, setSelectedArrowId] = useState<string | null>(null)
  const [isDraggingStarted, setIsDraggingStarted] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null)

  const mouseDownPosRef = useRef({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [isSpacePressed, setIsSpacePressed] = useState(false)

  // --- draw function (stable reference) ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)
    ctx.save()

    ctx.translate(canvasState.panX, canvasState.panY)
    ctx.scale(canvasState.scale, canvasState.scale)

    // === BACKGROUND ===
    if (backgroundImage) {
      const bgWidth = width / canvasState.scale
      const bgHeight = height / canvasState.scale
      ctx.drawImage(
        backgroundImage,
        -canvasState.panX / canvasState.scale,
        -canvasState.panY / canvasState.scale,
        bgWidth,
        bgHeight
      )
    } else {
      ctx.fillStyle = "#ffffff"
      const bgWidth = width / canvasState.scale
      const bgHeight = height / canvasState.scale
      ctx.fillRect(
        -canvasState.panX / canvasState.scale,
        -canvasState.panY / canvasState.scale,
        bgWidth,
        bgHeight
      )

      // grid
      ctx.strokeStyle = "#f0f0f0"
      ctx.lineWidth = 1 / canvasState.scale
      const gridSize = 20

      const startX =
        Math.floor(-canvasState.panX / canvasState.scale / gridSize) * gridSize
      const startY =
        Math.floor(-canvasState.panY / canvasState.scale / gridSize) * gridSize
      const endX = startX + bgWidth + gridSize
      const endY = startY + bgHeight + gridSize

      for (let i = startX; i <= endX; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(i, startY)
        ctx.lineTo(i, endY)
        ctx.stroke()
      }

      for (let i = startY; i <= endY; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(startX, i)
        ctx.lineTo(endX, i)
        ctx.stroke()
      }
    }

    // connections
    ctx.strokeStyle = "#94a3b8"
    ctx.lineWidth = 2
    tree.connections.forEach((connection) => {
      const source = tree.nodes.find((n) => n.id === connection.sourceId)
      const target = tree.nodes.find((n) => n.id === connection.targetId)
      if (!source || !target) return

      const sourceX = (source as FamilyNode).x + NODE_WIDTH / 2
      const sourceY = (source as FamilyNode).y + NODE_HEIGHT
      const targetX = (target as FamilyNode).x + NODE_WIDTH / 2
      const targetY = (target as FamilyNode).y

      const dx = targetX - sourceX
      const dy = targetY - sourceY
      const distance = Math.sqrt(dx * dx + dy * dy)

      let controlOffsetX = 0
      let controlOffsetY = distance * 0.3

      if (Math.abs(dx) > Math.abs(dy)) {
        controlOffsetX = dx > 0 ? 80 : -80
        controlOffsetY = distance * 0.2
      }

      const controlX = (sourceX + targetX) / 2 + controlOffsetX
      const controlY = (sourceY + targetY) / 2 + controlOffsetY

      ctx.beginPath()
      ctx.moveTo(sourceX, sourceY)
      ctx.quadraticCurveTo(controlX, controlY, targetX, targetY)
      ctx.stroke()
      ctx.setLineDash([])
    })

    // drawing connection preview
    if (connectionDrawState.isDrawing && connectionDrawState.fromNodeId) {
      const fromNode = tree.nodes.find((n) => n.id === connectionDrawState.fromNodeId)
      tree.nodes.forEach((node) => renderSnapPoints(ctx, node))

      if (fromNode) {
        const startPoint = getClosestConnectionPoint(
          fromNode.x,
          fromNode.y,
          connectionDrawState.currentX,
          connectionDrawState.currentY
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

    // arrows
    arrows.forEach((arrow) => {
      const isSelected = selectedArrowId === arrow.id
      drawArrow(ctx, arrow, isSelected, tree.nodes)
    })

    // snap points when dragging arrow endpoint
    if (arrowDragState.isArrowDragging && arrowDragState.draggedEndpoint && hoveredNodeId) {
      const hoveredNode = tree.nodes.find((n) => n.id === hoveredNodeId)
      if (hoveredNode) renderSnapPoints(ctx, hoveredNode)
    }

    // nodes
    tree.nodes.forEach((node) => {
      const isSelected = canvasState.selectedNodeId === node.id
      renderNodeOnCanvas(ctx, node, isSelected, hoveredNodeId)
    })

    ctx.restore()
  }, [
    canvasRef,
    canvasState.panX,
    canvasState.panY,
    canvasState.scale,
    canvasState.selectedNodeId,
    backgroundImage,
    tree.nodes,
    tree.connections,
    arrows,
    selectedArrowId,
    arrowDragState.isArrowDragging,
    arrowDragState.draggedEndpoint,
    hoveredNodeId,
    connectionDrawState,
  ])

  // redraw on pan/zoom
  useEffect(() => {
    draw()
  }, [draw])

  // background loader
  useEffect(() => {
    const background = BACKGROUNDS.find((bg) => bg.id === canvasState.backgroundId)
    if (!background?.src) {
      setBackgroundImage(null)
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = background.src
    img.onload = () => setBackgroundImage(img)
    img.onerror = () => {
      console.warn(`Failed to load background image: ${background.src}`)
      setBackgroundImage(null)
    }
  }, [canvasState.backgroundId])

  // resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = containerRef.current
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    draw()
  }, [draw, canvasRef])

  // keyboard + prevent browser zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return

      if (e.key === " " || e.code === "Space") {
        setIsSpacePressed(true)
        e.preventDefault()
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedArrowId) {
          deleteArrow(selectedArrowId)
          setSelectedArrowId(null)
          e.preventDefault()
        } else if (canvasState.selectedNodeId) {
          deleteNode(canvasState.selectedNodeId)
          selectNode(null)
          e.preventDefault()
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        setIsSpacePressed(false)
        setIsPanning(false)
        e.preventDefault()
      }
    }

    const preventBrowserZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    document.addEventListener("wheel", preventBrowserZoom, { passive: false })

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      document.removeEventListener("wheel", preventBrowserZoom)
    }
  }, [selectedArrowId, canvasState.selectedNodeId, deleteArrow, deleteNode, selectNode])

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    // ⚠️ React onWheel có thể passive ở vài env -> bạn đã chặn ở document wheel rồi
    if (!e.ctrlKey) return

    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(5, canvasState.scale * delta))

    const scaleDiff = newScale - canvasState.scale
    const newPanX =
      canvasState.panX - (mouseX - canvasState.panX) * (scaleDiff / canvasState.scale)
    const newPanY =
      canvasState.panY - (mouseY - canvasState.panY) * (scaleDiff / canvasState.scale)

    setCanvasState({ scale: newScale, panX: newPanX, panY: newPanY })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - canvasState.panX) / canvasState.scale
    const y = (e.clientY - rect.top - canvasState.panY) / canvasState.scale

    if (isSpacePressed || e.button === 2) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      return
    }

    mouseDownPosRef.current = { x, y }
    setIsDraggingStarted(false)

    // arrow hit test
    for (const arrow of arrows) {
      const isSelected = selectedArrowId === arrow.id

      if (isSelected && isPointNearEndpoint(x, y, arrow, "start", 10)) {
        setArrowDragState({
          isArrowDragging: true,
          draggedArrowId: arrow.id,
          draggedEndpoint: "start",
          offsetX: x - arrow.startX,
          offsetY: y - arrow.startY,
        })
        selectNode(null)
        return
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
        return
      }

      if (isPointNearArrow(x, y, arrow)) {
        setSelectedArrowId(arrow.id)
        setArrowDragState({
          isArrowDragging: false,
          draggedArrowId: arrow.id,
          draggedEndpoint: null,
          offsetX: x,
          offsetY: y,
        })
        selectNode(null)
        return
      }
    }

    // node hit test
    let clickedNode: FamilyNode | undefined
    for (const node of tree.nodes) {
      if (isPointInNode(x, y, node)) {
        clickedNode = node
        break
      }
    }

    if (clickedNode) {
      if (isPointNearNodeEdge(x, y, clickedNode)) {
        setConnectionDrawState({
          isDrawing: true,
          fromNodeId: clickedNode.id,
          currentX: x,
          currentY: y,
        })
        if (canvasState.selectedNodeId !== clickedNode.id) selectNode(clickedNode.id)
        setSelectedArrowId(null)
        return
      }

      if (canvasState.selectedNodeId !== clickedNode.id) selectNode(clickedNode.id)
      setSelectedArrowId(null)

      setDragState({
        isDragging: false,
        draggedNodeId: clickedNode.id,
        offsetX: x - clickedNode.x,
        offsetY: y - clickedNode.y,
      })
      return
    }

    setSelectedArrowId(null)
    selectNode(null)
    setIsPanning(true)
    setPanStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - canvasState.panX) / canvasState.scale
    const y = (e.clientY - rect.top - canvasState.panY) / canvasState.scale

    // ✅ PANNING (functional update để tránh stale state)
    if (isPanning) {
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y

      setCanvasState((prev) => ({
        panX: prev.panX + dx,
        panY: prev.panY + dy,
      }))

      setPanStart({ x: e.clientX, y: e.clientY })
      return
    }

    // start drag threshold
    const dragThreshold = 5
    const dx0 = Math.abs(x - mouseDownPosRef.current.x)
    const dy0 = Math.abs(y - mouseDownPosRef.current.y)

    if (!isDraggingStarted && (dx0 > dragThreshold || dy0 > dragThreshold)) {
      setIsDraggingStarted(true)

      if (dragState.draggedNodeId && !dragState.isDragging) {
        setDragState({ ...dragState, isDragging: true })
      }

      if (
        arrowDragState.draggedArrowId &&
        !arrowDragState.isArrowDragging &&
        arrowDragState.draggedEndpoint === null
      ) {
        setArrowDragState({ ...arrowDragState, isArrowDragging: true })
      }
    }

    if (connectionDrawState.isDrawing) {
      setConnectionDrawState({ currentX: x, currentY: y })
    }

    // arrow dragging
    if (arrowDragState.isArrowDragging && arrowDragState.draggedArrowId) {
      const arrow = arrows.find((a) => a.id === arrowDragState.draggedArrowId)
      if (!arrow) return

      if (arrowDragState.draggedEndpoint === "start") {
        const newStartX = x - arrowDragState.offsetX
        const newStartY = y - arrowDragState.offsetY

        const snapPoint = getNearestSnapPoint(newStartX, newStartY, tree.nodes)

        if (snapPoint) {
          updateArrow(arrow.id, {
            startX: snapPoint.x,
            startY: snapPoint.y,
            startNodeId: snapPoint.nodeId,
          })
          setHoveredNodeId(snapPoint.nodeId)
        } else {
          updateArrow(arrow.id, {
            startX: newStartX,
            startY: newStartY,
            startNodeId: undefined,
          })
          setHoveredNodeId(undefined)
        }
      } else if (arrowDragState.draggedEndpoint === "end") {
        const newEndX = x - arrowDragState.offsetX
        const newEndY = y - arrowDragState.offsetY

        const snapPoint = getNearestSnapPoint(newEndX, newEndY, tree.nodes)

        if (snapPoint) {
          updateArrow(arrow.id, {
            endX: snapPoint.x,
            endY: snapPoint.y,
            endNodeId: snapPoint.nodeId,
          })
          setHoveredNodeId(snapPoint.nodeId)
        } else {
          updateArrow(arrow.id, {
            endX: newEndX,
            endY: newEndY,
            endNodeId: undefined,
          })
          setHoveredNodeId(undefined)
        }
      } else {
        const dx = x - arrowDragState.offsetX
        const dy = y - arrowDragState.offsetY

        updateArrow(arrow.id, {
          startX: arrow.startX + dx,
          startY: arrow.startY + dy,
          endX: arrow.endX + dx,
          endY: arrow.endY + dy,
          startNodeId: undefined,
          endNodeId: undefined,
        })

        setArrowDragState({ ...arrowDragState, offsetX: x, offsetY: y })
      }
    }

    // hovered node (when not dragging arrow)
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

    // node dragging
    if (dragState.isDragging && dragState.draggedNodeId && isDraggingStarted) {
      updateNode(dragState.draggedNodeId, {
        x: x - dragState.offsetX,
        y: y - dragState.offsetY,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDraggingStarted(false)
    setIsPanning(false)

    setDragState({
      isDragging: false,
      draggedNodeId: null,
      offsetX: 0,
      offsetY: 0,
    })

    if (connectionDrawState.isDrawing && connectionDrawState.fromNodeId) {
      const startNode = tree.nodes.find((n) => n.id === connectionDrawState.fromNodeId)

      const endSnap = getNearestSnapPoint(
        connectionDrawState.currentX,
        connectionDrawState.currentY,
        tree.nodes
      )

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
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="absolute top-0 left-0"
        style={{ cursor: isPanning ? "grabbing" : isSpacePressed ? "grab" : "crosshair" }}
      />
    </div>
  )
}
