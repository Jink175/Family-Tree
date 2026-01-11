"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  password: string
  avatar?: string
}

interface UserContextType {
  user: UserProfile | null
  setUser: (user: UserProfile) => void
  updateUser: (updates: Partial<UserProfile>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const getInitialUser = (): UserProfile => {
  if (typeof window !== "undefined") {
    const savedUser = localStorage.getItem("userProfile")
    if (savedUser) {
      return JSON.parse(savedUser)
    }
  }

  return {
    id: `user-${Date.now()}`,
    name: "User",
    email: "user@example.com",
    phone: "",
    password: "password123",
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("userProfile")
    if (savedUser) {
      setUserState(JSON.parse(savedUser))
    } else {
      // Create default user if none exists
      const defaultUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: "User",
        email: "user@example.com",
        phone: "",
        password: "password123",
      }
      setUserState(defaultUser)
      localStorage.setItem("userProfile", JSON.stringify(defaultUser))
    }
    setIsLoaded(true)
  }, [])

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser)
    localStorage.setItem("userProfile", JSON.stringify(newUser))
  }

  const updateUser = (updates: Partial<UserProfile>) => {
    setUserState((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      localStorage.setItem("userProfile", JSON.stringify(updated))
      return updated
    })
  }

  if (!isLoaded) {
    return <div />
  }

  return <UserContext.Provider value={{ user, setUser, updateUser }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
