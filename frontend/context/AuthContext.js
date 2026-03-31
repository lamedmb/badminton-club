'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [member, setMember] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token')
    const savedMember = localStorage.getItem('member')
    if (savedToken && savedMember) {
      setToken(savedToken)
      setMember(JSON.parse(savedMember))
    }
    setLoading(false)
  }, [])

  const login = (accessToken, memberData) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('member', JSON.stringify(memberData))
    setToken(accessToken)
    setMember(memberData)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('member')
    setToken(null)
    setMember(null)
  }

  return (
    <AuthContext.Provider value={{ member, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}