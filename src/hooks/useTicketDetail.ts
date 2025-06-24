import { useState, useEffect } from 'react'
import { TicketService } from '../services/ticketService'
import { MockDataService } from '../services/mockDataService'
import { subscribeToTicketChanges, subscribeToTicketComments } from '../lib/supabase'
import { Database } from '../types/database'
import { useAuth } from './useAuth'

type TicketWithDetails = Database['public']['Tables']['tickets']['Row'] & {
  requester: Database['public']['Tables']['users']['Row']
  assignee?: Database['public']['Tables']['users']['Row'] | null
  organization?: Database['public']['Tables']['organizations']['Row'] | null
  comments: (Database['public']['Tables']['comments']['Row'] & {
    author: Database['public']['Tables']['users']['Row']
  })[]
  ticket_changes: (Database['public']['Tables']['ticket_changes']['Row'] & {
    agent: Database['public']['Tables']['users']['Row']
  })[]
}

export const useTicketDetail = (ticketId: string | null) => {
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewers, setViewers] = useState<any[]>([])
  const { useMockAuth, user } = useAuth()

  const fetchTicket = async () => {
    if (!ticketId) {
      setTicket(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Check if we're in real Supabase mode but trying to fetch a mock ticket
      if (!useMockAuth && ticketId.startsWith('mock-ticket-')) {
        setTicket(null)
        setError('Cannot load mock ticket in real database mode')
        setLoading(false)
        return
      }
      
      let data
      if (useMockAuth) {
        data = await MockDataService.getTicket(ticketId)
      } else {
        data = await TicketService.getTicket(ticketId)
        // Track that current user is viewing this ticket
        if (data && user) {
          await TicketService.trackViewer(ticketId, user.id)
        }
      }
      
      setTicket(data as TicketWithDetails)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching ticket:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchViewers = async () => {
    if (!ticketId || !user) return
    
    // Don't fetch viewers for mock tickets in real mode
    if (!useMockAuth && ticketId.startsWith('mock-ticket-')) {
      return
    }
    
    try {
      let data
      if (useMockAuth) {
        data = await MockDataService.getTicketViewers(ticketId)
      } else {
        data = await TicketService.getTicketViewers(ticketId)
      }
      
      console.log('useTicketDetail.fetchViewers() - Raw data:', data)
      console.log('useTicketDetail.fetchViewers() - Current user ID:', user.id)
      
      // Filter out current user and ensure we have valid user data
      const filteredViewers = (data || []).filter((viewer: any) => {
        const isCurrentUser = viewer.user_id === user.id
        const hasValidUser = viewer.user && viewer.user.name
        console.log('Viewer filter check:', { 
          viewer, 
          isCurrentUser, 
          hasValidUser,
          shouldInclude: !isCurrentUser && hasValidUser 
        })
        return !isCurrentUser && hasValidUser
      })
      
      console.log('useTicketDetail.fetchViewers() - Filtered viewers:', filteredViewers)
      setViewers(filteredViewers)
    } catch (err) {
      console.error('Error fetching viewers:', err)
    }
  }

  // Track current user as viewer when ticket changes
  const trackCurrentUserViewing = async () => {
    if (!ticketId || !user) return
    
    // Don't track for mock tickets in real mode
    if (!useMockAuth && ticketId.startsWith('mock-ticket-')) {
      return
    }
    
    try {
      console.log('useTicketDetail.trackCurrentUserViewing() - Tracking user:', user.id, 'for ticket:', ticketId)
      
      if (useMockAuth) {
        await MockDataService.trackViewer(ticketId, user.id)
      } else {
        await TicketService.trackViewer(ticketId, user.id)
      }
      
      console.log('useTicketDetail.trackCurrentUserViewing() - Successfully tracked viewer')
    } catch (err) {
      console.error('Error tracking viewer:', err)
    }
  }

  useEffect(() => {
    fetchTicket()
  }, [ticketId, useMockAuth])

  useEffect(() => {
    if (!ticketId || !user) return

    // Track current user as viewing this ticket immediately
    trackCurrentUserViewing()

    // Don't set up real-time subscriptions for mock tickets in real mode
    if (!useMockAuth && ticketId.startsWith('mock-ticket-')) {
      return
    }

    // Fetch viewers initially and then every 15 seconds for more responsive updates
    fetchViewers()
    const viewersInterval = setInterval(() => {
      // Re-track current user and fetch viewers
      trackCurrentUserViewing()
      fetchViewers()
    }, 15000) // Check every 15 seconds

    // Subscribe to real-time changes (only for real Supabase)
    let ticketSubscription: any = { unsubscribe: () => {} }
    let commentsSubscription: any = { unsubscribe: () => {} }
    
    if (!useMockAuth) {
      ticketSubscription = subscribeToTicketChanges(ticketId, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setTicket(prev => prev ? { ...prev, ...payload.new } : null)
        }
      })

      commentsSubscription = subscribeToTicketComments(ticketId, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTicket(prev => {
            if (!prev) return null
            return {
              ...prev,
              comments: [...prev.comments, payload.new]
            }
          })
        }
      })
    }

    return () => {
      clearInterval(viewersInterval)
      ticketSubscription.unsubscribe()
      commentsSubscription.unsubscribe()
    }
  }, [ticketId, useMockAuth, user])

  const addComment = async (content: string, isInternal: boolean = false) => {
    if (!ticket || !user) return

    try {
      const commentData = {
        ticket_id: ticket.id,
        author_id: user.id,
        content,
        is_internal: isInternal
      }

      let newComment
      if (useMockAuth) {
        newComment = await MockDataService.addComment(commentData)
      } else {
        newComment = await TicketService.addComment(commentData)
      }
      
      // Update local state immediately
      setTicket(prev => {
        if (!prev) return null
        return {
          ...prev,
          comments: [...prev.comments, newComment as any]
        }
      })

      return newComment
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateTicket = async (updates: any) => {
    if (!ticket) return

    try {
      let updatedTicket
      if (useMockAuth) {
        updatedTicket = await MockDataService.updateTicket(ticket.id, updates)
      } else {
        updatedTicket = await TicketService.updateTicket(ticket.id, updates)
      }
      
      setTicket(prev => prev ? { ...prev, ...updatedTicket } : null)
      return updatedTicket
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    ticket,
    loading,
    error,
    viewers,
    addComment,
    updateTicket,
    refetch: fetchTicket
  }
}