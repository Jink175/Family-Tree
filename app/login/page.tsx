'use client'

import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Loader from '@/app/landpage/Common/Loader'
import { Icon } from '@iconify/react'
import Image from 'next/image'

type Mode = 'signin' | 'signup'

const AuthForm = () => {
  const router = useRouter()
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

  const isSignUpValid =
    form.name &&
    isEmailValid &&
    form.password &&
    form.password === form.confirmPassword

  const isPasswordMismatch =
    mode === 'signup' &&
    form.confirmPassword.length > 0 &&
    form.password !== form.confirmPassword

  const isSignInValid = isEmailValid && form.password
  const isFormValid =
  mode === 'signin' ? isSignInValid : isSignUpValid


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'signup' && !isSignUpValid) return
    if (mode === 'signin' && !isSignInValid) return

    setLoading(true)
    try {
        if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: {
                    name: form.name, // lưu name vào user metadata
                },
            },
        })

        if (error) {
            if (error.message.includes('already registered')) {
            toast.error('Email đã được đăng ký')
            } else {
            toast.error(error.message)
            }
            return // ⛔ CỰC KỲ QUAN TRỌNG
        }

        toast.success('Register successful 🎉')
        setMode('signin')
        } else {
        const { error } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        })

        if (error) {
            toast.error('Bạn đang nhập sai email hoặc mật khẩu')
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
            {/* IMAGE */}
            <div className="relative">
            <Image
                src="/login.png"
                alt="login"
                width={950}
                height={750}
                className="rounded-lg"
            />

            {/* FORM OVERLAY */}
            <div className="absolute top-1/2 left-1/2 
                -translate-x-1/2 -translate-y-1/2
                w-137.5 bg-black/40 backdrop-blur-md
                p-5 rounded-xl"
            >
                <form onSubmit={handleSubmit}>
                {mode === 'signup' && (
                    <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                        }
                        className="w-full rounded-md border bg-transparent px-4 py-2 text-white border-border focus:border-primary outline-none"
                    />
                    </div>
                )}

                <div className="mb-4">
                    <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                    className={`w-full rounded-md border bg-transparent px-4 py-2 text-white
                        ${
                        form.email && !isEmailValid
                            ? 'border-red-500'
                            : 'border-border'
                        }`}
                    />
                    {form.email && !isEmailValid && (
                    <p className="text-xs text-red-500 mt-1">
                        Email must contain @
                    </p>
                    )}
                </div>

                <div className="mb-4 relative">
                    <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                    className="w-full rounded-md border bg-transparent px-4 py-2 pr-10 text-white border-border"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                    <Icon
                        icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'}
                        width={20}
                    />
                    </button>
                </div>

                {mode === 'signup' && (
                    <div className="mb-4 relative">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm"
                        value={form.confirmPassword}
                        onChange={(e) =>
                            setForm({ ...form, confirmPassword: e.target.value })
                        }
                        className={`w-full rounded-md border bg-transparent px-4 py-2 pr-10 text-white
                            ${
                            isPasswordMismatch
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-border focus:border-primary'
                            }`}
                        />

                    <button
                        type="button"
                        onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                        <Icon
                        icon={
                            showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'
                        }
                        width={20}
                        />
                    </button>
                    {isPasswordMismatch && (
                        <p className="mt-1 text-xs text-red-500">
                            Password does not match
                        </p>
                    )}

                    </div>
                )}

                <button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className={`w-full py-2 rounded-md text-sm font-medium
                        border border-primary transition
                        ${
                        isFormValid
                            ? 'bg-[#a2e8bc] hover:bg-transparent hover:text-[#2D6A4F] cursor-pointer'
                            : 'bg-gray-600 opacity-60 cursor-not-allowed'
                        }`}
                    >
                    {mode === 'signin' ? 'Sign In' : 'Sign Up'}{' '}
                    {loading && <Loader />}
                </button>

                </form>

                <p className="text-white text-center mt-3 text-sm">
                {mode === 'signin'
                    ? 'Not a member?'
                    : 'Already have an account?'}{' '}
                <button
                    onClick={() =>
                    setMode(mode === 'signin' ? 'signup' : 'signin')
                    }
                    className="text-[#2D6A4F] hover:underline cursor-pointer"
                >
                    {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
                </p>
            </div>
            </div>
        </div>
        )
  
}

export default AuthForm
