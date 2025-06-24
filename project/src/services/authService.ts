import { supabase, signUp, signIn, signOut, getCurrentUser, getCurrentUserProfile, isDemoMode } from '../lib/supabase'

export class AuthService {
  // Sign up new user
  static async register(email: string, password: string, userData: {
    name: string
    role?: 'admin' | 'agent' | 'customer'
  }) {
    if (isDemoMode) {
      throw new Error('Registration not available in demo mode')
    }
    return await signUp(email, password, {
      name: userData.name,
      role: userData.role || 'customer'
    })
  }

  // Sign in user
  static async login(email: string, password: string) {
    if (isDemoMode) {
      throw new Error('Authentication not available in demo mode')
    }
    return await signIn(email, password)
  }

  // Sign out user
  static async logout() {
    if (isDemoMode) {
      throw new Error('Authentication not available in demo mode')
    }
    return await signOut()
  }

  // Get current user
  static async getCurrentUser() {
    if (isDemoMode) {
      return null
    }
    return await getCurrentUser()
  }

  // Get current user profile
  static async getCurrentUserProfile() {
    if (isDemoMode) {
      return null
    }
    return await getCurrentUserProfile()
  }

  // Update user online status
  static async updateOnlineStatus(userId: string, isOnline: boolean) {
    if (isDemoMode || !supabase) {
      return null
    }
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_online: isOnline,
        last_seen: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error
    return data
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    if (isDemoMode || !supabase) {
      // Return a mock subscription for demo mode
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      }
    }
    return supabase.auth.onAuthStateChange(callback)
  }
}