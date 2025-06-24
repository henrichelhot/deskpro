import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fallback to demo mode if environment variables are missing
const isDemoMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url'

let supabase: any = null

if (!isDemoMode) {
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.warn('Failed to initialize Supabase client, falling back to demo mode:', error)
  }
}

export { supabase, isDemoMode }

// Real-time subscriptions (only work with real Supabase)
export const subscribeToTicketChanges = (ticketId: string, callback: (payload: any) => void) => {
  if (!supabase || isDemoMode) {
    console.warn('Real-time subscriptions not available in demo mode')
    return { unsubscribe: () => {} }
  }
  
  return supabase
    .channel(`ticket-${ticketId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tickets',
      filter: `id=eq.${ticketId}`
    }, callback)
    .subscribe()
}

export const subscribeToTicketComments = (ticketId: string, callback: (payload: any) => void) => {
  if (!supabase || isDemoMode) {
    console.warn('Real-time subscriptions not available in demo mode')
    return { unsubscribe: () => {} }
  }
  
  return supabase
    .channel(`ticket-comments-${ticketId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'comments',
      filter: `ticket_id=eq.${ticketId}`
    }, callback)
    .subscribe()
}

export const subscribeToTicketViewers = (ticketId: string, callback: (payload: any) => void) => {
  if (!supabase || isDemoMode) {
    console.warn('Real-time subscriptions not available in demo mode')
    return { unsubscribe: () => {} }
  }
  
  return supabase
    .channel(`ticket-viewers-${ticketId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'ticket_viewers',
      filter: `ticket_id=eq.${ticketId}`
    }, callback)
    .subscribe()
}

// Authentication helpers
export const signUp = async (email: string, password: string, userData: any) => {
  if (!supabase || isDemoMode) {
    throw new Error('Authentication not available in demo mode')
  }
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
}

export const signIn = async (email: string, password: string) => {
  if (!supabase || isDemoMode) {
    throw new Error('Authentication not available in demo mode')
  }
  return await supabase.auth.signInWithPassword({
    email,
    password
  })
}

export const signOut = async () => {
  if (!supabase || isDemoMode) {
    throw new Error('Authentication not available in demo mode')
  }
  return await supabase.auth.signOut()
}

export const getCurrentUser = async () => {
  if (!supabase || isDemoMode) {
    return null
  }
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getCurrentUserProfile = async () => {
  if (!supabase || isDemoMode) {
    return null
  }
  
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}