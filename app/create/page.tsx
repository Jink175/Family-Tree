"use client"

import { TreeProvider } from "@/lib/tree-context"
import CreateContent from "./content"

export default function Home() {
  return (
    <TreeProvider>
      <CreateContent />
    </TreeProvider>
  )
}
