"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTree } from "@/lib/tree-context"

export function ImageUpload() {
  const { getSelectedNode, updateNode } = useTree()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedNode = getSelectedNode()

  if (!selectedNode) return null

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target?.result as string
      updateNode(selectedNode.id, { image: base64String })
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
          isDragging ? "border-primary bg-primary/10" : "border-border"
        }`}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />

        {selectedNode.image ? (
          <div className="space-y-2">
            <img
              src={selectedNode.image || "/placeholder.svg"}
              alt={selectedNode.name}
              className="w-20 h-20 rounded object-cover mx-auto"
            />
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="bg-transparent"
              >
                <Upload className="w-4 h-4" />
                Change
              </Button>
              <Button size="sm" variant="destructive" onClick={() => updateNode(selectedNode.id, { image: undefined })}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drag image here or click to select</p>
          </div>
        )}
      </div>
    </div>
  )
}
