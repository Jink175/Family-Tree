'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Logo from './Logo'
import HeaderLink from './Navigation/HeaderLink'
import { headerData } from './Navigation/menuData'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'
import toast from 'react-hot-toast'

const Header: React.FC = () => {
  const pathname = usePathname()
  const [sticky, setSticky] = useState(false)
  const [navbarOpen, setNavbarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Lấy user hiện tại khi load page
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
    })

    // Lắng nghe thay đổi auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null)
        toast.success('Đã đăng nhập thành công 🎉')
      }

      if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])


  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY >= 80)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-40 w-full transition-all duration-300
        ${sticky ? 'bg-black shadow-lg pt-5' : 'bg-black pt-7'}`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Desktop menu */}
        <nav className="hidden lg:flex items-center gap-8">
          {headerData.map((item, index) => (
            <HeaderLink key={index} item={item} />
          ))}
        </nav>

        {/* Login button */}
        <div className="hidden sm:block">
          {!user ? (
            <Link
              href="/login"
              className="border border-primary text-[#2D6A4F]
                px-4 py-2 rounded-lg transition
                hover:bg-[#A2E8BC] hover:text-white"
            >
              Log In
            </Link>
          ) : (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary cursor-pointer">
              <Link href="/user">
                <Image
                  src="/logo.jpg" // hoặc user metadata avatar sau này
                  alt="avatar"
                  width={40}
                  height={40}
                />
              </Link>
            </div>
          )}
        </div>


        {/* Mobile toggle */}
        <button
          onClick={() => setNavbarOpen(!navbarOpen)}
          className="lg:hidden p-2"
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white mt-1.5"></span>
          <span className="block w-6 h-0.5 bg-white mt-1.5"></span>
        </button>
      </div>

      {/* Mobile menu */}
      {navbarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40">
          <div className="absolute right-0 top-0 h-full w-64 bg-background p-4 z-50">
            <Link
              href="/login"
              onClick={() => setNavbarOpen(false)}
              className="block border border-primary text-[#2D6A4F] 
                px-4 py-2 rounded-lg hover:bg-[#A2E8BC] hover:text-white"
            >
              Log In
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
