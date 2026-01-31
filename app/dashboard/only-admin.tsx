"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AdminOnly({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      // 1. Check login
      const { data: userRes } = await supabase.auth.getUser()
      const user = userRes.user

      if (!user) {
        router.replace("/login")
        return
      }

      // 2. Check admin role
      const { data, error } = await supabase.rpc("is_admin")

      if (error || !data) {
        router.replace("/") // hoặc /not-authorized
        return
      }

      setLoading(false)
    }

    check()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Checking permissions...</p>
      </div>
    )
  }

  return <>{children}</>
}
