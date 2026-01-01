"use client"

import type React from "react"

import type { FamilyNode } from "@/lib/types"

const NODE_WIDTH = 150
const NODE_HEIGHT = 80

interface FamilyNodeRendererProps {
  node: FamilyNode
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent, node: FamilyNode) => void
}

export function renderNodeOnCanvas(
  ctx: CanvasRenderingContext2D,
  node: FamilyNode,
  isSelected: boolean,
  hoveredId?: string,
) {
  const cornerRadius = 8
  const borderWidth = isSelected ? 3 : hoveredId === node.id ? 2 : 1

  // Draw node background
  const bgColor = isSelected ? "#dbeafe" : hoveredId === node.id ? "#f0f9ff" : "#f3f4f6"
  ctx.fillStyle = bgColor
  ctx.strokeStyle = isSelected ? "#0ea5e9" : hoveredId === node.id ? "#06b6d4" : "#d1d5db"
  ctx.lineWidth = borderWidth

  // Rounded rectangle
  ctx.beginPath()
  ctx.moveTo(node.x + cornerRadius, node.y)
  ctx.lineTo(node.x + NODE_WIDTH - cornerRadius, node.y)
  ctx.quadraticCurveTo(node.x + NODE_WIDTH, node.y, node.x + NODE_WIDTH, node.y + cornerRadius)
  ctx.lineTo(node.x + NODE_WIDTH, node.y + NODE_HEIGHT - cornerRadius)
  ctx.quadraticCurveTo(
    node.x + NODE_WIDTH,
    node.y + NODE_HEIGHT,
    node.x + NODE_WIDTH - cornerRadius,
    node.y + NODE_HEIGHT,
  )
  ctx.lineTo(node.x + cornerRadius, node.y + NODE_HEIGHT)
  ctx.quadraticCurveTo(node.x, node.y + NODE_HEIGHT, node.x, node.y + NODE_HEIGHT - cornerRadius)
  ctx.lineTo(node.x, node.y + cornerRadius)
  ctx.quadraticCurveTo(node.x, node.y, node.x + cornerRadius, node.y)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Draw image if exists, otherwise avatar with initials
  if (node.image) {
    // Draw image as avatar
    const img = new Image()
    img.onload = () => {
      ctx.save()
      ctx.beginPath()
      ctx.arc(node.x + 20, node.y + 20, 16, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, node.x + 4, node.y + 4, 32, 32)
      ctx.restore()
    }
    img.src = node.image
  } else {
    // Draw avatar background
    ctx.fillStyle = "#e0e7ff"
    ctx.beginPath()
    ctx.arc(node.x + 20, node.y + 20, 16, 0, Math.PI * 2)
    ctx.fill()

    // Draw initials
    const initials = node.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    ctx.fillStyle = "#4f46e5"
    ctx.font = "bold 12px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(initials, node.x + 20, node.y + 20)
  }

  // Draw name
  ctx.fillStyle = "#1f2937"
  ctx.font = "bold 11px sans-serif"
  ctx.textAlign = "left"
  ctx.textBaseline = "top"

  // Truncate long names
  let displayName = node.name
  if (displayName.length > 14) {
    displayName = displayName.substring(0, 11) + "..."
  }
  ctx.fillText(displayName, node.x + 42, node.y + 10)

  // Draw years info
  if (node.birthYear || node.deathYear) {
    ctx.font = "9px sans-serif"
    ctx.fillStyle = "#6b7280"
    const yearText = node.birthYear
      ? `${node.birthYear}${node.deathYear ? "-" + node.deathYear : ""}`
      : node.deathYear
        ? `† ${node.deathYear}`
        : ""
    if (yearText) {
      ctx.fillText(yearText, node.x + 42, node.y + 27)
    }
  }

  // Draw relationship indicator
  const relationshipColor: Record<string, string> = {
    parent: "#ef4444",
    child: "#3b82f6",
    spouse: "#f59e0b",
    sibling: "#8b5cf6",
  }
  ctx.fillStyle = relationshipColor[node.relationship] || "#6b7280"
  ctx.beginPath()
  ctx.arc(node.x + NODE_WIDTH - 12, node.y + 12, 4, 0, Math.PI * 2)
  ctx.fill()

  // Draw notes indicator if notes exist
  if (node.notes.trim()) {
    ctx.fillStyle = "#10b981"
    ctx.font = "bold 10px sans-serif"
    ctx.fillText("✓", node.x + NODE_WIDTH - 18, node.y + NODE_HEIGHT - 12)
  }
}

export function isPointInNode(x: number, y: number, node: FamilyNode): boolean {
  return x >= node.x && x <= node.x + NODE_WIDTH && y >= node.y && y <= node.y + NODE_HEIGHT
}

export function getClosestConnectionPoint(
  nodeX: number,
  nodeY: number,
  mouseX: number,
  mouseY: number,
): { x: number; y: number } {
  const left = nodeX
  const right = nodeX + NODE_WIDTH
  const top = nodeY
  const bottom = nodeY + NODE_HEIGHT

  // Clamp mouse position to rectangle bounds
  const clampedX = Math.max(left, Math.min(mouseX, right))
  const clampedY = Math.max(top, Math.min(mouseY, bottom))

  // Distances to each edge
  const distLeft = Math.abs(clampedX - left)
  const distRight = Math.abs(clampedX - right)
  const distTop = Math.abs(clampedY - top)
  const distBottom = Math.abs(clampedY - bottom)

  const minDist = Math.min(distLeft, distRight, distTop, distBottom)

  if (minDist === distLeft) return { x: left, y: clampedY }
  if (minDist === distRight) return { x: right, y: clampedY }
  if (minDist === distTop) return { x: clampedX, y: top }

  return { x: clampedX, y: bottom }
}

export function isPointNearNodeEdge(
  x: number,
  y: number,
  node: FamilyNode,
  threshold = 8,
): boolean {
  const left = node.x
  const right = node.x + NODE_WIDTH
  const top = node.y
  const bottom = node.y + NODE_HEIGHT

  const inside =
    x >= left && x <= right &&
    y >= top && y <= bottom

  if (!inside) return false

  return (
    Math.abs(x - left) <= threshold ||
    Math.abs(x - right) <= threshold ||
    Math.abs(y - top) <= threshold ||
    Math.abs(y - bottom) <= threshold
  )
}

export const NODE_WIDTH_CONST = NODE_WIDTH
export const NODE_HEIGHT_CONST = NODE_HEIGHT

export function getSnapPoints(node: FamilyNode) {
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

export function renderSnapPoints(ctx: CanvasRenderingContext2D, node: FamilyNode) {
  const points = getSnapPoints(node)
  ctx.fillStyle = "#3b82f6" // màu điểm snap
  points.forEach(p => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
    ctx.fill()
  })
}
