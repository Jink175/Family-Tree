"use client"

import type React from "react"
import { useState } from "react"
import { useUser } from "@/lib/user-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, Upload, Plus } from "lucide-react"

export default function FamilyMembersPage() {
  const { user, updateUser } = useUser()
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    age: "",
    image: "",
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const familyMembers = user?.familyMembers || []

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64String = event.target?.result as string
        setFormData((prev) => ({ ...prev, image: base64String }))
        setPreviewImage(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddMember = async () => {
    if (!formData.name || !formData.relationship || !formData.image) {
      alert("Vui lòng điền đầy đủ thông tin và chọn ảnh")
      return
    }

    setIsUploading(true)

    try {
      const newMember = {
        id: `member-${Date.now()}`,
        name: formData.name,
        relationship: formData.relationship,
        age: formData.age ? parseInt(formData.age) : undefined,
        image: formData.image,
        createdAt: new Date().toISOString(),
      }

      const updatedMembers = [...familyMembers, newMember]
      updateUser({
        familyMembers: updatedMembers,
      })

      // Reset form
      setFormData({ name: "", relationship: "", age: "", image: "" })
      setPreviewImage(null)
      alert("Thêm thành viên gia đình thành công!")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteMember = (memberId: string) => {
    const updatedMembers = familyMembers.filter((m) => m.id !== memberId)
    updateUser({
      familyMembers: updatedMembers,
    })
  }

  return (
    <div className="flex-1 overflow-auto bg-background mt-30 rounded-2xl">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Thành viên Gia đình</h1>
          <p className="text-muted-foreground">Tải ảnh các thành viên trong gia đình để nhận diện khuôn mặt</p>
        </div>

        {/* Upload Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Thêm Thành viên Mới</h2>
          <div className="grid gap-6">      

            {/* Image Upload */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {previewImage ? (
                  <div className="space-y-4">
                    <img
                      src={previewImage || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("imageInput")?.click()}>
                      Chọn ảnh khác
                    </Button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer"
                    onClick={() => document.getElementById("imageInput")?.click()}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Kéo thả ảnh tại đây</p>
                    <p className="text-xs text-muted-foreground">hoặc click để chọn</p>
                  </div>
                )}
              </div>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>
        </Card>

        {/* Family Members List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Danh Sách Thành viên ({familyMembers.length})</h2>
          {familyMembers.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Chưa có thành viên nào. Hãy thêm thành viên gia đình của bạn!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.relationship}</p>
                    {member.age && <p className="text-sm text-muted-foreground">Tuổi: {member.age}</p>}
                    <p className="text-xs text-muted-foreground">
                      {new Date(member.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMember(member.id)}
                      className="w-full gap-2 mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
