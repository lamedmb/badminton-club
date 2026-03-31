'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export default function AdminGuard({ children }) {
  const { member, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!member) {
      router.push('/login')
      return
    }
    if (member.email !== ADMIN_EMAIL) {
      router.push('/')
    }
  }, [member, loading])

  if (loading || !member || member.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Checking access...</p>
      </div>
    )
  }

  return children
}