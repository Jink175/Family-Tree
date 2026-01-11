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

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

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
      try {
        const fileExt = newAvatarFile.name.split('.').pop()
        const fileName = `${user.id}.${fileExt}`
        const filePath = fileName

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, newAvatarFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
        avatarUrl = data.publicUrl || avatarUrl
      } catch (err: any) {
        console.error(err)
        toast.error('Upload avatar failed')
        return
      }
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


  // Upload avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      if (!data?.publicUrl) throw new Error("No public URL")

      await updateUser({ avatar: data.publicUrl })

      toast.success("Avatar updated")
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Upload failed")
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNewAvatarFile(file)
    setNewAvatarPreview(URL.createObjectURL(file)) // hiển thị preview ngay
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
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            {user.avatar ? (
              <img
                src={newAvatarPreview || user.avatar || '/placeholder.svg'}
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
                  onChange={handleAvatarUpload}
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
              <Button variant="outline" onClick={() => setIsEditing(false)} className="cursor-pointer">
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
      
    </div>
  )
}
