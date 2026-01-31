"use client"

import { useEffect, useState } from "react"
import { Trash2, Edit2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface User {
  id: string
  name: string
  email: string
  joinDate: string
  diagramCount: number
  role: "admin" | "user"
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  const [editingName, setEditingName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const PAGE_SIZE = 10
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase.rpc("get_users_with_diagram_count")

      if (error) throw error

      setTotal((data || []).length)

      // paginate ở client (vì function hiện trả tất cả)
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE
      const sliced = (data || []).slice(from, to)

      // search client-side (hoặc lọc trước rồi slice)
      const filtered = searchTerm.trim()
        ? sliced.filter((u: any) =>
            (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
          )
        : sliced

      setUsers(
        filtered.map((u: any) => ({
          id: u.id,
          name: u.full_name || "No name",
          email: u.email,
          joinDate: new Date(u.created_at).toLocaleDateString(),
          diagramCount: u.diagram_count || 0,
          role: u.role || "user",
        }))
      )
    } catch (e) {
      console.error(e)
      toast.error("Không tải được danh sách user")
    } finally {
      setLoading(false)
    }
  }


  // ✅ load theo page + searchTerm
  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm])

  // ✅ khi đổi searchTerm thì quay về trang 1
  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  const saveUserName = async () => {
    if (!editingId) return
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: editingName })
        .eq("id", editingId)

      if (error) throw error

      setUsers(prev => prev.map(u => (u.id === editingId ? { ...u, name: editingName } : u)))
      toast.success("Đã cập nhật tên user")
      setEditingId(null)
      setEditingName("")
    } catch {
      toast.error("Cập nhật thất bại")
    }
  }

  const handleDelete = async () => {
    if (!deleteUserId) return
    try {
      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteUserId }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      toast.success("Đã xóa user")

      // ✅ refresh lại trang hiện tại (và nếu vừa xóa item cuối trang thì lùi trang)
      const remaining = total - 1
      const lastPage = Math.max(1, Math.ceil(remaining / PAGE_SIZE))
      if (page > lastPage) setPage(lastPage)
      else fetchUsers()
    } catch {
      toast.error("Xóa user thất bại")
    } finally {
      setDeleteUserId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-center">Manage Users</h1>
        <p className="text-muted-foreground mt-2 text-center">Manage user accounts and information</p>
      </div>

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
            {loading ? (
              <p className="text-center text-muted-foreground py-6">Loading user's list...</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Join Date</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">Diagrams</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {editingId === user.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-8 w-40"
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" className="cursor-pointer text-green-600" onClick={saveUserName}>
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="cursor-pointer text-gray-500"
                              onClick={() => {
                                setEditingId(null)
                                setEditingName("")
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          user.name
                        )}
                      </td>

                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.joinDate}</td>
                      <td className="py-3 px-4">
                        {user.role === "admin" ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Admin</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">User</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{user.diagramCount}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => {
                              setEditingId(user.id)
                              setEditingName(user.name)
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => setDeleteUserId(user.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!users.length && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">
                        Không có user nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4">
        <p className="text-sm text-muted-foreground">
          Trang {page} / {totalPages} — Tổng {total} users
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              User deletion is permanent. Are you sure you want to delete this user?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 cursor-pointer" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
