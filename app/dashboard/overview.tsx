"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

interface DayStat {
  day: string
  registrations?: number
  cumulative?: number
  diagrams?: number
}

const StatCard = ({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
)

// helper: YYYY-MM-DD theo giờ VN để tránh lệch ngày
const vnDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" })

export function AdminOverviewPage() {
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalDiagrams, setTotalDiagrams] = useState(0)
  const [averageDailyDiagrams, setAverageDailyDiagrams] = useState(0)

  const [userRegistrationData, setUserRegistrationData] = useState<DayStat[]>([])
  const [diagramCreatedData, setDiagramCreatedData] = useState<DayStat[]>([])

  useEffect(() => {
    const loadStats = async () => {
      try {
        // -------------------------
        // TOTAL USERS (nếu muốn tổng user theo auth.users thì nên làm RPC khác)
        // tạm giữ profiles như bạn đang dùng
        // -------------------------
        // -------------------------
        // TOTAL USERS (ALL TIME)
        // -------------------------
        const { data: totalUsersData, error: totalUsersErr } =
          await supabase.rpc("get_total_auth_users")

        if (totalUsersErr) throw totalUsersErr

        setTotalUsers(totalUsersData ?? 0)


        // -------------------------
        // TOTAL DIAGRAMS
        // -------------------------
        const { count: diagramCount, error: diagramErr } = await supabase
          .from("family_trees")
          .select("*", { count: "exact", head: true })
        if (diagramErr) throw diagramErr
        setTotalDiagrams(diagramCount || 0)

        // -------------------------
        // LAST 7 DAYS DATA
        // -------------------------
        const since = new Date()
        since.setDate(since.getDate() - 6)

        // ✅ USERS PER DAY: lấy từ auth.users qua RPC mới
        const { data: users, error: usersDayErr } = await supabase.rpc(
          "get_new_users_since",
          { p_since: since.toISOString() }
        )
        if (usersDayErr) throw usersDayErr

        // DIAGRAMS PER DAY: giữ như cũ (family_trees)
        const { data: diagrams, error: diagramsDayErr } = await supabase
          .from("family_trees")
          .select("created_at")
          .gte("created_at", since.toISOString())
        if (diagramsDayErr) throw diagramsDayErr

        // -------------------------
        // GROUP BY DAY (theo giờ VN)
        // -------------------------
        const days: DayStat[] = []
        let cumulative = 0

        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)

          const label = date.toLocaleDateString("en-US", {
            weekday: "short",
            timeZone: "Asia/Ho_Chi_Minh",
          })

          // YYYY-MM-DD theo VN
          const dayStr = date.toLocaleDateString("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
          })

          const userCountDay =
            users?.filter((u: any) => vnDay(u.created_at) === dayStr).length || 0

          const diagramCountDay =
            diagrams?.filter((d: any) => vnDay(d.created_at) === dayStr).length || 0

          cumulative += userCountDay

          days.push({
            day: label,
            registrations: userCountDay,
            cumulative,
            diagrams: diagramCountDay,
          })
        }

        setUserRegistrationData(days)
        setDiagramCreatedData(days)

        const avg = Math.round(
          days.reduce((sum, d) => sum + (d.diagrams || 0), 0) / 7
        )
        setAverageDailyDiagrams(avg)
      } catch (err) {
        console.error(err)
        toast.error("No loading dashboard stats.")
      }
    }

    loadStats()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-center">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-center">
          Statistics on all system activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={totalUsers.toString()} description="Registered users" />
        <StatCard title="Total Diagrams" value={totalDiagrams.toString()} description="Diagrams created" />
        <StatCard title="Average/Day" value={averageDailyDiagrams.toString()} description="Diagrams/day (last 7 days)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">User Registration by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userRegistrationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="registrations" fill="#3b82f6" name="Registrations" />
                <Bar dataKey="cumulative" fill="#10b981" name="Cumulative" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Diagrams Created by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diagramCreatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="diagrams" fill="#8b5cf6" name="New Diagrams" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
