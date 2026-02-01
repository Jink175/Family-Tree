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
const avatarCache = new Map<string, HTMLImageElement>()

function getAvatarImage(url: string) {
  if (!url) return null

  let img = avatarCache.get(url)
  if (!img) {
    img = new Image()
    img.crossOrigin = "anonymous" // nếu ảnh từ supabase/public
    img.src = url
    avatarCache.set(url, img)
  }
  return img
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

  const centerX = node.x + NODE_WIDTH / 2
  const avatarRadius = 18
  const avatarY = node.y + 22

  if (node.image) {
    const img = getAvatarImage(node.image)

    // Chỉ draw khi ảnh đã load xong
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, avatarY, avatarRadius, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(
        img,
        centerX - avatarRadius,
        avatarY - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      )
      ctx.restore()
    } else {
    // fallback trong lúc ảnh chưa load xong (vẽ placeholder)
    ctx.fillStyle = "#e0e7ff"
    ctx.beginPath()
    ctx.arc(centerX, avatarY, avatarRadius, 0, Math.PI * 2)
    ctx.fill()
    }
  } else {
    ctx.fillStyle = "#e0e7ff"
    ctx.beginPath()
    ctx.arc(centerX, avatarY, avatarRadius, 0, Math.PI * 2)
    ctx.fill()

    const initials = node.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()

    ctx.fillStyle = "#4f46e5"
    ctx.font = "bold 12px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(initials, centerX, avatarY)
  }

  // ===== Name =====
  ctx.fillStyle = "#1f2937"
  ctx.font = "bold 12px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "top"

  let displayName = node.name
  if (displayName.length > 16) {
    displayName = displayName.substring(0, 13) + "..."
  }

  ctx.fillText(
    displayName,
    centerX,
    avatarY + avatarRadius + 8
  )

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
