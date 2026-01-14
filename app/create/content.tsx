"use client"

import { FamilyCanvas } from "./family-canvas"
import { Toolbar } from "./toolbar"
import { PropertiesPanel } from "./properties-panel"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useTree } from "@/lib/tree-context"

export default function CreateContent() {
  const params = useSearchParams()
  const treeId = params.get("id")
  const { loadTreeFromSupabase } = useTree()

  useEffect(() => {
    if (treeId) {
      loadTreeFromSupabase(treeId)
    }
  }, [treeId, loadTreeFromSupabase])

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
