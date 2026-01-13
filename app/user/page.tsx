"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import { useUser } from "@/lib/user-context"
import { useTree } from "@/lib/tree-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, Save, Trash2, FolderOpen } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, updateUser } = useUser()
  const { setTreeData } = useTree()
  const router = useRouter()
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null)
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null)
  const [diagrams, setDiagrams] = useState<any[]>([])
  const [loadingDiagrams, setLoadingDiagrams] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    const fetchDiagrams = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from("family_trees")
        .select("id, name, updated_at, thumbnail")
        .order("updated_at", { ascending: false })

      if (error) {
        toast.error("Không tải được sơ đồ")
        console.error(error)
      } else {
        setDiagrams(data || [])
      }

      setLoadingDiagrams(false)
    }

    fetchDiagrams()
  }, [user])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    let avatarUrl = user?.avatar || null

    if (newAvatarFile && user) {
      const fileExt = newAvatarFile.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`


      await supabase.storage
        .from("avatars")
        .upload(fileName, newAvatarFile, { upsert: true })

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
      avatarUrl = `${data.publicUrl}?t=${Date.now()}`
      updateUser({
        name: formData.name,
        avatar: avatarUrl,
      })

    }

    // Update user info
    updateUser({
      name: formData.name,
      avatar: avatarUrl || undefined,
    })

    setNewAvatarFile(null)
    setNewAvatarPreview(null)
    setIsEditing(false)
    toast.success('Profile updated')
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNewAvatarFile(file)
    setNewAvatarPreview(URL.createObjectURL(file)) // hiển thị preview ngay
  }

  const handleDeleteDiagram = async (id: string) => {
    const confirm = window.confirm("Bạn có chắc muốn xoá sơ đồ này?")
    if (!confirm) return

    const { error } = await supabase
      .from("family_trees")
      .delete()
      .eq("id", id)

    if (error) {
      toast.error("Xoá thất bại")
    } else {
      toast.success("Đã xoá sơ đồ")
      setDiagrams((prev) => prev.filter((d) => d.id !== id))
    }
  }

  // LOG OUT
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (!user) return <div>Loading...</div>
  
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 mt-16">
      {/* Profile Card */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Personal Information</h2>
        <div className="space-y-6 flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            {user.avatar ? (
              <img
                src={newAvatarPreview || user.avatar || '/logo.jpg'}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Only allow changing avatar when editing */}
            {isEditing && (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button size="sm" className="gap-2" asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    Change
                  </span>
                </Button>
              </label>
            )}
          </div>


          {/* Info Fields */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input value={formData.email} disabled className="mt-1 bg-muted" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-4 relative">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setNewAvatarFile(null)
                  setNewAvatarPreview(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} className="gap-2 cursor-pointer">
                <Save className="w-4 h-4" />
                Save
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="cursor-pointer">Edit</Button>
          )}

          <Button
            className="absolute left-0 bg-red-700 hover:bg-red-500 cursor-pointer gap-2"
            onClick={handleLogout}
          >
            LOG OUT
          </Button>
        </div>
      </Card>
      <Card className="p-8">
        <div>
          <h2 className="text-2xl font-bold text-center mb-8">Kho lưu trữ</h2>
          {loadingDiagrams ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Đang tải sơ đồ...</p>
            </div>
          ) : diagrams.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Bạn chưa có sơ đồ nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {diagrams.map((diagram) => (
                <Card
                  key={diagram.id}
                  className="p-4 hover:shadow-lg cursor-pointer"
                  onClick={() => router.push(`/create?id=${diagram.id}`)}
                >
                  <h3 className="font-semibold truncate mb-2">
                    {diagram.name}
                  </h3>

                  {/* 🖼️ THUMBNAIL */}
                  {diagram.thumbnail ? (
                    <img
                      src={diagram.thumbnail}
                      alt={diagram.name}
                      className="w-full h-40 object-cover rounded border mb-2"
                    />
                  ) : (
                    <div className="w-full h-40 bg-muted flex items-center justify-center text-xs text-muted-foreground rounded mb-2">
                      Chưa có preview
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mb-2">
                    Cập nhật: {new Date(diagram.updated_at).toLocaleDateString("vi-VN")}
                  </div>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteDiagram(diagram.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>

              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
