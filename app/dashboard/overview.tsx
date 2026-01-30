"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data cho biểu đồ
const userRegistrationData = [
  { day: "Mon", registrations: 45, cumulative: 245 },
  { day: "Tue", registrations: 62, cumulative: 307 },
  { day: "Wed", registrations: 38, cumulative: 345 },
  { day: "Thu", registrations: 55, cumulative: 400 },
  { day: "Fri", registrations: 71, cumulative: 471 },
  { day: "Sat", registrations: 83, cumulative: 554 },
  { day: "Sun", registrations: 92, cumulative: 646 },
]

const diagramCreatedData = [
  { day: "Mon", diagrams: 12 },
  { day: "Tue", diagrams: 18 },
  { day: "Wed", diagrams: 14 },
  { day: "Thu", diagrams: 22 },
  { day: "Fri", diagrams: 28 },
  { day: "Sat", diagrams: 35 },
  { day: "Sun", diagrams: 42 },
]


const StatCard = ({ title, value, description }: { title: string; value: string; description: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
)

export function AdminOverviewPage() {
  const totalUsers = 646
  const totalDiagrams = 171
  const averageDailyDiagrams = Math.round(171 / 7)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-center">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-center">Statistics on all system activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={totalUsers.toString()} description="Registered users" />
        <StatCard title="Total Diagrams" value={totalDiagrams.toString()} description="Diagrams created" />
        <StatCard title="Average/Day" value={averageDailyDiagrams.toString()} description="Diagrams/day (this week)" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Chart */}
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
                <Bar dataKey="registrations" fill="#3b82f6" name="Registrations Today" />
                <Bar dataKey="cumulative" fill="#10b981" name="Cumulative" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Diagram Creation Chart */}
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
