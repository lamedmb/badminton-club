'use client'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { member, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          Badminton Club
        </Link>
        <div className="flex items-center gap-6">
          {member ? (
            <>
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                Sessions
              </Link>
              <Link href="/my-bookings" className="text-sm text-gray-600 hover:text-gray-900">
                My bookings
              </Link>
              <span className="text-sm text-gray-400">{member.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/signup" className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}