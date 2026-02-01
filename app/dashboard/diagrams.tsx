"use client"

import { useEffect, useMemo, useState } from "react"
import { Trash2, Eye, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/user-context"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
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

interface Diagram {
  id: string
  name: string
  creator: string
  type: string
  createdDate: string
  modifiedDate: string
  nodes: number
  size: string
  status: "published" | "draft"
}

export function AdminDiagramsPage() {
  const router = useRouter()
  const { user } = useUser()

  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [loading, setLoading] = useState(true)
  const PAGE_SIZE = 10
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Search trong page hiện tại (10 items). Nếu muốn search toàn hệ thống -> làm server-side
  const filteredDiagrams = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return diagrams
    return diagrams.filter(
      (d) => d.name.toLowerCase().includes(q) || d.creator.toLowerCase().includes(q),
    )
  }, [diagrams, searchTerm])

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      setDeleting(true)

      const { error } = await supabase.from("family_trees").delete().eq("id", deleteId)
      if (error) throw error

      setDiagrams((prev) => prev.filter((d) => d.id !== deleteId))
      setTotal((prev) => Math.max(0, prev - 1))
      toast.success("Đã xóa sơ đồ")
    } catch {
      toast.error("Xóa thất bại")
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  useEffect(() => {
    // reset page khi đổi search để tránh "đang page 3 nhưng search ít -> rỗng"
    setPage(1)
  }, [searchTerm])

  useEffect(() => {
    if (!user) return

    const load = async () => {
      try {
        setLoading(true)

        const from = (page - 1) * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        const { data, count, error } = await supabase
          .from("family_trees")
          .select(
            `
            id,
            name,
            created_at,
            updated_at,
            nodes,
            user_id,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          `,
            { count: "exact" },
          )
          .order("created_at", { ascending: false })
          .range(from, to)

        if (error) {
          console.log("SUPABASE ERROR:", error)
          throw error
        }


        setTotal(count || 0)

        setDiagrams(
          (data || []).map((t: any) => {
            const creatorName = t.profiles?.full_name || t.user_id
            const nodesArr = Array.isArray(t.nodes) ? t.nodes : []
            return {
              id: t.id,
              name: t.name,
              creator: creatorName,
              type: "Family Tree",
              createdDate: new Date(t.created_at).toLocaleDateString(),
              modifiedDate: new Date(t.updated_at).toLocaleDateString(),
              nodes: nodesArr.length,
              size: `${Math.round(JSON.stringify(nodesArr).length / 1024)} KB`,
              status: "published",
            } as Diagram
          }),
        )
      } catch (e) {
        toast.error("Không tải được danh sách sơ đồ")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-center">Manage Diagrams</h1>
        <p className="text-muted-foreground mt-2 text-center">Manage all diagrams created on the system</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 justify-between">
            <CardTitle>Diagram List</CardTitle>
            <div className="flex-1 max-w-xs relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search diagrams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            {loading && <p className="text-center text-muted-foreground py-6">Đang tải sơ đồ...</p>}

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Diagram Name</th>
                  <th className="text-left py-3 px-4 font-medium">Creator</th>
                  <th className="text-left py-3 px-4 font-medium">Created Date</th>
                  <th className="text-left py-3 px-4 font-medium">Modified Date</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDiagrams.map((diagram) => (
                  <tr key={diagram.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{diagram.name}</td>
                    <td className="py-3 px-4">{diagram.creator}</td>
                    <td className="py-3 px-4">{diagram.createdDate}</td>
                    <td className="py-3 px-4">{diagram.modifiedDate}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => router.push(`/create?id=${diagram.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => setDeleteId(diagram.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredDiagrams.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      Không có sơ đồ nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4">
        <p className="text-sm text-muted-foreground">
          Trang {page} / {totalPages}
        </p>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="cursor-pointer" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This diagram will be permanently deleted and cannot be recovered.</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              {deleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
