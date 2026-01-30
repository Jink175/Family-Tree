"use client"

import { useState } from "react"
import AdminLayout from "@/app/dashboard/admin-layout"
import { AdminOverviewPage } from "@/app/dashboard/overview"
import { AdminUsersPage } from "@/app/dashboard/users"
import { AdminDiagramsPage } from "@/app/dashboard/diagrams"

type Tab = "overview" | "users" | "diagrams" | "roles"

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState<Tab>("overview")

  return (
    <AdminLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}   // ✅ QUAN TRỌNG
    >
      {currentTab === "overview" && <AdminOverviewPage />}
      {currentTab === "users" && <AdminUsersPage />}
      {currentTab === "diagrams" && <AdminDiagramsPage />}
    </AdminLayout>
  )
}
