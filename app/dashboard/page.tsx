"use client"

import { useState } from "react"
import AdminLayout from "@/app/dashboard/admin-layout"
import { AdminOverviewPage } from "@/app/dashboard/overview"
import { AdminUsersPage } from "@/app/dashboard/users"
import { AdminDiagramsPage } from "@/app/dashboard/diagrams"
import AdminOnly from "./only-admin"

type Tab = "overview" | "users" | "diagrams" | "roles"

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState<Tab>("overview")

  return (
    <AdminOnly>
      <AdminLayout
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      >
        {currentTab === "overview" && <AdminOverviewPage />}
        {currentTab === "users" && <AdminUsersPage />}
        {currentTab === "diagrams" && <AdminDiagramsPage />}
      </AdminLayout>
    </AdminOnly>
  )
}
