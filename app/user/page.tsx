"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import { useUser } from "@/lib/user-context"
import { useTree } from "@/lib/tree-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, Save, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ProfilePage() {
  const { user, updateUser, refreshUser } = useUser()
  const { setTreeData } = useTree()
  const router = useRouter()

  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null)
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null)

  const [diagrams, setDiagrams] = useState<any[]>([])
  const [loadingDiagrams, setLoadingDiagrams] = useState(true)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  })

  // Fetch user's diagrams
  useEffect(() => {
    const fetchDiagrams = async () => {
      if (!user) return

      setLoadingDiagrams(true)

      const { data, error } = await supabase
        .from("family_trees")
        .select("id, name, updated_at, thumbnail")
        .eq("user_id", user.id) // ✅ chỉ lấy của user hiện tại
        .order("updated_at", { ascending: false })

      if (error) {
        console.warn(error)
        toast.error("Không tải được danh sách sơ đồ")
      } else {
        setDiagrams(data || [])
      }

      setLoadingDiagrams(false)
    }

    fetchDiagrams()
  }, [user])

  // Init form from user context
  useEffect(() => {
    if (!user) return
    setFormData({
      full_name: user.full_name ?? "",
      email: user.email ?? "",
    })
  }, [user])

  const handleInputChange = (field: "full_name" | "email", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNewAvatarFile(file)
    setNewAvatarPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      let avatarUrl = user.avatar_url || null

      // 1) Upload avatar nếu có
      if (newAvatarFile) {
        const fileExt = newAvatarFile.name.split(".").pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(fileName, newAvatarFile, { upsert: true })

        if (uploadErr) throw uploadErr

        const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
        avatarUrl = `${data.publicUrl}?t=${Date.now()}`
      }

      // 2) Update AUTH metadata (optional nhưng bạn muốn đồng nhất thì để)
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          avatar_url: avatarUrl, // ✅ lưu cả avatar_url vào metadata nếu muốn
        },
      })
      if (authErr) throw authErr

      // 3) ✅ Update PROFILES (CÁI BẠN ĐANG THIẾU)
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id)

      if (profileErr) throw profileErr

      // 4) Refresh UI (cách 1: refreshUser, chuẩn nhất)
      await refreshUser()

      // hoặc cách 2: update local state ngay lập tức (để khỏi chờ)
      updateUser({
        full_name: formData.full_name,
        avatar_url: avatarUrl,
      })

      setNewAvatarFile(null)
      setNewAvatarPreview(null)
      setIsEditing(false)
      toast.success("Profile updated")
    } catch (e) {
      console.error(e)
      toast.error("Update profile failed")
    }
  }


  const handleDeleteDiagram = async (id: string) => {
    const { error } = await supabase.from("family_trees").delete().eq("id", id)

    if (error) {
      toast.error("Xoá thất bại")
    } else {
      toast.success("Đã xoá sơ đồ")
      setDiagrams((prev) => prev.filter((d) => d.id !== id))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }
  
  if (!user) return <div>Loading...</div>
  const avatarSrc = newAvatarPreview || user.avatar_url || "/logo.jpg"


  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 mt-16">
      
      {/* Profile Card */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Personal Information</h2>

        <div className="space-y-6 flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              {newAvatarPreview || user.avatar_url ? (
                <img
                  src={avatarSrc}
                  alt={formData.full_name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                  {(formData.full_name?.charAt(0) || "?").toUpperCase()}
                </div>
              )}

              {isEditing && (
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
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
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
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
                  // reset form
                  setFormData({
                    full_name: user.full_name ?? "",
                    email: user.email ?? "",
                  })
                }}
                className="cursor-pointer"
              >
                Cancel
              </Button>

              <Button onClick={handleSaveProfile} className="gap-2 cursor-pointer">
                <Save className="w-4 h-4" />
                Save
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="cursor-pointer">
              Edit
            </Button>
          )}

          <Button className="absolute left-0 bg-red-700 hover:bg-red-500 cursor-pointer gap-2" onClick={handleLogout}>
            LOG OUT
          </Button>
        </div>
      </Card>

      {/* Storage */}
      <Card className="p-8">
        <div>
          <h2 className="text-2xl font-bold text-center mb-8">My Storage</h2>

          {loadingDiagrams ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Loading storage...</p>
            </div>
          ) : diagrams.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">You don't have any diagrams yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {diagrams.map((diagram) => (
                <Card
                  key={diagram.id}
                  className="p-4 hover:shadow-lg cursor-pointer"
                  onClick={() => router.push(`/create?id=${diagram.id}`)}
                >
                  <h3 className="font-semibold truncate mb-2">{diagram.name}</h3>

                  {diagram.thumbnail ? (
                    <img
                      src={diagram.thumbnail}
                      alt={diagram.name}
                      className="w-full h-40 object-cover rounded border mb-2 text-center"
                    />
                  ) : (
                    <div className="w-full h-40 bg-muted flex items-center justify-center text-xs text-muted-foreground rounded mb-2">
                      Haven't preview available
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mb-2">
                    Update: {new Date(diagram.updated_at).toLocaleDateString("vi-VN")}
                  </div>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteId(diagram.id)
                    }}
                    className="cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <Dialog open={deleteId === diagram.id} onOpenChange={() => setDeleteId(null)}>
                    <DialogContent onClick={(e) => e.stopPropagation()}>
                      <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                      </DialogHeader>

                      <p className="text-sm text-muted-foreground">
                        This diagram will be permanently deleted and cannot be recovered.
                      </p>

                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDeleteId(null)} className="cursor-pointer">
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            await handleDeleteDiagram(diagram.id)
                            setDeleteId(null)
                          }}
                          className="cursor-pointer"
                        >
                          Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
