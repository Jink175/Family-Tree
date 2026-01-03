"use client"

import { TreeProvider } from "@/lib/tree-context"
import { FamilyCanvas } from "./family-canvas"
import { Toolbar } from "./toolbar"
import { PropertiesPanel } from "./properties-panel"

export default function Home() {
  return (
    <TreeProvider>
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
    </TreeProvider>
  )
}
