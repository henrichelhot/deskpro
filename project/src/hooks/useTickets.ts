import { useState, useEffect } from 'react'
import { TicketService } from '../services/ticketService'
import { MockDataService } from '../services/mockDataService'
import { subscribeToTicketChanges } from '../lib/supabase'
import { Database } from '../types/database'
import { useAuth } from './useAuth'

type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  requester: Database['public']['Tables']['users']['Row']
  assignee?: Database['public']['Tables']['users']['Row'] | null
  organization?: Database['public']['Tables']['organizations']['Row'] | null
}

export const useTickets = (filters: any = {}) => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { useMockAuth, user } = useAuth()

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let data
      if (useMockAuth) {
        data = await MockDataService.getTickets(filters)
      } else {
        data = await TicketService.getTickets(filters)
      }
      
      setTickets(data as Ticket[])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [JSON.stringify(filters), useMockAuth])

  const updateTicket = async (id: string, updates: any) => {
    try {
      let updatedTicket
      if (useMockAuth) {
        updatedTicket = await MockDataService.updateTicket(id, updates)
      } else {
        updatedTicket = await TicketService.updateTicket(id, updates)
      }
      
      setTickets(prev => prev.map(ticket => 
        ticket.id === id ? { ...ticket, ...updatedTicket } : ticket
      ))
      return updatedTicket
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const assignTicket = async (ticketId: string, assigneeId: string | null, agentId: string) => {
    try {
      let updatedTicket
      if (useMockAuth) {
        updatedTicket = await MockDataService.assignTicket(ticketId, assigneeId, agentId)
      } else {
        updatedTicket = await TicketService.assignTicket(ticketId, assigneeId, agentId)
      }
      
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
      ))
      return updatedTicket
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const createTicket = async (ticketData: any) => {
    try {
      setError(null)
      let newTicket
      
      if (useMockAuth) {
        // Mock implementation for creating tickets
        newTicket = await MockDataService.createTicket(ticketData)
        // Update local state immediately
        setTickets(prev => [newTicket as Ticket, ...prev])
      } else {
        // Real Supabase implementation
        newTicket = await TicketService.createTicket(ticketData)
        // Update local state immediately
        setTickets(prev => [newTicket as Ticket, ...prev])
      }
      
      return newTicket
    } catch (err: any) {
      setError(err.message)
      console.error('Error creating ticket:', err)
      throw err
    }
  }

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    updateTicket,
    assignTicket,
    createTicket,
    refetch: fetchTickets
  }
}