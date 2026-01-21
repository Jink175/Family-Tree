'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, X } from "lucide-react"
import { supabase } from "@/lib/supabase" // config Supabase client
import toast from "react-hot-toast"
import { Input } from "@/components/ui/input"

interface PreviewFile {
  file: File
  previewUrl: string
  uploading: boolean
  uploaded: boolean
  error?: string
}

export default function MemberImageUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [memberName, setMemberName] = useState("")
  const [files, setFiles] = useState<PreviewFile[]>([])
  const MAX_FILES = 10

  // 🔹 Chuẩn hoá tên: bỏ dấu, viết hoa, _
  const normalizeName = (name: string) =>
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .toUpperCase()

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList) return

    if (!memberName.trim()) {
      toast.error("Vui lòng nhập tên thành viên trước")
      return
    }

    const newFiles: PreviewFile[] = []

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i]
      if (!f.type.startsWith("image/")) continue

      newFiles.push({
        file: f,
        previewUrl: URL.createObjectURL(f),
        uploading: false,
        uploaded: false,
      })
    }

    if (files.length + newFiles.length > MAX_FILES) {
      toast.error(`Chỉ được tối đa ${MAX_FILES} ảnh`)
      return
    }

    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    const copy = [...files]
    copy.splice(index, 1)
    setFiles(copy)
  }

  const uploadAll = async () => {
    if (!memberName.trim()) {
      toast.error("Chưa nhập tên thành viên")
      return
    }

    const safeName = normalizeName(memberName)
    const copy = [...files]

    for (let i = 0; i < copy.length; i++) {
      if (copy[i].uploaded) continue

      copy[i].uploading = true
      setFiles([...copy])

      try {
        const ext = copy[i].file.name.split(".").pop() || "png"

        // 👉 TEN_THANH_VIEN-(1).png
        const fileName = `${safeName}-(${i + 1}).${ext}`

        // 👉 Folder = tên thành viên
        const filePath = `${safeName}/${safeName}-(${i + 1}).${ext}`

        const { error } = await supabase.storage
          .from("ai-images")
          .upload(filePath, copy[i].file, {
            upsert: true,
          })

        if (error) throw error

        copy[i].uploaded = true
        copy[i].uploading = false
        setFiles([...copy])
      } catch (err: any) {
        copy[i].uploading = false
        copy[i].error = err.message || "Upload failed"
        setFiles([...copy])
      }
    }

    toast.success("Upload xong ảnh cho thành viên")
  }

  return (
    <div className="flex-1 overflow-auto bg-background mt-30 rounded-2xl">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-center text-3xl font-bold mb-2">Manage Member</h1>
          <p className="text-center text-muted-foreground">Upload photos of family members for facial recognition.</p>
        </div>
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* 🔹 Nhập tên */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Member Name</label>
            <Input
              placeholder="Ví dụ: Nguyen Van A"
              value={memberName}
              onChange={e => setMemberName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              File will save as: <b>{normalizeName(memberName || "TEN")}- (1).png/jpg</b>
            </p>
          </div>

          {/* 🔹 Khu vực chọn ảnh */}
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              handleFileSelect(e.dataTransfer.files)
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleFileSelect(e.target.files)}
            />
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">
              Choose multiple photos for <b>{memberName || "member"}</b> (max 10)
            </p>
          </div>

          {/* 🔹 Preview */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map((f, idx) => (
                <div key={idx} className="relative border rounded overflow-hidden">
                  <img
                    src={f.previewUrl}
                    className="w-full h-32 object-cover"
                    alt="preview"
                  />

                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {f.uploading && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}

                  {f.uploaded && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white px-1 text-xs rounded">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <Button onClick={uploadAll} className="cursor-pointer" size="lg">
              Upload photos for {memberName || "thành viên"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
