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
): { x: number; y: number; point: "top" | "bottom" | "left" | "right" } {
  const centerX = nodeX + NODE_WIDTH / 2
  const centerY = nodeY + NODE_HEIGHT / 2

  const points = {
    top: { x: centerX, y: nodeY - 4 },
    bottom: { x: centerX, y: nodeY + NODE_HEIGHT + 4 },
    left: { x: nodeX - 4, y: centerY },
    right: { x: nodeX + NODE_WIDTH + 4, y: centerY },
  }

  let closest: "top" | "bottom" | "left" | "right" = "top"
  let minDist = Number.POSITIVE_INFINITY

  Object.entries(points).forEach(([key, point]) => {
    const dist = Math.hypot(mouseX - point.x, mouseY - point.y)
    if (dist < minDist) {
      minDist = dist
      closest = key as "top" | "bottom" | "left" | "right"
    }
  })

  return { ...points[closest], point: closest }
}

export const NODE_WIDTH_CONST = NODE_WIDTH
export const NODE_HEIGHT_CONST = NODE_HEIGHT
