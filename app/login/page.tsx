'use client'

import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Loader from '@/app/landpage/Common/Loader'
import { Icon } from '@iconify/react'
import Image from 'next/image'

type Mode = 'signin' | 'signup'

const AuthForm = () => {
  const router = useRouter()

  // ✅ Hook đặt đúng vị trí
  const [mode, setMode] = useState<Mode>('signin')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const isEmailValid = useMemo(
    () => /\S+@\S+\.\S+/.test(form.email),
    [form.email]
  )

  const isEmailError = form.email.length > 0 && !isEmailValid




  const isSignUpValid =
    !!form.name &&
    isEmailValid &&
    !!form.password &&
    form.password === form.confirmPassword

  const isSignInValid = isEmailValid && !!form.password

  const isFormValid =
    mode === 'signin' ? isSignInValid : isSignUpValid

  const isPasswordMismatch =
    mode === 'signup' &&
    form.confirmPassword.length > 0 &&
    form.password !== form.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) return

    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { name: form.name },
          },
        })

        if (error) {
          toast.error(
            error.message.includes('already registered')
              ? 'Email đã được đăng ký'
              : error.message
          )
          return
        }

        toast.success('Register successful 🎉')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })

        if (error) {
          toast.error('Sai email hoặc mật khẩu')
          return
        }

        toast.success('Login successful ✅')
        router.push('/')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full flex justify-center mt-30">
      <div className="relative">
        <Image
          src="/login_1.png"
          alt="login"
          width={950}
          height={750}
          className="rounded-lg"
        />

        <div className="absolute top-1/2 left-1/2 
          -translate-x-1/2 -translate-y-1/2
          w-137.5 bg-black/40 backdrop-blur-md
          p-5 rounded-xl"
        >
          <form onSubmit={handleSubmit}>
            <h1 className="text-black text-center mb-10 font-bold text-4xl">
              {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </h1>

            {mode === 'signup' && (
              <input
                className="mb-4 w-full rounded-md border px-4 py-2"
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            )}

            <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                setForm({ ...form, email: e.target.value })
                }
                className={`
                w-full rounded-md border bg-transparent px-4 py-2 text-black mb-4
                transition
                outline-none
                ${
                    isEmailError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-border focus:border-primary'
                }
                `}
            />

            <div className="mb-4 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-md border px-4 py-2"
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} />
              </button>
            </div>

            {mode === 'signup' && (
                <div className="mb-4 relative">
                    <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                    }
                    className={`w-full rounded-md border px-4 py-2 pr-10
                        ${
                        isPasswordMismatch
                            ? 'border-red-500'
                            : 'border-border'
                        }`}
                    />

                    <button
                    type="button"
                    onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                    <Icon
                        icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'}
                    />
                    </button>

                    {isPasswordMismatch && (
                    <p className="text-xs text-red-500 mt-1">
                        Password does not match
                    </p>
                    )}
                </div>
                )}


            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full py-2 rounded-md bg-[#2D6A4F] cursor-pointer"
            >
              {mode === 'signin' ? 'Sign In' : 'Sign Up'}
              {loading && <Loader />}
            </button>
          </form>

          <p className="text-center mt-3 text-sm">
            {mode === 'signin'
              ? 'Not a member?'
              : 'Already have an account?'}{' '}
            <button
              onClick={() =>
                setMode(mode === 'signin' ? 'signup' : 'signin')
              }
              className="text-[#2D6A4F] underline cursor-pointer"
            >
              {mode === 'signin' ? 'Create Account ✨' : 'Welcome Back 👋'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
