"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export interface AppUser {
  id: string
  email: string
  full_name: string
  avatar_url?: string | null
  diagrams?: Array<{
    id: string
    name: string
    treeData: any
    arrows: any
    backgroundId: string
    createdAt: string
    updatedAt: string
  }>
}

interface UserContextType {
  user: AppUser | null
  refreshUser: () => Promise<void>
  // update local state only (DB update làm ở page)
  updateUser: (updates: Partial<AppUser>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)

  const refreshUser = async () => {
    const { data } = await supabase.auth.getUser()
    const u = data.user
    if (!u) {
      setUser(null)
      return
    }

    // ✅ lấy profile từ table profiles (nguồn chuẩn cho full_name/avatar_url)
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", u.id)
      .single()

    // Nếu chưa có row profiles thì fallback sang auth metadata
    const fullName =
      profile?.full_name ??
      (u.user_metadata?.full_name as string | undefined) ??
      ""

    const avatarUrl =
      profile?.avatar_url ??
      (u.user_metadata?.avatar_url as string | undefined) ??
      null

    if (profileErr) {
      // optional: console.warn(profileErr)
      // vẫn set user từ fallback để app chạy
    }

    setUser({
      id: u.id,
      email: u.email ?? "",
      full_name: fullName,
      avatar_url: avatarUrl,
    })
  }

  // ✅ update state tại chỗ để UI đổi ngay
  const updateUser = (updates: Partial<AppUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev))
  }

  useEffect(() => {
    refreshUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ user, refreshUser, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error("useUser must be used within UserProvider")
  return context
}
