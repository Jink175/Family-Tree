"use client"

import { useState } from "react"
import { Trash2, Eye, Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/user-context"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

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
  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [loading, setLoading] = useState(true)
  const PAGE_SIZE = 10
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDiagrams = diagrams.filter(
    (diagram) =>
      diagram.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagram.creator.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("family_trees")
        .delete()
        .eq("id", id)

      if (error) throw error

      setDiagrams(prev => prev.filter(d => d.id !== id))
      toast.success("Đã xóa sơ đồ")
    } catch {
      toast.error("Xóa thất bại")
    }
  }

  const { user } = useUser()

  useEffect(() => {
    if (!user) return

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("family_trees")
          .select(`
            id,
            name,
            created_at,
            updated_at,
            nodes,
            user_id
          `)
          .order("created_at", { ascending: false })

        if (error) throw error

        setDiagrams(
          (data || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            creator: user.name || user.email,
            type: "Family Tree",
            createdDate: new Date(t.created_at).toLocaleDateString(),
            modifiedDate: new Date(t.updated_at).toLocaleDateString(),
            nodes: t.nodes?.length || 0,
            size: `${Math.round(JSON.stringify(t.nodes || []).length / 1024)} KB`,
            status: "published",
          }))
        )
      } catch (err) {
        toast.error("Không tải được danh sách sơ đồ")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])


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
            user_id
          `,
            { count: "exact" }
          )
          .order("created_at", { ascending: false })
          .range(from, to)

        if (error) throw error

        setTotal(count || 0)

        setDiagrams(
          (data || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            creator: user.name || user.email,
            type: "Family Tree",
            createdDate: new Date(t.created_at).toLocaleDateString(),
            modifiedDate: new Date(t.updated_at).toLocaleDateString(),
            nodes: t.nodes?.length || 0,
            size: `${Math.round(JSON.stringify(t.nodes || []).length / 1024)} KB`,
            status: "published",
          }))
        )
      } catch {
        toast.error("Không tải được danh sách sơ đồ")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user, page])


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-center">Manage Diagrams</h1>
        <p className="text-muted-foreground mt-2 text-center">Manage all diagrams created on the system</p>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 justify-between">
            <CardTitle>Diagram List</CardTitle>
            <div className="flex-1 max-w-xs relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
            {loading && (
              <p className="text-center text-muted-foreground py-6">
                Đang tải sơ đồ...
              </p>
            )}
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
                          onClick={() => router.push(`/create?id=${diagram.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(diagram.id)}>
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
      <div className="flex justify-between items-center pt-4">
        <p className="text-sm text-muted-foreground">
          Trang {page} / {Math.ceil(total / PAGE_SIZE) || 1}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={page >= Math.ceil(total / PAGE_SIZE)}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

    </div>
  )
}
