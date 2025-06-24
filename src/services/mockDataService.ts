import { Database } from '../types/database'

type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  requester: Database['public']['Tables']['users']['Row']
  assignee?: Database['public']['Tables']['users']['Row'] | null
  organization?: Database['public']['Tables']['organizations']['Row'] | null
  brand?: Database['public']['Tables']['brands']['Row'] | null
  airline?: Database['public']['Tables']['airlines']['Row'] | null
  supplier?: Database['public']['Tables']['suppliers']['Row'] | null
  inbox?: Database['public']['Tables']['inboxes']['Row'] | null
  comments?: (Database['public']['Tables']['comments']['Row'] & {
    author: Database['public']['Tables']['users']['Row']
  })[]
  ticket_changes?: (Database['public']['Tables']['ticket_changes']['Row'] & {
    agent: Database['public']['Tables']['users']['Row']
  })[]
}

// Storage keys for localStorage
const STORAGE_KEYS = {
  USERS: 'mock_users_data',
  TICKETS: 'mock_tickets_data',
  VIEWERS: 'mock_viewers_data',
  BRANDS: 'mock_brands_data',
  AIRLINES: 'mock_airlines_data',
  SUPPLIERS: 'mock_suppliers_data',
  INBOXES: 'mock_inboxes_data'
}

// Default users that should always exist
const DEFAULT_USERS = [
  {
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
  {
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
  {
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
  {
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
]

// Default brands
const DEFAULT_BRANDS = [
  {
    id: 'brand-1',
    name: 'ServiceDesk Pro',
    description: 'Main support brand for customer service',
    logo_url: null,
    primary_color: '#2563eb',
    secondary_color: '#64748b',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'brand-2',
    name: 'Enterprise Support',
    description: 'Dedicated support for enterprise clients',
    logo_url: null,
    primary_color: '#7c3aed',
    secondary_color: '#6b7280',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Default airlines
const DEFAULT_AIRLINES = [
  {
    id: 'airline-1',
    name: 'Air Canada',
    email: 'support@aircanada.ca',
    code: 'AC',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'airline-2',
    name: 'WestJet',
    email: 'customer.service@westjet.com',
    code: 'WS',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'airline-3',
    name: 'ITA Airways',
    email: 'changes@itaairways.com',
    code: 'AZ',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Default suppliers
const DEFAULT_SUPPLIERS = [
  {
    id: 'supplier-1',
    name: 'Hotel Booking Solutions',
    email: 'support@hotelbooking.com',
    contact_person: 'John Smith',
    phone: '+1-800-HOTELS',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'supplier-2',
    name: 'Car Rental Partners',
    email: 'partners@carrental.com',
    contact_person: 'Sarah Johnson',
    phone: '+1-800-RENTAL',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'supplier-3',
    name: 'Travel Insurance Co',
    email: 'claims@travelinsurance.com',
    contact_person: 'Mike Wilson',
    phone: '+1-800-INSURE',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Default inboxes
const DEFAULT_INBOXES = [
  {
    id: 'inbox-1',
    name: 'General Support',
    description: 'Main support inbox for customer inquiries',
    provider: 'gmail' as const,
    email_address: 'support@company.com',
    brand_id: 'brand-1',
    is_active: true,
    settings: {
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: {
        user: 'support@company.com',
        pass: '[ENCRYPTED]'
      },
      auto_reply: true,
      signature: 'Best regards,\nSupport Team'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inbox-2',
    name: 'Enterprise Support',
    description: 'Dedicated inbox for enterprise client support',
    provider: 'outlook' as const,
    email_address: 'enterprise@company.com',
    brand_id: 'brand-2',
    is_active: true,
    settings: {
      host: 'outlook.office365.com',
      port: 993,
      secure: true,
      auth: {
        user: 'enterprise@company.com',
        pass: '[ENCRYPTED]'
      },
      auto_reply: false,
      signature: 'Best regards,\nEnterprise Support Team'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inbox-3',
    name: 'Airline Bookings',
    description: 'Dedicated inbox for airline booking issues',
    provider: 'imap' as const,
    email_address: 'bookings@company.com',
    brand_id: null,
    is_active: true,
    settings: {
      host: 'mail.company.com',
      port: 993,
      secure: true,
      auth: {
        user: 'bookings@company.com',
        pass: '[ENCRYPTED]'
      },
      auto_reply: true,
      signature: 'Best regards,\nBooking Support Team'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Initialize functions for all data types
const initializeUsers = (): Map<string, any> => {
  const usersMap = new Map()
  
  // Always start with default users
  DEFAULT_USERS.forEach(user => {
    usersMap.set(user.id, user)
  })
  
  // Try to load additional users from localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS)
    if (stored) {
      const parsedUsers = JSON.parse(stored)
      console.log('Loading additional users from localStorage:', parsedUsers)
      
      // Add any additional users that aren't defaults
      Object.entries(parsedUsers).forEach(([id, user]: [string, any]) => {
        if (!usersMap.has(id)) {
          usersMap.set(id, user)
        }
      })
    }
  } catch (error) {
    console.error('Error loading users from localStorage:', error)
  }
  
  // Save the current state to localStorage
  saveUsersToStorage(usersMap)
  console.log('Initialized users:', Array.from(usersMap.values()))
  return usersMap
}

const initializeBrands = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BRANDS)
    if (stored) {
      const parsedBrands = JSON.parse(stored)
      console.log('Loaded brands from localStorage:', parsedBrands)
      return parsedBrands
    }
  } catch (error) {
    console.error('Error loading brands from localStorage:', error)
  }
  
  saveBrandsToStorage(DEFAULT_BRANDS)
  return DEFAULT_BRANDS
}

const initializeAirlines = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AIRLINES)
    if (stored) {
      const parsedAirlines = JSON.parse(stored)
      console.log('Loaded airlines from localStorage:', parsedAirlines)
      return parsedAirlines
    }
  } catch (error) {
    console.error('Error loading airlines from localStorage:', error)
  }
  
  saveAirlinesToStorage(DEFAULT_AIRLINES)
  return DEFAULT_AIRLINES
}

const initializeSuppliers = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIERS)
    if (stored) {
      const parsedSuppliers = JSON.parse(stored)
      console.log('Loaded suppliers from localStorage:', parsedSuppliers)
      return parsedSuppliers
    }
  } catch (error) {
    console.error('Error loading suppliers from localStorage:', error)
  }
  
  saveSuppliersToStorage(DEFAULT_SUPPLIERS)
  return DEFAULT_SUPPLIERS
}

const initializeInboxes = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INBOXES)
    if (stored) {
      const parsedInboxes = JSON.parse(stored)
      console.log('Loaded inboxes from localStorage:', parsedInboxes)
      return parsedInboxes
    }
  } catch (error) {
    console.error('Error loading inboxes from localStorage:', error)
  }
  
  saveInboxesToStorage(DEFAULT_INBOXES)
  return DEFAULT_INBOXES
}

// Save functions
const saveUsersToStorage = (usersMap: Map<string, any>) => {
  try {
    const usersObject: any = {}
    usersMap.forEach((user, id) => {
      usersObject[id] = user
    })
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersObject))
    console.log('Saved users to localStorage:', usersObject)
  } catch (error) {
    console.error('Error saving users to localStorage:', error)
  }
}

const saveBrandsToStorage = (brands: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands))
    console.log('Saved brands to localStorage:', brands.length, 'brands')
  } catch (error) {
    console.error('Error saving brands to localStorage:', error)
  }
}

const saveAirlinesToStorage = (airlines: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.AIRLINES, JSON.stringify(airlines))
    console.log('Saved airlines to localStorage:', airlines.length, 'airlines')
  } catch (error) {
    console.error('Error saving airlines to localStorage:', error)
  }
}

const saveSuppliersToStorage = (suppliers: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers))
    console.log('Saved suppliers to localStorage:', suppliers.length, 'suppliers')
  } catch (error) {
    console.error('Error saving suppliers to localStorage:', error)
  }
}

const saveInboxesToStorage = (inboxes: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.INBOXES, JSON.stringify(inboxes))
    console.log('Saved inboxes to localStorage:', inboxes.length, 'inboxes')
  } catch (error) {
    console.error('Error saving inboxes to localStorage:', error)
  }
}

// Initialize the data
let MOCK_USERS_MAP = initializeUsers()
let MOCK_BRANDS = initializeBrands()
let MOCK_AIRLINES = initializeAirlines()
let MOCK_SUPPLIERS = initializeSuppliers()
let MOCK_INBOXES = initializeInboxes()

const MOCK_ORGANIZATION = {
  id: 'mock-org-1',
  name: 'Demo Company',
  domain: 'company.com',
  settings: { support_hours: '9AM-5PM', timezone: 'UTC' },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Initialize viewers from localStorage or use empty object
const initializeViewers = (): { [ticketId: string]: { id: string; ticket_id: string; user_id: string; last_viewed: string; user: any }[] } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VIEWERS)
    if (stored) {
      const parsedViewers = JSON.parse(stored)
      console.log('Loaded viewers from localStorage:', parsedViewers)
      return parsedViewers
    }
  } catch (error) {
    console.error('Error loading viewers from localStorage:', error)
  }
  return {}
}

// Save viewers to localStorage
const saveViewersToStorage = (viewers: any) => {
  try {
    localStorage.setItem(STORAGE_KEYS.VIEWERS, JSON.stringify(viewers))
    console.log('Saved viewers to localStorage:', viewers)
  } catch (error) {
    console.error('Error saving viewers to localStorage:', error)
  }
}

// Mock viewers storage with persistence
let MOCK_VIEWERS = initializeViewers()

// Initialize tickets from localStorage or use defaults
const initializeTickets = (): Ticket[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TICKETS)
    if (stored) {
      const parsedTickets = JSON.parse(stored)
      console.log('Loaded tickets from localStorage:', parsedTickets)
      
      // Ensure all tickets have proper structure with related entities
      const processedTickets = parsedTickets.map((ticket: any) => {
        // Ensure we have all required fields
        const processedTicket = {
          ...ticket,
          // Ensure we have the new fields
          category: ticket.category || 'service',
          brand_id: ticket.brand_id || null,
          airline_id: ticket.airline_id || null,
          supplier_id: ticket.supplier_id || null,
          inbox_id: ticket.inbox_id || null,
          // Ensure we have related entities
          requester: ticket.requester || MOCK_USERS_MAP.get(ticket.requester_id) || MOCK_USERS_MAP.get('mock-customer-1'),
          assignee: ticket.assignee || (ticket.assignee_id ? MOCK_USERS_MAP.get(ticket.assignee_id) : null),
          organization: ticket.organization || MOCK_ORGANIZATION,
          brand: ticket.brand || (ticket.brand_id ? MOCK_BRANDS.find(b => b.id === ticket.brand_id) : null),
          airline: ticket.airline || (ticket.airline_id ? MOCK_AIRLINES.find(a => a.id === ticket.airline_id) : null),
          supplier: ticket.supplier || (ticket.supplier_id ? MOCK_SUPPLIERS.find(s => s.id === ticket.supplier_id) : null),
          inbox: ticket.inbox || (ticket.inbox_id ? MOCK_INBOXES.find(i => i.id === ticket.inbox_id) : null),
          comments: ticket.comments || [],
          ticket_changes: ticket.ticket_changes || []
        }
        
        return processedTicket
      })
      
      // Save the processed tickets back to ensure consistency
      saveTicketsToStorage(processedTickets)
      return processedTickets
    }
  } catch (error) {
    console.error('Error loading tickets from localStorage:', error)
  }
  
  // Use default tickets
  const defaultTickets = [
    {
      id: 'mock-ticket-1',
      ticket_number: 'DEMO-001',
      subject: 'Login Issues with Password Reset',
      description: 'I am having trouble logging into my account. The password reset email is not arriving in my inbox.',
      status: 'open',
      priority: 'high',
      satisfaction: 'unoffered',
      category: 'service',
      requester_id: 'mock-customer-1',
      assignee_id: 'mock-agent-1',
      organization_id: 'mock-org-1',
      brand_id: 'brand-1',
      airline_id: null,
      supplier_id: null,
      inbox_id: 'inbox-1',
      due_date: null,
      tags: ['login', 'password', 'email'],
      custom_fields: {},
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      requester: MOCK_USERS_MAP.get('mock-customer-1')!,
      assignee: MOCK_USERS_MAP.get('mock-agent-1')!,
      organization: MOCK_ORGANIZATION,
      brand: MOCK_BRANDS.find(b => b.id === 'brand-1')!,
      airline: null,
      supplier: null,
      inbox: MOCK_INBOXES.find(i => i.id === 'inbox-1')!,
      comments: [
        {
          id: 'mock-comment-1',
          ticket_id: 'mock-ticket-1',
          author_id: 'mock-agent-1',
          content: 'I have checked your account and can see the issue. Let me reset your password manually and send you a new temporary password.',
          is_internal: false,
          attachments: [],
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          author: MOCK_USERS_MAP.get('mock-agent-1')!
        },
        {
          id: 'mock-comment-2',
          ticket_id: 'mock-ticket-1',
          author_id: 'mock-customer-1',
          content: 'Thank you for the quick response! I received the temporary password and was able to log in successfully.',
          is_internal: false,
          attachments: [],
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          author: MOCK_USERS_MAP.get('mock-customer-1')!
        }
      ],
      ticket_changes: [
        {
          id: 'mock-change-1',
          ticket_id: 'mock-ticket-1',
          agent_id: 'mock-agent-1',
          field_name: 'status',
          old_value: 'new',
          new_value: 'open',
          action: 'Status changed from New to Open',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          agent: MOCK_USERS_MAP.get('mock-agent-1')!
        },
        {
          id: 'mock-change-1a',
          ticket_id: 'mock-ticket-1',
          agent_id: 'mock-agent-1',
          field_name: 'assignee_id',
          old_value: null,
          new_value: 'mock-agent-1',
          action: 'Assigned ticket to Mohamed Hasanen',
          created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          agent: MOCK_USERS_MAP.get('mock-agent-1')!
        },
        {
          id: 'mock-change-1b',
          ticket_id: 'mock-ticket-1',
          agent_id: 'mock-agent-1',
          field_name: 'priority',
          old_value: 'normal',
          new_value: 'high',
          action: 'Priority changed from Normal to High',
          created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
          agent: MOCK_USERS_MAP.get('mock-agent-1')!
        }
      ]
    },
    {
      id: 'mock-ticket-2',
      ticket_number: 'DEMO-002',
      subject: 'Feature Request: Dark Mode',
      description: 'It would be great to have a dark mode option in the application for better user experience during night time usage.',
      status: 'new',
      priority: 'normal',
      satisfaction: 'unoffered',
      category: 'service',
      requester_id: 'mock-customer-1',
      assignee_id: null,
      organization_id: 'mock-org-1',
      brand_id: 'brand-2',
      airline_id: null,
      supplier_id: null,
      inbox_id: 'inbox-2',
      due_date: null,
      tags: ['feature-request', 'ui', 'dark-mode'],
      custom_fields: {},
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      requester: MOCK_USERS_MAP.get('mock-customer-1')!,
      assignee: null,
      organization: MOCK_ORGANIZATION,
      brand: MOCK_BRANDS.find(b => b.id === 'brand-2')!,
      airline: null,
      supplier: null,
      inbox: MOCK_INBOXES.find(i => i.id === 'inbox-2')!,
      comments: [],
      ticket_changes: []
    },
    {
      id: 'mock-ticket-3',
      ticket_number: 'DEMO-003',
      subject: 'Flight Booking Modification Request',
      description: 'Customer needs assistance with flight booking modification for ITA Airways flight',
      status: 'on-hold',
      priority: 'normal',
      satisfaction: 'unoffered',
      category: 'airline',
      requester_id: 'mock-customer-1',
      assignee_id: 'mock-agent-1',
      organization_id: 'mock-org-1',
      brand_id: 'brand-1',
      airline_id: 'airline-3',
      supplier_id: null,
      inbox_id: 'inbox-3',
      due_date: null,
      tags: ['booking', 'modification', 'flight'],
      custom_fields: { booking_id: '274721731' },
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      requester: MOCK_USERS_MAP.get('mock-customer-1')!,
      assignee: MOCK_USERS_MAP.get('mock-agent-1')!,
      organization: MOCK_ORGANIZATION,
      brand: MOCK_BRANDS.find(b => b.id === 'brand-1')!,
      airline: MOCK_AIRLINES.find(a => a.id === 'airline-3')!,
      supplier: null,
      inbox: MOCK_INBOXES.find(i => i.id === 'inbox-3')!,
      comments: [
        {
          id: 'mock-comment-3',
          ticket_id: 'mock-ticket-3',
          author_id: 'mock-agent-1',
          content: 'I have reviewed the booking details and contacted the airline. They are requesting to change their flight date from March 15th to March 20th. Checking availability now.',
          is_internal: true,
          attachments: [],
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          author: MOCK_USERS_MAP.get('mock-agent-1')!
        }
      ],
      ticket_changes: [
        {
          id: 'mock-change-2',
          ticket_id: 'mock-ticket-3',
          agent_id: 'mock-agent-1',
          field_name: 'status',
          old_value: 'new',
          new_value: 'on-hold',
          action: 'Status changed from New to On-Hold',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          agent: MOCK_USERS_MAP.get('mock-agent-1')!
        },
        {
          id: 'mock-change-2a',
          ticket_id: 'mock-ticket-3',
          agent_id: 'mock-agent-1',
          field_name: 'assignee_id',
          old_value: null,
          new_value: 'mock-agent-1',
          action: 'Assigned ticket to Mohamed Hasanen',
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          agent: MOCK_USERS_MAP.get('mock-agent-1')!
        }
      ]
    },
    {
      id: 'mock-ticket-4',
      ticket_number: 'DEMO-004',
      subject: 'Hotel Booking Issue - Room Not Available',
      description: 'Customer booked a hotel room but received notification that the room type is no longer available. Need to find alternative accommodation.',
      status: 'open',
      priority: 'high',
      satisfaction: 'unoffered',
      category: 'supplier',
      requester_id: 'mock-customer-1',
      assignee_id: 'mock-agent-2',
      organization_id: 'mock-org-1',
      brand_id: 'brand-1',
      airline_id: null,
      supplier_id: 'supplier-1',
      inbox_id: 'inbox-1',
      due_date: null,
      tags: ['hotel', 'booking', 'accommodation'],
      custom_fields: { booking_reference: 'HTL-789456' },
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      requester: MOCK_USERS_MAP.get('mock-customer-1')!,
      assignee: MOCK_USERS_MAP.get('mock-agent-2')!,
      organization: MOCK_ORGANIZATION,
      brand: MOCK_BRANDS.find(b => b.id === 'brand-1')!,
      airline: null,
      supplier: MOCK_SUPPLIERS.find(s => s.id === 'supplier-1')!,
      inbox: MOCK_INBOXES.find(i => i.id === 'inbox-1')!,
      comments: [],
      ticket_changes: []
    }
  ]
  
  saveTicketsToStorage(defaultTickets)
  return defaultTickets
}

// Save tickets to localStorage
const saveTicketsToStorage = (tickets: Ticket[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets))
    console.log('Saved tickets to localStorage:', tickets.length, 'tickets')
  } catch (error) {
    console.error('Error saving tickets to localStorage:', error)
  }
}

let MOCK_TICKETS: Ticket[] = initializeTickets()

export class MockDataService {
  // Force re-initialization of users (useful when data gets corrupted)
  static reinitializeUsers() {
    console.log('Reinitializing users...')
    MOCK_USERS_MAP = initializeUsers()
    return Array.from(MOCK_USERS_MAP.values())
  }

  static getTickets(filters: any = {}) {
    let tickets = [...MOCK_TICKETS]
    
    // Apply filters
    if (filters.status && filters.status.length > 0) {
      tickets = tickets.filter(ticket => filters.status.includes(ticket.status))
    }
    
    if (filters.priority && filters.priority.length > 0) {
      tickets = tickets.filter(ticket => filters.priority.includes(ticket.priority))
    }

    if (filters.category && filters.category.length > 0) {
      tickets = tickets.filter(ticket => filters.category.includes(ticket.category))
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      tickets = tickets.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.ticket_number.toLowerCase().includes(searchLower) ||
        ticket.requester.name.toLowerCase().includes(searchLower)
      )
    }
    
    console.log('MockDataService.getTickets() - Returning tickets:', tickets.length)
    return Promise.resolve(tickets)
  }
  
  static getTicket(id: string) {
    const ticket = MOCK_TICKETS.find(t => t.id === id)
    return Promise.resolve(ticket || null)
  }

  // Find ticket by ticket number
  static getTicketByNumber(ticketNumber: string) {
    const ticket = MOCK_TICKETS.find(t => t.ticket_number === ticketNumber)
    return Promise.resolve(ticket || null)
  }
  
  static getAgents() {
    console.log('MockDataService.getAgents() called')
    console.log('Current MOCK_USERS_MAP size:', MOCK_USERS_MAP.size)
    console.log('All users in map:', Array.from(MOCK_USERS_MAP.entries()))
    
    // Ensure we have the default users
    if (MOCK_USERS_MAP.size === 0) {
      console.log('Users map is empty, reinitializing...')
      MOCK_USERS_MAP = initializeUsers()
    }
    
    // Get all users with agent or admin role
    const agents = Array.from(MOCK_USERS_MAP.values()).filter(user => 
      user && (user.role === 'agent' || user.role === 'admin')
    )
    
    console.log('Filtered agents:', agents)
    console.log('Returning agents count:', agents.length)
    
    return Promise.resolve(agents)
  }

  // Brands management
  static getBrands() {
    return Promise.resolve([...MOCK_BRANDS])
  }

  static createBrand(brandData: any) {
    const newBrand = {
      id: `brand-${Date.now()}`,
      ...brandData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    MOCK_BRANDS.push(newBrand)
    saveBrandsToStorage(MOCK_BRANDS)
    
    return Promise.resolve(newBrand)
  }

  static updateBrand(brandId: string, updates: any) {
    const brandIndex = MOCK_BRANDS.findIndex(b => b.id === brandId)
    if (brandIndex !== -1) {
      MOCK_BRANDS[brandIndex] = {
        ...MOCK_BRANDS[brandIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      saveBrandsToStorage(MOCK_BRANDS)
      return Promise.resolve(MOCK_BRANDS[brandIndex])
    }
    return Promise.reject(new Error('Brand not found'))
  }

  static deleteBrand(brandId: string) {
    const brandIndex = MOCK_BRANDS.findIndex(b => b.id === brandId)
    if (brandIndex !== -1) {
      MOCK_BRANDS.splice(brandIndex, 1)
      saveBrandsToStorage(MOCK_BRANDS)
      return Promise.resolve(true)
    }
    return Promise.reject(new Error('Brand not found'))
  }

  // Airlines management
  static getAirlines() {
    return Promise.resolve([...MOCK_AIRLINES])
  }

  static createAirline(airlineData: any) {
    const newAirline = {
      id: `airline-${Date.now()}`,
      ...airlineData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    MOCK_AIRLINES.push(newAirline)
    saveAirlinesToStorage(MOCK_AIRLINES)
    
    return Promise.resolve(newAirline)
  }

  static updateAirline(airlineId: string, updates: any) {
    const airlineIndex = MOCK_AIRLINES.findIndex(a => a.id === airlineId)
    if (airlineIndex !== -1) {
      MOCK_AIRLINES[airlineIndex] = {
        ...MOCK_AIRLINES[airlineIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      saveAirlinesToStorage(MOCK_AIRLINES)
      return Promise.resolve(MOCK_AIRLINES[airlineIndex])
    }
    return Promise.reject(new Error('Airline not found'))
  }

  static deleteAirline(airlineId: string) {
    const airlineIndex = MOCK_AIRLINES.findIndex(a => a.id === airlineId)
    if (airlineIndex !== -1) {
      MOCK_AIRLINES.splice(airlineIndex, 1)
      saveAirlinesToStorage(MOCK_AIRLINES)
      return Promise.resolve(true)
    }
    return Promise.reject(new Error('Airline not found'))
  }

  // Suppliers management
  static getSuppliers() {
    return Promise.resolve([...MOCK_SUPPLIERS])
  }

  static createSupplier(supplierData: any) {
    const newSupplier = {
      id: `supplier-${Date.now()}`,
      ...supplierData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    MOCK_SUPPLIERS.push(newSupplier)
    saveSuppliersToStorage(MOCK_SUPPLIERS)
    
    return Promise.resolve(newSupplier)
  }

  static updateSupplier(supplierId: string, updates: any) {
    const supplierIndex = MOCK_SUPPLIERS.findIndex(s => s.id === supplierId)
    if (supplierIndex !== -1) {
      MOCK_SUPPLIERS[supplierIndex] = {
        ...MOCK_SUPPLIERS[supplierIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      saveSuppliersToStorage(MOCK_SUPPLIERS)
      return Promise.resolve(MOCK_SUPPLIERS[supplierIndex])
    }
    return Promise.reject(new Error('Supplier not found'))
  }

  static deleteSupplier(supplierId: string) {
    const supplierIndex = MOCK_SUPPLIERS.findIndex(s => s.id === supplierId)
    if (supplierIndex !== -1) {
      MOCK_SUPPLIERS.splice(supplierIndex, 1)
      saveSuppliersToStorage(MOCK_SUPPLIERS)
      return Promise.resolve(true)
    }
    return Promise.reject(new Error('Supplier not found'))
  }

  // Inboxes management
  static getInboxes() {
    return Promise.resolve(MOCK_INBOXES.map(inbox => ({
      ...inbox,
      brand: inbox.brand_id ? MOCK_BRANDS.find(b => b.id === inbox.brand_id) : null
    })))
  }

  static createInbox(inboxData: any) {
    const newInbox = {
      id: `inbox-${Date.now()}`,
      ...inboxData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    MOCK_INBOXES.push(newInbox)
    saveInboxesToStorage(MOCK_INBOXES)
    
    return Promise.resolve({
      ...newInbox,
      brand: newInbox.brand_id ? MOCK_BRANDS.find(b => b.id === newInbox.brand_id) : null
    })
  }

  static updateInbox(inboxId: string, updates: any) {
    const inboxIndex = MOCK_INBOXES.findIndex(i => i.id === inboxId)
    if (inboxIndex !== -1) {
      MOCK_INBOXES[inboxIndex] = {
        ...MOCK_INBOXES[inboxIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      saveInboxesToStorage(MOCK_INBOXES)
      
      return Promise.resolve({
        ...MOCK_INBOXES[inboxIndex],
        brand: MOCK_INBOXES[inboxIndex].brand_id ? MOCK_BRANDS.find(b => b.id === MOCK_INBOXES[inboxIndex].brand_id) : null
      })
    }
    return Promise.reject(new Error('Inbox not found'))
  }

  static deleteInbox(inboxId: string) {
    const inboxIndex = MOCK_INBOXES.findIndex(i => i.id === inboxId)
    if (inboxIndex !== -1) {
      MOCK_INBOXES.splice(inboxIndex, 1)
      saveInboxesToStorage(MOCK_INBOXES)
      return Promise.resolve(true)
    }
    return Promise.reject(new Error('Inbox not found'))
  }

  static testInboxConnection(inboxData: any) {
    // Simulate connection test
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Connection successful',
          details: {
            server: inboxData.settings?.host || 'Unknown',
            port: inboxData.settings?.port || 'Unknown',
            secure: inboxData.settings?.secure || false
          }
        })
      }, 2000)
    })
  }

  static getInboxStats(inboxId: string) {
    const tickets = MOCK_TICKETS.filter(t => t.inbox_id === inboxId)
    
    const stats = {
      total: tickets.length,
      new: tickets.filter(t => t.status === 'new').length,
      open: tickets.filter(t => t.status === 'open').length,
      solved: tickets.filter(t => t.status === 'solved').length,
      thisWeek: tickets.filter(t => {
        const created = new Date(t.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return created > weekAgo
      }).length
    }

    return Promise.resolve(stats)
  }

  static syncInboxEmails(inboxId: string) {
    // Import the EmailProcessingService here to avoid circular dependency
    return import('./emailProcessingService').then(({ EmailProcessingService }) => {
      return EmailProcessingService.simulateEmailProcessing(inboxId, true)
        .then(results => ({
          success: true,
          processed: results.length,
          newTickets: results.filter(r => r.isNewTicket).length,
          updatedTickets: results.filter(r => !r.isNewTicket).length,
          errors: 0,
          details: results
        }))
    })
  }

  static createAgent(agentData: any) {
    console.log('MockDataService.createAgent() called with:', agentData)
    
    const newAgent = {
      id: `mock-agent-${Date.now()}`,
      name: agentData.name,
      email: agentData.email,
      role: agentData.role,
      avatar_url: null,
      is_online: false,
      last_seen: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Add to MOCK_USERS_MAP
    MOCK_USERS_MAP.set(newAgent.id, newAgent)
    
    // Save to localStorage
    saveUsersToStorage(MOCK_USERS_MAP)
    
    console.log('MockDataService.createAgent() created:', newAgent)
    console.log('MockDataService.createAgent() - Total users now:', MOCK_USERS_MAP.size)
    
    return Promise.resolve(newAgent)
  }

  static updateAgent(agentId: string, updates: any) {
    console.log('MockDataService.updateAgent() called:', agentId, updates)
    
    const existingAgent = MOCK_USERS_MAP.get(agentId)
    if (existingAgent) {
      const updatedAgent = {
        ...existingAgent,
        ...updates,
        updated_at: new Date().toISOString()
      }
      MOCK_USERS_MAP.set(agentId, updatedAgent)
      
      // Save to localStorage
      saveUsersToStorage(MOCK_USERS_MAP)
      
      console.log('MockDataService.updateAgent() updated:', agentId, updates)
      return Promise.resolve(updatedAgent)
    }
    return Promise.reject(new Error('Agent not found'))
  }

  static deleteAgent(agentId: string) {
    console.log('MockDataService.deleteAgent() called:', agentId)
    
    if (MOCK_USERS_MAP.has(agentId)) {
      MOCK_USERS_MAP.delete(agentId)
      
      // Save to localStorage
      saveUsersToStorage(MOCK_USERS_MAP)
      
      console.log('MockDataService.deleteAgent() deleted:', agentId)
      console.log('MockDataService.deleteAgent() - Total users now:', MOCK_USERS_MAP.size)
      return Promise.resolve(true)
    }
    return Promise.reject(new Error('Agent not found'))
  }
  
  static updateTicket(id: string, updates: any) {
    const ticketIndex = MOCK_TICKETS.findIndex(t => t.id === id)
    if (ticketIndex !== -1) {
      const oldTicket = { ...MOCK_TICKETS[ticketIndex] }
      MOCK_TICKETS[ticketIndex] = { ...MOCK_TICKETS[ticketIndex], ...updates, updated_at: new Date().toISOString() }
      
      // Add change tracking for each updated field
      for (const [field, newValue] of Object.entries(updates)) {
        const oldValue = oldTicket[field as keyof typeof oldTicket]
        if (oldValue !== newValue) {
          const change = {
            id: `mock-change-${Date.now()}-${field}`,
            ticket_id: id,
            agent_id: 'mock-admin-1', // Current user in demo (admin for testing)
            field_name: field,
            old_value: oldValue ? String(oldValue) : null,
            new_value: newValue ? String(newValue) : null,
            action: `Changed ${field} from ${oldValue || 'empty'} to ${newValue || 'empty'}`,
            created_at: new Date().toISOString(),
            agent: MOCK_USERS_MAP.get('mock-admin-1')!
          }
          
          if (!MOCK_TICKETS[ticketIndex].ticket_changes) {
            MOCK_TICKETS[ticketIndex].ticket_changes = []
          }
          MOCK_TICKETS[ticketIndex].ticket_changes!.unshift(change)
        }
      }
      
      // Save to localStorage
      saveTicketsToStorage(MOCK_TICKETS)
      
      return Promise.resolve(MOCK_TICKETS[ticketIndex])
    }
    return Promise.reject(new Error('Ticket not found'))
  }
  
  static createTicket(ticketData: any) {
    console.log('MockDataService: Creating ticket with data:', ticketData)
    
    // Get related entities
    const brand = ticketData.brand_id ? MOCK_BRANDS.find(b => b.id === ticketData.brand_id) : null
    const airline = ticketData.airline_id ? MOCK_AIRLINES.find(a => a.id === ticketData.airline_id) : null
    const supplier = ticketData.supplier_id ? MOCK_SUPPLIERS.find(s => s.id === ticketData.supplier_id) : null
    const inbox = ticketData.inbox_id ? MOCK_INBOXES.find(i => i.id === ticketData.inbox_id) : null
    
    // Ensure we have a valid requester
    let requester = MOCK_USERS_MAP.get(ticketData.requester_id)
    if (!requester) {
      // Create a new customer user if not found
      requester = {
        id: ticketData.requester_id,
        name: ticketData.requester_name || 'Unknown Customer',
        email: ticketData.requester_email || 'unknown@customer.com',
        role: 'customer' as const,
        avatar_url: null,
        is_online: false,
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      MOCK_USERS_MAP.set(requester.id, requester)
      saveUsersToStorage(MOCK_USERS_MAP)
    }
    
    const newTicket: Ticket = {
      id: `mock-ticket-${Date.now()}`,
      ticket_number: `DEMO-${String(MOCK_TICKETS.length + 1).padStart(3, '0')}`,
      subject: ticketData.subject,
      description: ticketData.description,
      status: ticketData.status || 'new',
      priority: ticketData.priority || 'normal',
      satisfaction: ticketData.satisfaction || 'unoffered',
      category: ticketData.category || 'service',
      requester_id: ticketData.requester_id,
      assignee_id: ticketData.assignee_id || null,
      organization_id: 'mock-org-1',
      brand_id: ticketData.brand_id || null,
      airline_id: ticketData.airline_id || null,
      supplier_id: ticketData.supplier_id || null,
      inbox_id: ticketData.inbox_id || null,
      due_date: ticketData.due_date || null,
      tags: ticketData.tags || [],
      custom_fields: ticketData.custom_fields || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      requester: requester,
      assignee: ticketData.assignee_id ? MOCK_USERS_MAP.get(ticketData.assignee_id) || null : null,
      organization: MOCK_ORGANIZATION,
      brand,
      airline,
      supplier,
      inbox,
      comments: [],
      ticket_changes: []
    }
    
    console.log('MockDataService: Created new ticket:', newTicket)
    
    MOCK_TICKETS.unshift(newTicket) // Add to beginning of array
    
    // Save to localStorage
    saveTicketsToStorage(MOCK_TICKETS)
    
    console.log('MockDataService: Total tickets now:', MOCK_TICKETS.length)
    
    return Promise.resolve(newTicket)
  }
  
  static addComment(commentData: any) {
    const newComment = {
      id: `mock-comment-${Date.now()}`,
      ...commentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: MOCK_USERS_MAP.get(commentData.author_id)!
    }
    
    const ticketIndex = MOCK_TICKETS.findIndex(t => t.id === commentData.ticket_id)
    if (ticketIndex !== -1) {
      if (!MOCK_TICKETS[ticketIndex].comments) {
        MOCK_TICKETS[ticketIndex].comments = []
      }
      MOCK_TICKETS[ticketIndex].comments!.push(newComment)
      
      // Save to localStorage
      saveTicketsToStorage(MOCK_TICKETS)
    }
    
    return Promise.resolve(newComment)
  }
  
  static assignTicket(ticketId: string, assigneeId: string | null, agentId: string) {
    const ticketIndex = MOCK_TICKETS.findIndex(t => t.id === ticketId)
    if (ticketIndex !== -1) {
      const oldAssignee = MOCK_TICKETS[ticketIndex].assignee
      MOCK_TICKETS[ticketIndex].assignee_id = assigneeId
      MOCK_TICKETS[ticketIndex].assignee = assigneeId ? MOCK_USERS_MAP.get(assigneeId) || null : null
      MOCK_TICKETS[ticketIndex].updated_at = new Date().toISOString()
      
      // Add detailed change log
      let action = ''
      const newAssignee = assigneeId ? MOCK_USERS_MAP.get(assigneeId) : null
      
      if (!oldAssignee && newAssignee) {
        action = `Assigned ticket to ${newAssignee.name}`
      } else if (oldAssignee && !newAssignee) {
        action = `Unassigned ticket from ${oldAssignee.name}`
      } else if (oldAssignee && newAssignee && oldAssignee.id !== newAssignee.id) {
        action = `Reassigned ticket from ${oldAssignee.name} to ${newAssignee.name}`
      }
      
      if (action) {
        const change = {
          id: `mock-change-${Date.now()}`,
          ticket_id: ticketId,
          agent_id: agentId,
          field_name: 'assignee_id',
          old_value: oldAssignee?.id || null,
          new_value: assigneeId,
          action,
          created_at: new Date().toISOString(),
          agent: MOCK_USERS_MAP.get(agentId)!
        }
        
        if (!MOCK_TICKETS[ticketIndex].ticket_changes) {
          MOCK_TICKETS[ticketIndex].ticket_changes = []
        }
        MOCK_TICKETS[ticketIndex].ticket_changes!.unshift(change)
      }
      
      // Save to localStorage
      saveTicketsToStorage(MOCK_TICKETS)
      
      return Promise.resolve(MOCK_TICKETS[ticketIndex])
    }
    return Promise.reject(new Error('Ticket not found'))
  }
  
  static getTicketViewers(ticketId: string) {
    console.log('MockDataService.getTicketViewers() called for ticket:', ticketId)
    console.log('Current MOCK_VIEWERS:', MOCK_VIEWERS)
    
    // Clean up old viewers (older than 2 minutes)
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000
    if (MOCK_VIEWERS[ticketId]) {
      const beforeCount = MOCK_VIEWERS[ticketId].length
      MOCK_VIEWERS[ticketId] = MOCK_VIEWERS[ticketId].filter(viewer => 
        new Date(viewer.last_viewed).getTime() > twoMinutesAgo
      )
      const afterCount = MOCK_VIEWERS[ticketId].length
      
      if (beforeCount !== afterCount) {
        console.log(`Cleaned up ${beforeCount - afterCount} old viewers for ticket ${ticketId}`)
        saveViewersToStorage(MOCK_VIEWERS)
      }
    }
    
    const viewers = MOCK_VIEWERS[ticketId] || []
    console.log('MockDataService.getTicketViewers() returning:', viewers)
    return Promise.resolve(viewers)
  }
  
  static trackViewer(ticketId: string, userId: string) {
    console.log('MockDataService.trackViewer() called:', { ticketId, userId })
    
    if (!MOCK_VIEWERS[ticketId]) {
      MOCK_VIEWERS[ticketId] = []
    }
    
    // Get user data
    const user = MOCK_USERS_MAP.get(userId)
    if (!user) {
      console.error('User not found for viewer tracking:', userId)
      return Promise.reject(new Error('User not found'))
    }
    
    // Update or add viewer
    const existingViewerIndex = MOCK_VIEWERS[ticketId].findIndex(v => v.user_id === userId)
    const viewerData = {
      id: `viewer-${ticketId}-${userId}`,
      ticket_id: ticketId,
      user_id: userId,
      last_viewed: new Date().toISOString(),
      user: user
    }
    
    if (existingViewerIndex !== -1) {
      MOCK_VIEWERS[ticketId][existingViewerIndex] = viewerData
      console.log('Updated existing viewer:', viewerData)
    } else {
      MOCK_VIEWERS[ticketId].push(viewerData)
      console.log('Added new viewer:', viewerData)
    }
    
    // Save to localStorage
    saveViewersToStorage(MOCK_VIEWERS)
    
    console.log('MockDataService.trackViewer() - Current viewers for ticket:', MOCK_VIEWERS[ticketId])
    
    return Promise.resolve(viewerData)
  }

  // Utility method to reset all data (useful for testing)
  static resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.USERS)
    localStorage.removeItem(STORAGE_KEYS.TICKETS)
    localStorage.removeItem(STORAGE_KEYS.VIEWERS)
    localStorage.removeItem(STORAGE_KEYS.BRANDS)
    localStorage.removeItem(STORAGE_KEYS.AIRLINES)
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS)
    localStorage.removeItem(STORAGE_KEYS.INBOXES)
    
    MOCK_USERS_MAP = initializeUsers()
    MOCK_TICKETS = initializeTickets()
    MOCK_VIEWERS = {}
    MOCK_BRANDS = initializeBrands()
    MOCK_AIRLINES = initializeAirlines()
    MOCK_SUPPLIERS = initializeSuppliers()
    MOCK_INBOXES = initializeInboxes()
    
    console.log('All mock data has been reset')
  }

  // Debug method to check current state
  static debugState() {
    console.log('=== MockDataService Debug State ===')
    console.log('Users Map Size:', MOCK_USERS_MAP.size)
    console.log('All Users:', Array.from(MOCK_USERS_MAP.values()))
    console.log('Agents:', Array.from(MOCK_USERS_MAP.values()).filter(u => u.role === 'agent' || u.role === 'admin'))
    console.log('Tickets Count:', MOCK_TICKETS.length)
    console.log('Brands Count:', MOCK_BRANDS.length)
    console.log('Airlines Count:', MOCK_AIRLINES.length)
    console.log('Suppliers Count:', MOCK_SUPPLIERS.length)
    console.log('Inboxes Count:', MOCK_INBOXES.length)
    console.log('Viewers:', MOCK_VIEWERS)
    console.log('LocalStorage Users:', localStorage.getItem(STORAGE_KEYS.USERS))
    console.log('LocalStorage Viewers:', localStorage.getItem(STORAGE_KEYS.VIEWERS))
    console.log('===================================')
  }

  // Force refresh tickets from localStorage
  static refreshTickets() {
    console.log('MockDataService.refreshTickets() - Forcing refresh from localStorage')
    MOCK_TICKETS = initializeTickets()
    console.log('MockDataService.refreshTickets() - Refreshed tickets count:', MOCK_TICKETS.length)
    return Promise.resolve(MOCK_TICKETS)
  }
}