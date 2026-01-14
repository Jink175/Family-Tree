"use client"

import { useState } from "react"
import { Plus, Minus, Download, Upload, ArrowRight, Layers, ImageIcon, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTree } from "@/lib/tree-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveTree } from "@/lib/storage"
import { TEMPLATES } from "@/lib/templates"
import { BACKGROUNDS } from "@/lib/backgrounds"
import { useUser } from "@/lib/user-context"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import generateThumbnail from "@/lib/canvas-utils"

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
    setCanvasState,
    zoomIn, 
    zoomOut,
    setZoom,
    canvasRef,
  } = useTree()
  
  const { user, updateUser } = useUser()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isConnectOpen, setIsConnectOpen] = useState(false)
  const [isDrawArrowOpen, setIsDrawArrowOpen] = useState(false)
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false)
  const [name, setName] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [targetNodeId, setTargetNodeId] = useState("")
  const [connectionType, setConnectionType] = useState<"parent-child" | "spouse" | "sibling">("parent-child")
  const [arrowLabel, setArrowLabel] = useState("")
  const [arrowType, setArrowType] = useState<"solid" | "dashed" | "dotted">("solid")
  const selectedNode = getSelectedNode()
  const selectedArrow = arrows.find((a) => canvasState.selectedNodeId === a.id) // Using selectedNodeId temporarily to track selected arrow
  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [saveDiagramName, setSaveDiagramName] = useState(canvasState.diagramName)

  const handleChangeBackground = (backgroundId: string) => {
    setCanvasState({ backgroundId })
    setIsBackgroundOpen(false)
  }

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
  const id = addArrow({
    startX: 150,
    startY: 150,
    endX: 300,
    endY: 150,
    type: arrowType,
    color: "#64748b",
  })

  // ✅ SELECT ĐÚNG ARROW VỪA TẠO
  requestAnimationFrame(() => {
    window.dispatchEvent(
      new CustomEvent("select-arrow", { detail: id })
    )
  })

  setIsDrawArrowOpen(false)
}
  const handleLoadTemplate = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      const newTree = {
        name: template.name,
        nodes: template.tree.nodes,
        connections: template.tree.connections,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setTreeData(newTree)
      setIsTemplateOpen(false)
    }
  }


  const getOtherNodes = () => {
    if (!selectedNode) return []
    return tree.nodes.filter((node) => node.id !== selectedNode.id)
  }

  const handleSaveTree = () => {
    const fileName = prompt("Enter a name for this family tree:", canvasState.diagramName) || canvasState.diagramName
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
  
  const handleSaveDiagram = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Bạn chưa đăng nhập")
      return
    }

    if (!canvasState.diagramName.trim()) {
      toast.error("Tên sơ đồ không được để trống")
      return
    }

    let thumbnail: string | null = null
    if (canvasRef.current) {
      thumbnail = generateThumbnail(canvasRef.current)
    }

    const payload = {
      name: canvasState.diagramName,
      nodes: tree.nodes,
      connections: tree.connections,
      arrows,
      background_id: canvasState.backgroundId,
      thumbnail,
    }

    try {
      if (tree.id) {
        await supabase
          .from("family_trees")
          .update(payload)
          .eq("id", tree.id)
          .eq("user_id", user.id)

        toast.success("Đã cập nhật sơ đồ")
      } else {
        const { data } = await supabase
          .from("family_trees")
          .insert({ user_id: user.id, ...payload })
          .select()
          .single()

        setTreeData({
          ...tree,
          id: data.id,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
        })

        toast.success("Đã lưu sơ đồ mới")
      }
    } catch (err) {
      console.error(err)
      toast.error("Lưu sơ đồ thất bại")
    }
  }



  const handleExportJSON = () => {
    const dataStr = JSON.stringify(tree, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${canvasState.diagramName || "family-tree"}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPNG = () => {
    const canvas = document.getElementById("family-canvas") as HTMLCanvasElement
    if (!canvas) {
      alert("Canvas not found")
      return
    }

    const dataURL = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = dataURL
    link.download = `${canvasState.diagramName || "family-tree"}.png`
    link.click()
  }

  const handleDiagramNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setCanvasState({ diagramName: newName })
  }

  return (
    <div className="flex gap-2 p-4 bg-card border-b border-border flex-wrap items-center">
      <div className="flex items-center gap-2">
        <Input
          value={canvasState.diagramName}
          onChange={(e) =>
            setCanvasState({ diagramName: e.target.value })
          }
        />
      </div>
      <Dialog open={isBackgroundOpen} onOpenChange={setIsBackgroundOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 bg-[#A2E8BC] cursor-pointer">
            <ImageIcon className="w-4 h-4" />
            Background
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">Choose Background</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => handleChangeBackground(bg.id)}
                className={`relative rounded-lg cursor-pointer overflow-hidden border-2 transition-all hover:border-primary ${
                  canvasState.backgroundId === bg.id ? "border-primary" : "border-border"
                }`}
              >
                <img src={bg.src || "/placeholder.svg"} alt={bg.name} className="w-full h-24 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs text-center px-1">{bg.name}</span>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 bg-[#A2E8BC] cursor-pointer">
            <Layers className="w-4 h-4" />
            Templates
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">Choose a Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleLoadTemplate(template.id)}
                className="p-4 text-left border cursor-pointer border-border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="text-2xl mb-2">{template.icon}</div>
                <h3 className="font-semibold text-sm">{template.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 cursor-pointer bg-[#A2E8BC]">
            <Plus className="w-4 h-4" />
            Add Person
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Add New Person</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
            </div>
            <div>
              <Label className="mb-2" htmlFor="birth">Birth Year (optional)</Label>
              <Input
                id="birth"
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="e.g., 1980"
              />
            </div>
            <Button onClick={handleAddNode} className="w-full cursor-pointer">
              Add Person
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button 
        variant="outline" 
        className="gap-2 cursor-pointer bg-[#A2E8BC]"
        onClick={handleDrawArrow}
      >
        <ArrowRight className="w-4 h-4" />
        Draw Connect
      </Button>

      <div className="ml-auto flex gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#A2E8BC]">
          <button 
            onClick={zoomOut} 
            className="p-1.5 hover:bg-background  cursor-pointer rounded transition-colors"
            title="Zoom out (Ctrl + Scroll)"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="min-w-15 text-sm font-medium hover:bg-background  cursor-pointer px-2 py-1 rounded transition-colors"
            title="Reset zoom (Click to reset to 100%)"
          >
            {Math.round(canvasState.scale * 100)}%
          </button>
          <button 
            onClick={zoomIn} 
            className="p-1.5 hover:bg-background  cursor-pointer rounded transition-colors"
            title="Zoom in (Ctrl + Scroll)"
          >
            <Plus size={16} />
          </button>
        </div>
        <Button
          variant="outline"
          className="gap-2 bg-[#A2E8BC] cursor-pointer"
          onClick={handleSaveDiagram}
        >
          <Save className="w-4 h-4" />
          Save
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 bg-[#A2E8BC] cursor-pointer">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">Export Family Tree</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <Button onClick={handleExportJSON} className="w-full cursor-pointer">
                JSON
              </Button>

              <Button onClick={handleExportPNG} className="w-full cursor-pointer">
                PNG Image
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={handleLoadTree} className="gap-2 bg-[#A2E8BC] cursor-pointer">
          <Upload className="w-4 h-4" />
          Load
        </Button>
      </div>
    </div>
  )
}