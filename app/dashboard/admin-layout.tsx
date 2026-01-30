"use client"

import React from "react"

import { LayoutGrid, Users, FileText, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdminLayoutProps {
  currentTab: "overview" | "users" | "diagrams" | "roles"
  onTabChange: (tab: "overview" | "users" | "diagrams" | "roles") => void
  children: React.ReactNode
}

const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "users", label: "Manage Users", icon: Users },
  { id: "diagrams", label: "Manage Diagrams", icon: FileText },
]

export default function AdminLayout({ currentTab, onTabChange, children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-background mt-30">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">Dashboard</h2>
        <nav className="space-y-2">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                onClick={() => onTabChange(tab.id as any)}
                variant={currentTab === tab.id ? "default" : "ghost"}
                className={cn("w-full justify-start gap-3 cursor-pointer", currentTab === tab.id && "bg-primary text-primary-foreground")}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </Button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
