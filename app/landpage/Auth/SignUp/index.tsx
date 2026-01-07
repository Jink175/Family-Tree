'use client'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Logo from '@/components/Layout/Header/Logo'
import { useState, useMemo } from 'react'
import Loader from '@/app/landpage/Common/Loader'
import { Icon } from '@iconify/react'

interface SignUpProps {
  onSwitchToSignIn?: () => void
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToSignIn }) => {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const isEmailValid = useMemo(
    () => /\S+@\S+\.\S+/.test(form.email),
    [form.email]
  )

  const isFormValid =
    form.name.length > 0 && isEmailValid && form.password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Register failed')

      toast.success('Successfully registered')
      onSwitchToSignIn?.()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }
  const [showPassword, setShowPassword] = useState(false)

  return (
    <>
      <div className='mb-10 text-center mx-auto max-w-[160px]'>
        <Logo />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className='mb-5'>
          <input
            type='text'
            placeholder='Name'
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className='w-full rounded-md border bg-transparent px-5 py-3 text-white
              border-border focus:border-primary outline-none transition'
          />
        </div>

        {/* Email */}
        <div className='mb-5'>
          <input
            type='email'
            placeholder='Email'
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`w-full rounded-md border bg-transparent px-5 py-3 text-white
              outline-none transition
              ${
                form.email && !isEmailValid
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-border focus:border-primary'
              }`}
          />
          {form.email && !isEmailValid && (
            <p className='mt-1 text-sm text-red-500'>
              Email must contain @
            </p>
          )}
        </div>

        {/* Password */}
        <div className='mb-5'>
          <input
            type='password'
            placeholder='Password'
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className='w-full rounded-md border bg-transparent px-5 py-3 text-white
              border-border focus:border-primary outline-none transition'
          />
        </div>
        {/* Again Password */}
        <div className='mb-6'>
          <input
            type='Again password'
            placeholder='Again Password'
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className='w-full rounded-md border bg-transparent px-5 py-3 text-white
              border-border focus:border-primary outline-none transition'
          />
        </div>

        <button
          type='submit'
          disabled={!isFormValid || loading}
          className={`flex w-full items-center justify-center rounded-md px-5 py-3
            text-lg font-medium border border-primary transition
            ${
              isFormValid
                ? 'bg-[#a2e8bc] hover:bg-transparent hover:text-[#2D6A4F]'
                : 'bg-gray-600 cursor-not-allowed opacity-60'
            }`}
        >
          Sign Up {loading && <Loader />}
        </button>
      </form>

      <p className='text-white text-center mt-4'>
        Already have an account?
        <button
          type='button'
          onClick={onSwitchToSignIn}
          className='pl-2 text-[#2D6A4F] hover:underline'
        >
          Sign In
        </button>
      </p>
    </>
  )
}

export default SignUp
