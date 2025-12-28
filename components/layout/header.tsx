"use client"

import { useState } from "react"
import { Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

const Header = () => {
  const router = useRouter()

  const navigationItems = [
    { label: "Giới thiệu", href: "/about" },
    { label: "Dịch vụ", href: "/services" },
    { label: "Tin tức", href: "/news" },
    { label: "Nghiên cứu", href: "/research" },
    { label: "Kiến thức", href: "/knowledge" },
    { label: "Bảng giá", href: "/cost" },
    { label: "Thống kê", href: "/dashboard" },
  ]

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.jpg" alt="" className="w-16 h-16 rounded-2xl" />
            </Link>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-black">FAMILY TREE</span>
              <span className="text-xs text-gray-600">Cội nguồn và lịch sử</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-black transition-colors duration-200 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded-md flex items-center space-x-2 cursor-pointer">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">TRA CỨU</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-gray-600 hover:text-black cursor-pointer"
              onClick={() => router.push("/login")}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header