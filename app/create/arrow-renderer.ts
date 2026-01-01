import type { Arrow, FamilyNode } from "@/lib/types"

const ENDPOINT_RADIUS = 6
const SNAP_DISTANCE = 50

export function drawArrow(ctx: CanvasRenderingContext2D, arrow: Arrow, isSelected: boolean, nodes: FamilyNode[]) {
  // Check if endpoints should snap to nodes
  let startX = arrow.startX
  let startY = arrow.startY
  let endX = arrow.endX
  let endY = arrow.endY

  if (arrow.startNodeId) {
    const startNode = nodes.find((n) => n.id === arrow.startNodeId)
    if (startNode) {
      const { x, y } = getClosestEdgePoint(
        arrow.startX,
        arrow.startY,
        startNode.x,
        startNode.y,
        startNode.width,
        startNode.height,
      )
      startX = x
      startY = y
    }
  } else {
    // Find closest node within snap distance
    for (const node of nodes) {
      const { x: centerX, y: centerY } = getNodeBounds(node)
      const dist = Math.hypot(arrow.startX - centerX, arrow.startY - centerY)
      if (dist < SNAP_DISTANCE) {
        const { x, y } = getClosestEdgePoint(arrow.startX, arrow.startY, node.x, node.y, node.width, node.height)
        startX = x
        startY = y
        break
      }
    }
  }

  // Snap end point to node if near
  if (arrow.endNodeId) {
    const endNode = nodes.find((n) => n.id === arrow.endNodeId)
    if (endNode) {
      const { x, y } = getClosestEdgePoint(arrow.endX, arrow.endY, endNode.x, endNode.y, endNode.width, endNode.height)
      endX = x
      endY = y
    }
  } else {
    // Find closest node within snap distance
    for (const node of nodes) {
      const { x: centerX, y: centerY } = getNodeBounds(node)
      const dist = Math.hypot(arrow.endX - centerX, arrow.endY - centerY)
      if (dist < SNAP_DISTANCE) {
        const { x, y } = getClosestEdgePoint(arrow.endX, arrow.endY, node.x, node.y, node.width, node.height)
        endX = x
        endY = y
        break
      }
    }
  }

  // Draw line
  ctx.strokeStyle = arrow.color || "#64748b"
  ctx.lineWidth = 2

  if (arrow.type === "dashed") {
    ctx.setLineDash([5, 5])
  } else if (arrow.type === "dotted") {
    ctx.setLineDash([2, 2])
  }

  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  ctx.stroke()
  ctx.setLineDash([])

  // Draw arrowhead
  // const angle = Math.atan2(endY - startY, endX - startX)
  // const arrowSize = 10

  // ctx.fillStyle = arrow.color || "#64748b"
  // ctx.beginPath()
  // ctx.moveTo(endX, endY)
  // ctx.lineTo(endX - arrowSize * Math.cos(angle - Math.PI / 6), endY - arrowSize * Math.sin(angle - Math.PI / 6))
  // ctx.lineTo(endX - arrowSize * Math.cos(angle + Math.PI / 6), endY - arrowSize * Math.sin(angle + Math.PI / 6))
  // ctx.closePath()
  // ctx.fill()

  // Draw endpoints
  if (isSelected) {
    // Start point
    ctx.fillStyle = "#3b82f6"
    ctx.beginPath()
    ctx.arc(startX, startY, ENDPOINT_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    // End point
    ctx.fillStyle = "#ef4444"
    ctx.beginPath()
    ctx.arc(endX, endY, ENDPOINT_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    // Draw selection highlight
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.strokeRect(
      Math.min(startX, endX) - 10,
      Math.min(startY, endY) - 10,
      Math.abs(endX - startX) + 20,
      Math.abs(endY - startY) + 20,
    )
    ctx.setLineDash([])
  }
}

function getClosestEdgePoint(
  pointX: number,
  pointY: number,
  nodeX: number,
  nodeY: number,
  nodeWidth: number,
  nodeHeight: number,
): { x: number; y: number } {
  const nodeRight = nodeX + nodeWidth
  const nodeBottom = nodeY + nodeHeight

  // Check which edge the point is closest to
  const dx = Math.max(nodeX - pointX, 0, pointX - nodeRight)
  const dy = Math.max(nodeY - pointY, 0, pointY - nodeBottom)

  // If inside rectangle bounds, find closest edge
  const isInside = dx === 0 && dy === 0

  if (isInside) {
    // Point is inside - find which edge is closest
    const distToLeft = pointX - nodeX
    const distToRight = nodeRight - pointX
    const distToTop = pointY - nodeY
    const distToBottom = nodeBottom - pointY

    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom)

    if (minDist === distToLeft) {
      return { x: nodeX, y: Math.max(nodeY, Math.min(pointY, nodeBottom)) }
    } else if (minDist === distToRight) {
      return { x: nodeRight, y: Math.max(nodeY, Math.min(pointY, nodeBottom)) }
    } else if (minDist === distToTop) {
      return { x: Math.max(nodeX, Math.min(pointX, nodeRight)), y: nodeY }
    } else {
      return { x: Math.max(nodeX, Math.min(pointX, nodeRight)), y: nodeBottom }
    }
  }

  // Point is outside - clamp to edges
  const clampedX = Math.max(nodeX, Math.min(pointX, nodeRight))
  const clampedY = Math.max(nodeY, Math.min(pointY, nodeBottom))

  return { x: clampedX, y: clampedY }
}

function getNodeBounds(node: FamilyNode): { x: number; y: number } {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  }
}

export function isPointNearArrow(x: number, y: number, arrow: Arrow, distance = 8): boolean {
  // Check distance to line segment
  const dx = arrow.endX - arrow.startX
  const dy = arrow.endY - arrow.startY
  const len2 = dx * dx + dy * dy

  if (len2 === 0) {
    return Math.hypot(x - arrow.startX, y - arrow.startY) <= distance
  }

  let t = ((x - arrow.startX) * dx + (y - arrow.startY) * dy) / len2
  t = Math.max(0, Math.min(1, t))

  const projX = arrow.startX + t * dx
  const projY = arrow.startY + t * dy

  return Math.hypot(x - projX, y - projY) <= distance
}

export function isPointNearEndpoint(
  x: number,
  y: number,
  arrow: Arrow,
  endpoint: "start" | "end",
  distance = 10,
): boolean {
  const pointX = endpoint === "start" ? arrow.startX : arrow.endX
  const pointY = endpoint === "start" ? arrow.startY : arrow.endY
  return Math.hypot(x - pointX, y - pointY) <= distance
}

export function getClosestNode(x: number, y: number, nodes: FamilyNode[], distance = 50): FamilyNode | undefined {
  let closest: FamilyNode | undefined
  let minDist = distance

  for (const node of nodes) {
    const centerX = node.x + node.width / 2
    const centerY = node.y + node.height / 2
    const dist = Math.hypot(x - centerX, y - centerY)

    if (dist < minDist) {
      minDist = dist
      closest = node
    }
  }

  return closest
}
