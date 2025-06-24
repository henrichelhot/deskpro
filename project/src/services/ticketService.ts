import { supabase } from '../lib/supabase'
import { Database } from '../types/database'

type Ticket = Database['public']['Tables']['tickets']['Row']
type TicketInsert = Database['public']['Tables']['tickets']['Insert']
type TicketUpdate = Database['public']['Tables']['tickets']['Update']
type Comment = Database['public']['Tables']['comments']['Row']
type CommentInsert = Database['public']['Tables']['comments']['Insert']
type User = Database['public']['Tables']['users']['Row']

export class TicketService {
  // Get all tickets with related data
  static async getTickets(filters: any = {}) {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    let query = supabase
      .from('tickets')
      .select(`
        *,
        requester:users!tickets_requester_id_fkey(*),
        assignee:users!tickets_assignee_id_fkey(*),
        organization:organizations(*)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }
    if (filters.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority)
    }
    if (filters.assignee && filters.assignee.length > 0) {
      query = query.in('assignee_id', filters.assignee)
    }
    if (filters.search) {
      query = query.or(`subject.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  // Get single ticket with all related data
  static async getTicket(id: string) {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        requester:users!tickets_requester_id_fkey(*),
        assignee:users!tickets_assignee_id_fkey(*),
        organization:organizations(*),
        comments(
          *,
          author:users(*)
        ),
        ticket_changes(
          *,
          agent:users(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Create new ticket
  static async createTicket(ticketData: TicketInsert) {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    console.log('Creating ticket with data:', ticketData)

    const { data, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select(`
        *,
        requester:users!tickets_requester_id_fkey(*),
        assignee:users!tickets_assignee_id_fkey(*)
      `)
      .single()

    if (error) {
      console.error('Error creating ticket:', error)
      throw error
    }

    console.log('Ticket created successfully:', data)
    return data
  }

  // Update ticket with change tracking
  static async updateTicket(id: string, updates: TicketUpdate) {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    // Get current ticket data for change tracking
    const { data: currentTicket } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        requester:users!tickets_requester_id_fkey(*),
        assignee:users!tickets_assignee_id_fkey(*)
      `)
      .single()

    if (error) throw error

    // Log changes for each updated field
    if (currentTicket) {
      const currentUser = await supabase.auth.getUser()
      if (currentUser.data.user) {
        for (const [field, newValue] of Object.entries(updates)) {
          const oldValue = currentTicket[field as keyof typeof currentTicket]
          if (oldValue !== newValue) {
            await this.logTicketChange({
              ticket_id: id,
              agent_id: currentUser.data.user.id,
              field_name: field,
              old_value: oldValue ? String(oldValue) : null,
              new_value: newValue ? String(newValue) : null,
              action: `Changed ${field} from ${oldValue || 'empty'} to ${newValue || 'empty'}`
            })
          }
        }
      }
    }

    return data
  }

  // Add comment to ticket
  static async addComment(commentData: CommentInsert) {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select(`
        *,
        author:users(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  // Get ticket comments
  static async getTicketComments(ticketId: string) {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users(*)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }

  // Log ticket change
  static async logTicketChange(changeData: {
    ticket_id: string
    agent_id: string
    field_name: string
    old_value?: string | null
    new_value?: string | null
    action: string
  }) {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('ticket_changes')
      .insert(changeData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Track ticket viewer with automatic cleanup
  static async trackViewer(ticketId: string, userId: string) {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('ticket_viewers')
      .upsert(
        { ticket_id: ticketId, user_id: userId, last_viewed: new Date().toISOString() },
        { onConflict: 'ticket_id,user_id' }
      )

    if (error) throw error
    return data
  }

  // Get current viewers (active in last 2 minutes)
  static async getTicketViewers(ticketId: string) {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    
    const { data, error } = await supabase
      .from('ticket_viewers')
      .select(`
        *,
        user:users(*)
      `)
      .eq('ticket_id', ticketId)
      .gte('last_viewed', twoMinutesAgo)

    if (error) throw error
    return data
  }

  // Get all agents
  static async getAgents() {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['admin', 'agent'])
      .order('name')

    if (error) throw error
    return data
  }

  // Assign ticket with detailed change tracking
  static async assignTicket(ticketId: string, assigneeId: string | null, agentId: string) {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    // Get current ticket data
    const { data: currentTicket } = await supabase
      .from('tickets')
      .select('assignee_id, assignee:users!tickets_assignee_id_fkey(*)')
      .eq('id', ticketId)
      .single()

    // Get new assignee data if assigning
    let newAssignee = null
    if (assigneeId) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', assigneeId)
        .single()
      newAssignee = data
    }

    // Update ticket
    const { data, error } = await this.updateTicket(ticketId, { assignee_id: assigneeId })
    if (error) throw error

    // Log the assignment change with detailed action
    const oldAssignee = currentTicket?.assignee
    let action = ''
    
    if (!oldAssignee && newAssignee) {
      action = `Assigned ticket to ${newAssignee.name}`
    } else if (oldAssignee && !newAssignee) {
      action = `Unassigned ticket from ${oldAssignee.name}`
    } else if (oldAssignee && newAssignee && oldAssignee.id !== newAssignee.id) {
      action = `Reassigned ticket from ${oldAssignee.name} to ${newAssignee.name}`
    }

    if (action) {
      await this.logTicketChange({
        ticket_id: ticketId,
        agent_id: agentId,
        field_name: 'assignee_id',
        old_value: oldAssignee?.id || null,
        new_value: assigneeId,
        action
      })
    }

    return data
  }

  // Clean up old viewers (older than 5 minutes)
  static async cleanupOldViewers() {
    if (!supabase) {
      return
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    const { error } = await supabase
      .from('ticket_viewers')
      .delete()
      .lt('last_viewed', fiveMinutesAgo)

    if (error) console.error('Error cleaning up old viewers:', error)
  }
}