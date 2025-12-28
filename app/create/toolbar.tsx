"use client"

import { useState } from "react"
import { Plus, Trash2, LinkIcon, Download, Upload, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTree } from "@/lib/tree-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveTree } from "@/lib/storage"

export function Toolbar() {
  const {
    addNode,
    deleteNode,
    getSelectedNode,
    canvasState,
    addConnection,
    deleteConnection,
    tree,
    setTreeData,
    addArrow,
    deleteArrow,
    arrows,
  } = useTree()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isConnectOpen, setIsConnectOpen] = useState(false)
  const [isDrawArrowOpen, setIsDrawArrowOpen] = useState(false)
  const [name, setName] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [targetNodeId, setTargetNodeId] = useState("")
  const [connectionType, setConnectionType] = useState<"parent-child" | "spouse" | "sibling">("parent-child")
  const [arrowLabel, setArrowLabel] = useState("")
  const [arrowType, setArrowType] = useState<"solid" | "dashed" | "dotted">("solid")

  const selectedNode = getSelectedNode()
  const selectedArrow = arrows.find((a) => canvasState.selectedNodeId === a.id) // Using selectedNodeId temporarily to track selected arrow

  const handleAddNode = () => {
    if (name.trim()) {
      addNode({
        name,
        relationship: "parent",
        x: 100,
        y: 100,
        width: 150,
        height: 80,
        notes: "",
        birthYear: birthYear ? Number.parseInt(birthYear) : undefined,
      })
      setName("")
      setBirthYear("")
      setIsAddOpen(false)
    }
  }

  const handleDeleteSelected = () => {
    if (canvasState.selectedNodeId) {
      deleteNode(canvasState.selectedNodeId)
    }
  }

  const handleCreateConnection = () => {
    if (selectedNode && targetNodeId) {
      addConnection({
        sourceId: selectedNode.id,
        targetId: targetNodeId,
        type: connectionType,
      })
      setTargetNodeId("")
      setIsConnectOpen(false)
    }
  }

  const handleDrawArrow = () => {
    if (arrowLabel.trim()) {
      addArrow({
        startX: 100,
        startY: 100,
        endX: 300,
        endY: 300,
        type: arrowType,
        color: "#64748b",
        label: arrowLabel,
      })
      setArrowLabel("")
      setArrowType("solid")
      setIsDrawArrowOpen(false)
    }
  }

  const getOtherNodes = () => {
    if (!selectedNode) return []
    return tree.nodes.filter((node) => node.id !== selectedNode.id)
  }

  const handleSaveTree = () => {
    const fileName = prompt("Enter a name for this family tree:", tree.name) || tree.name
    saveTree({
      ...tree,
      name: fileName,
    })
    alert("Family tree saved successfully!")
  }

  const handleLoadTree = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const loadedTree = JSON.parse(event.target?.result as string)
            setTreeData(loadedTree)
            alert("Family tree loaded successfully!")
          } catch (error) {
            alert("Error loading file. Make sure it's a valid family tree file.")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(tree, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${tree.name || "family-tree"}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-2 p-4 bg-card border-b border-border flex-wrap items-center">
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Person
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Person</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
            </div>
            <div>
              <Label htmlFor="birth">Birth Year (optional)</Label>
              <Input
                id="birth"
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="e.g., 1980"
              />
            </div>
            <Button onClick={handleAddNode} className="w-full">
              Add Person
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDrawArrowOpen} onOpenChange={setIsDrawArrowOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <ArrowRight className="w-4 h-4" />
            Draw Arrow
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Arrow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="arrow-label">Label (optional)</Label>
              <Input
                id="arrow-label"
                value={arrowLabel}
                onChange={(e) => setArrowLabel(e.target.value)}
                placeholder="Enter arrow label"
              />
            </div>

            <div>
              <Label htmlFor="arrow-type">Line Style</Label>
              <Select value={arrowType} onValueChange={(value) => setArrowType(value as any)}>
                <SelectTrigger id="arrow-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleDrawArrow} className="w-full">
              Create Arrow
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant="outline"
        onClick={handleDeleteSelected}
        disabled={!canvasState.selectedNodeId}
        className="gap-2 bg-transparent"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </Button>

      <Dialog open={isConnectOpen} onOpenChange={setIsConnectOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={!selectedNode} className="gap-2 bg-transparent">
            <LinkIcon className="w-4 h-4" />
            Connect
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Connection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>From: {selectedNode?.name}</Label>
            </div>

            <div>
              <Label htmlFor="target">To:</Label>
              <Select value={targetNodeId} onValueChange={setTargetNodeId}>
                <SelectTrigger id="target">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {getOtherNodes().map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Relationship Type:</Label>
              <Select value={connectionType} onValueChange={(value) => setConnectionType(value as any)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent-child">Parent → Child</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleCreateConnection} className="w-full">
              Create Connection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="ml-auto flex gap-2">
        <Button variant="outline" onClick={handleExportJSON} className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export
        </Button>

        <Button variant="outline" onClick={handleLoadTree} className="gap-2 bg-transparent">
          <Upload className="w-4 h-4" />
          Load
        </Button>
      </div>
    </div>
  )
}
