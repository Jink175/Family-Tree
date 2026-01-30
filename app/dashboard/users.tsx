"use client"

import { useState } from "react"
import { Trash2, Edit2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

interface User {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  status: "active" | "inactive"
  diagramCount: number
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa user này không?")) return

    try {
        const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
        })

        const result = await res.json()
        if (!res.ok) throw new Error(result.error)

        setUsers(prev => prev.filter(u => u.id !== id))
        toast.success("Đã xóa user")
    } catch {
        toast.error("Xóa user thất bại")
    }
    }


  useEffect(() => {
    const load = async () => {
        try {
        setLoading(true)

        const { data, error } = await supabase
            .rpc("get_users_with_diagram_count")

        if (error) throw error

        setUsers(
            (data || []).map((u: any) => ({
            id: u.id,
            name: u.full_name || "No name",
            email: u.email,
            phone: "-",
            joinDate: new Date(u.created_at).toLocaleDateString(),
            status: "active",
            diagramCount: u.diagram_count || 0,
            }))
        )
        } catch {
        toast.error("Không tải được danh sách user")
        } finally {
        setLoading(false)
        }
    }

    load()
    }, [])

    const updateUserName = async (id: string, name: string) => {
        await supabase
            .from("profiles")
            .update({ full_name: name })
            .eq("id", id)

        setUsers(prev =>
            prev.map(u => (u.id === id ? { ...u, name } : u))
        )
    }

    useEffect(() => {
        fetch(`/api/admin/users?page=${page}`)
            .then(res => res.json())
            .then(data => {
            setUsers(data.users)
            setTotal(data.total)
            })
    }, [page])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-center">Manage Users</h1>
        <p className="text-muted-foreground mt-2 text-center">Manage user accounts and information</p>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 justify-between">
            <CardTitle>User List</CardTitle>
            <div className="flex-1 max-w-xs relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading && (
                <p className="text-center text-muted-foreground py-6">
                    Đang tải danh sách user...
                </p>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Join Date</th>
                  <th className="text-left py-3 px-4 font-medium">Diagrams</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.joinDate}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{user.diagramCount}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => setEditingId(user.id)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between items-center mt-4">
        <Button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="cursor-pointer"
        >
            Prev
        </Button>

        <span>
            Page {page} / {Math.ceil(total / 10)}
        </span>

        <Button
            disabled={page >= Math.ceil(total / 10)}
            onClick={() => setPage(p => p + 1)}
            className="cursor-pointer"
        >
            Next
        </Button>
    </div>

    </div>
  )
}
