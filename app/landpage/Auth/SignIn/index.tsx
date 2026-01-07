'use client'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import Logo from '@/components/Layout/Header/Logo'
import Loader from '@/app/landpage/Common/Loader'
import { Icon } from '@iconify/react'


interface SigninProps {
  onSwitchToSignUp?: () => void
}

const Signin: React.FC<SigninProps> = ({ onSwitchToSignUp }) => {
  const router = useRouter()

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const isEmailValid = useMemo(
    () => /\S+@\S+\.\S+/.test(loginData.email),
    [loginData.email]
  )

  const isFormValid = isEmailValid && loginData.password.length > 0

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setLoading(true)
    try {
      const res = await signIn('credentials', {
        ...loginData,
        redirect: false,
      })

      if (res?.error) {
        toast.error(res.error)
        setLoading(false)
        return
      }

      toast.success('Login successful')
      router.push('/')
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

      <form onSubmit={loginUser}>
        <div className='mb-5'>
          <input
            type='email'
            placeholder='Email'
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            className='w-full rounded-md border bg-transparent px-5 py-3 text-white
              border-border focus:border-primary outline-none transition'
          />
        </div>

        <div className='mb-6 relative'>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='Password'
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            className='w-full rounded-md border bg-transparent px-5 py-3 pr-12 text-white
              border-border focus:border-primary outline-none transition'
          />

          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white'
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} width={22} />
          </button>
        </div>


        <button
          type='submit'
          disabled={!isFormValid || loading}
          className={`w-full py-3 rounded-lg text-lg font-medium border border-primary
            transition
            ${
              isFormValid
                ? 'bg-[#a2e8bc] hover:bg-transparent hover:text-[#2D6A4F]'
                : 'bg-gray-600 cursor-not-allowed opacity-60'
            }`}
        >
          Sign In {loading && <Loader />}
        </button>
      </form>

      <Link
        href='/forgot-password'
        className='block mt-4 text-center text-white hover:text-[#2D6A4F]'
      >
        Forgot Password?
      </Link>

      <p className='text-white text-center mt-3'>
        Not a member yet?{' '}
        <button
          type='button'
          onClick={onSwitchToSignUp}
          className='text-[#2D6A4F] hover:underline'
        >
          Sign Up
        </button>
      </p>
    </>
  )
}

export default Signin
