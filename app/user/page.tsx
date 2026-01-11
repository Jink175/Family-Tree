"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/user-context"
import { useTree } from "@/lib/tree-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, Save, Trash2, FolderOpen, Plus } from "lucide-react"

export default function ProfilePage() {
  const { user, updateUser } = useUser()
  const { tree, setTreeData } = useTree()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: user?.password || "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: user.password,
      })
    }
  }, [user])

  const [savedDiagrams, setSavedDiagrams] = useState<any[]>(() => {
    const saved = localStorage.getItem("savedDiagrams")
    return saved ? JSON.parse(saved) : []
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = () => {
    if (user) {
      updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })
      setIsEditing(false)
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (user) {
          updateUser({
            avatar: event.target?.result as string,
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveDiagram = () => {
    const diagram = {
      id: `diagram-${Date.now()}`,
      name: tree.name,
      createdAt: new Date().toLocaleString(),
      data: tree,
    }

    const updated = [...savedDiagrams, diagram]
    setSavedDiagrams(updated)
    localStorage.setItem("savedDiagrams", JSON.stringify(updated))
  }

  const handleLoadDiagram = (diagram: any) => {
    setTreeData(diagram.data)
  }

  const handleDeleteDiagram = (id: string) => {
    const updated = savedDiagrams.filter((d) => d.id !== id)
    setSavedDiagrams(updated)
    localStorage.setItem("savedDiagrams", JSON.stringify(updated))
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 mt-16   ">
      {/* User Profile Section */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">Personal Information</h2>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <Button className="gap-2" size="sm" asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    Change Avatar
                  </span>
                </Button>
              </label>
            </div>

            {/* Form Fields */}
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
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            {isEditing ? (
              <>
                <Button variant="outline" className="cursor-pointer" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} className="gap-2 cursor-pointer">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button className="cursor-pointer" onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
            <Button className="cursor-pointer left-65 absolute bg-red-700 hover:bg-red-500">LOG OUT</Button>
          </div>
        </div>
      </Card>

      {/* Diagram Storage Section */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="w-6 h-6" />
            My Diagrams
          </h2>
          <Button onClick={handleSaveDiagram} className="gap-2 cursor-pointer">
            <Plus className="w-4 h-4" />
            Save Current Diagram
          </Button>
        </div>

        {savedDiagrams.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No saved diagrams yet. Create one and save it to your collection!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDiagrams.map((diagram) => (
              <Card key={diagram.id} className="p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2 truncate">{diagram.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{diagram.createdAt}</p>
                <p className="text-xs mb-4">
                  {diagram.data.nodes.length} items • {diagram.data.connections.length} connections
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleLoadDiagram(diagram)} className="flex-1 cursor-pointer">
                    Load
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteDiagram(diagram.id)} className="cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
