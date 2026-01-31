"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  async function checkAdmin() {
    const { data: userRes } = await supabase.auth.getUser()

    if (!userRes.user) {
      setIsAdmin(false)
      return
    }

    const { data, error } = await supabase.rpc("is_admin")

    if (error) {
      console.error("Admin check failed", error)
      setIsAdmin(false)
      return
    }

    setIsAdmin(Boolean(data))
  }

  useEffect(() => {
    // Check lần đầu
    checkAdmin()

    // Lắng nghe login / logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAdmin()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return isAdmin
}
