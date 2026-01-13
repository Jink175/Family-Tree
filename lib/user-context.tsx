"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export interface AppUser {
  id: string
  email: string
  name: string
  avatar?: string
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
  updateUser: (updates: Partial<AppUser>) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)

  // Refresh user from Supabase
  const refreshUser = async () => {
    const { data } = await supabase.auth.getUser()
    const u = data.user
    if (!u) {
      setUser(null)
      return
    }
    setUser({
      id: u.id,
      email: u.email!,
      name: u.user_metadata?.name || "",
      avatar: u.user_metadata?.avatar,
    })
  }

  // Update user metadata
  const updateUser = async (updates: Partial<AppUser>) => {
    if (!user) return

    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...updates,
        name: updates.name ?? user.name,
        avatar: updates.avatar ?? user.avatar,
      },
    })

    if (error) throw error

    setUser({
      id: data.user!.id,
      email: data.user!.email!,
      name: data.user!.user_metadata?.name || "",
      avatar: data.user!.user_metadata?.avatar,
    })
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
