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
    tree,
    setTreeData,
    addArrow,
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
  const [arrowType, setArrowType] = useState<"solid" | "dashed" | "dotted">("solid")
  const selectedNode = getSelectedNode()

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

  const handleLoadTree = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const loaded = JSON.parse(event.target?.result as string)

          // Hỗ trợ cả file cũ (chỉ có tree) và file mới (có tree + canvasState)
          const loadedTree = loaded.tree ?? loaded
          setTreeData(loadedTree)

          if (loaded.canvasState) {
            setCanvasState({
              diagramName: loaded.canvasState.diagramName ?? loadedTree.name ?? "",
              backgroundId: loaded.canvasState.backgroundId ?? null,
              scale: loaded.canvasState.scale ?? 1,
              panX: loaded.canvasState.panX ?? 0,
              panY: loaded.canvasState.panY ?? 0,
            })
          } else {
            // file cũ không có canvasState
            setCanvasState({
              diagramName: loadedTree.name ?? "",
            })
          }

          if (loaded.arrows) {
            // nếu context bạn có setter arrows, ví dụ setArrows(...)
            // setArrows(loaded.arrows)
          }

          toast.success("Đã load sơ đồ")
        } catch (err) {
          toast.error("File không hợp lệ")
        }
      }

      reader.readAsText(file)
    }

    input.click()
  }

  
  const handleSaveDiagram = async () => {
    const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !authUser) return toast.error("Bạn chưa đăng nhập")

    const diagramName = canvasState.diagramName?.trim()
    if (!diagramName) return toast.error("Tên sơ đồ không được để trống")

    let thumbnail: string | null = null
    if (canvasRef.current) thumbnail = generateThumbnail(canvasRef.current)

    const payloadBase = {
      name: diagramName,
      nodes: tree.nodes,
      connections: tree.connections,
      arrows,
      background_id: canvasState.backgroundId,
      thumbnail,
    }

    let diagramId = tree.id as string | undefined
    let wasCreated = false

    // 1) INSERT nếu chưa có id
    if (!diagramId) {
      const { data: inserted, error: insertErr } = await supabase
        .from("family_trees")
        .insert({ user_id: authUser.id, ...payloadBase })
        .select("id, created_at, updated_at")
        .single()

      if (insertErr || !inserted) {
        console.error(insertErr)
        return toast.error(insertErr?.message || "Lưu sơ đồ thất bại")
      }

      diagramId = inserted.id
      wasCreated = true

      setTreeData({
        ...tree,
        id: diagramId,
        created_at: new Date(inserted.created_at),
        updated_at: new Date(inserted.updated_at),
      })

      toast.success("Đã lưu sơ đồ mới")
    }

    // 2) Upload pending images (nếu có)
    for (const node of tree.nodes) {
      const file = (node as any)._pendingImage
      if (!file) continue

      const ext = file.name.split(".").pop() || "png"
      const filePath = `${authUser.id}/${diagramId}/${node.id}.${ext}`

      const { error: upErr } = await supabase.storage
        .from("node-avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type })

      if (upErr) {
        console.error(upErr)
        return toast.error(`Upload failed for ${node.name}`)
      }

      const { data: urlData } = supabase.storage.from("node-avatars").getPublicUrl(filePath)
      node.image = urlData.publicUrl
      delete (node as any)._pendingImage
    }

    // 3) UPDATE lại để lưu image URLs / thumbnail / background...
    const { error: updateErr } = await supabase
      .from("family_trees")
      .update({ ...payloadBase, nodes: tree.nodes })
      .eq("id", diagramId)

    if (updateErr) {
      console.error(updateErr)
      return toast.error(updateErr.message || "Cập nhật thất bại")
    }

    setTreeData({ ...tree, id: diagramId, updated_at: new Date() })

    // ✅ chỉ toast "cập nhật" khi đây là diagram đã tồn tại từ trước
    if (!wasCreated) toast.success("Đã cập nhật sơ đồ")
  }





  const handleExportJSON = () => {
    const payload = {
      version: 1,
      tree,
      canvasState: {
        diagramName: canvasState.diagramName,
        backgroundId: canvasState.backgroundId,
        // nếu bạn cần thêm: scale, offsetX, offsetY... thì add vào đây
        scale: canvasState.scale,
        panX: canvasState.panX,
        panY: canvasState.panY,
      },
      arrows,
    }

    const dataStr = JSON.stringify(payload, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${canvasState.diagramName || "family-tree"}.json`
    link.click()
    URL.revokeObjectURL(url)
  }


  const handleExportPNG = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      toast.error("Canvas not found")
      return
    }

    const dataURL = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = dataURL
    link.download = `${canvasState.diagramName || "family-tree"}.png`
    link.click()
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