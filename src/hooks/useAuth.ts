import { useState, useEffect } from 'react'
import { AuthService } from '../services/authService'
import { Database } from '../types/database'
import { isDemoMode } from '../lib/supabase'

type User = Database['public']['Tables']['users']['Row']

// Mock users for demo when Supabase auth fails
const MOCK_USERS = {
  'mohamed.hasanen@company.com': {
    id: 'mock-agent-1',
    name: 'Mohamed Hasanen',
    email: 'mohamed.hasanen@company.com',
    role: 'agent' as const,
    avatar_url: null,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  'mary.bisch@customer.com': {
    id: 'mock-customer-1',
    name: 'Mary Bisch',
    email: 'mary.bisch@customer.com',
    role: 'customer' as const,
    avatar_url: null,
    is_online: false,
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  'fares.mohsen@company.com': {
    id: 'mock-agent-2',
    name: 'Fares Mohsen',
    email: 'fares.mohsen@company.com',
    role: 'agent' as const,
    avatar_url: null,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  'summer.elashry@company.com': {
    id: 'mock-agent-3',
    name: 'Summer Elashry',
    email: 'summer.elashry@company.com',
    role: 'agent' as const,
    avatar_url: null,
    is_online: false,
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  'admin@company.com': {
    id: 'mock-admin-1',
    name: 'System Administrator',
    email: 'admin@company.com',
    role: 'admin' as const,
    avatar_url: null,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useMockAuth, setUseMockAuth] = useState(isDemoMode)

  useEffect(() => {
    // If we're in demo mode (missing env vars), automatically use mock auth
    if (isDemoMode) {
      setUseMockAuth(true)
      const storedUser = localStorage.getItem('mock_user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (err) {
          console.error('Error parsing stored mock user:', err)
          localStorage.removeItem('mock_user')
        }
      }
      setLoading(false)
      return
    }

    // Check if we should use mock auth (stored in localStorage)
    const shouldUseMock = localStorage.getItem('use_mock_auth') === 'true'
    setUseMockAuth(shouldUseMock)

    if (shouldUseMock) {
      // Check for stored mock user
      const storedUser = localStorage.getItem('mock_user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (err) {
          console.error('Error parsing stored mock user:', err)
          localStorage.removeItem('mock_user')
          localStorage.removeItem('use_mock_auth')
          setUseMockAuth(false)
        }
      }
      setLoading(false)
      return
    }

    // Try real Supabase auth
    const getInitialUser = async () => {
      try {
        const profile = await AuthService.getCurrentUserProfile()
        setUser(profile)
      } catch (err) {
        console.error('Error getting user:', err)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // Listen to auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const profile = await AuthService.getCurrentUserProfile()
          setUser(profile)
          
          // Update online status
          if (profile) {
            await AuthService.updateOnlineStatus(profile.id, true)
          }
        } catch (err) {
          console.error('Error getting user profile:', err)
        }
      } else if (event === 'SIGNED_OUT') {
        if (user && !useMockAuth) {
          try {
            await AuthService.updateOnlineStatus(user.id, false)
          } catch (err) {
            console.error('Error updating online status:', err)
          }
        }
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [useMockAuth])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      // If in demo mode or Supabase not configured, use mock auth
      if (isDemoMode) {
        if (MOCK_USERS[email as keyof typeof MOCK_USERS] && password === 'password123') {
          const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS]
          setUser(mockUser)
          setUseMockAuth(true)
          localStorage.setItem('mock_user', JSON.stringify(mockUser))
          return { error: null }
        } else {
          throw new Error('Invalid demo credentials. Use the demo account buttons for instant access.')
        }
      }

      // Check if this is a demo account and password is correct
      if (MOCK_USERS[email as keyof typeof MOCK_USERS] && password === 'password123') {
        // Use mock authentication
        const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS]
        setUser(mockUser)
        setUseMockAuth(true)
        localStorage.setItem('use_mock_auth', 'true')
        localStorage.setItem('mock_user', JSON.stringify(mockUser))
        return { error: null }
      }

      // Try real Supabase auth
      const { error } = await AuthService.login(email, password)
      if (error) {
        // If Supabase auth fails for demo accounts, offer mock auth
        if (MOCK_USERS[email as keyof typeof MOCK_USERS] && error.message.includes('Invalid login credentials')) {
          throw new Error('Demo user not found in Supabase Auth. Use the "Demo Account" buttons above for instant access, or create the user in your Supabase Auth dashboard.')
        }
        throw error
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loginWithMockAuth = (email: string) => {
    if (MOCK_USERS[email as keyof typeof MOCK_USERS]) {
      const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS]
      setUser(mockUser)
      setUseMockAuth(true)
      localStorage.setItem('use_mock_auth', 'true')
      localStorage.setItem('mock_user', JSON.stringify(mockUser))
      setError(null)
    } else {
      setError('Mock user not found')
    }
  }

  const register = async (email: string, password: string, userData: { name: string; role?: 'admin' | 'agent' | 'customer' }) => {
    if (isDemoMode) {
      throw new Error('Registration not available in demo mode')
    }
    
    try {
      setError(null)
      setLoading(true)
      const { error } = await AuthService.register(email, password, userData)
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      if (useMockAuth || isDemoMode) {
        // Clear mock auth
        setUser(null)
        setUseMockAuth(false)
        localStorage.removeItem('use_mock_auth')
        localStorage.removeItem('mock_user')
        setError(null)
      } else {
        // Real Supabase logout
        if (user) {
          try {
            await AuthService.updateOnlineStatus(user.id, false)
          } catch (err) {
            console.error('Error updating online status:', err)
          }
        }
        await AuthService.logout()
        setUser(null)
        setError(null)
      }
    } catch (err) {
      console.error('Error signing out:', err)
      setError('Error signing out')
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    login,
    loginWithMockAuth,
    register,
    logout,
    useMockAuth: useMockAuth || isDemoMode,
    isAuthenticated: !!user,
    isAgent: user?.role === 'agent' || user?.role === 'admin',
    isAdmin: user?.role === 'admin'
  }
}