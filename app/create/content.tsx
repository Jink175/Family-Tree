"use client"

import { FamilyCanvas } from "./family-canvas"
import { Toolbar } from "./toolbar"
import { PropertiesPanel } from "./properties-panel"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useTree } from "@/lib/tree-context"

export default function CreateContent() {
  const searchParams = useSearchParams()
  const treeId = searchParams.get("id") // null nếu tạo mới
  const { loadTreeFromSupabase, setTreeData, setCanvasState } = useTree()

  useEffect(() => {
    if (treeId) {
      loadTreeFromSupabase(treeId)
      return
    }

    // Nếu không có id => reset về diagram mới (không cần resetTree)
    setTreeData({
      id: undefined,
      nodes: [],
      connections: [],
      created_at: new Date(),
      updated_at: new Date(),
    })

    setCanvasState({
      selectedNodeId: null,
      panX: 0,
      panY: 0,
      scale: 1,
      diagramName: "Untitled Diagram",
      backgroundId: null,
    })
  }, [treeId, loadTreeFromSupabase, setTreeData, setCanvasState])

  return (
    <div className="flex h-screen flex-col mt-30">
      <Toolbar />
      <div className="flex flex-1 gap-0 overflow-hidden">
        <div className="flex-1">
          <FamilyCanvas />
        </div>
        <div className="w-80 border-l border-border bg-card">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  )
}
