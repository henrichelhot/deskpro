export type TicketStatus = 'new' | 'open' | 'pending' | 'on-hold' | 'solved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type SatisfactionRating = 'offered' | 'unoffered' | 'good' | 'bad';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'agent' | 'customer';
  isOnline?: boolean;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  satisfaction: SatisfactionRating;
  requester: User;
  assignee?: User;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
  customFields?: Record<string, any>;
}

export interface Comment {
  id: string;
  ticketId: string;
  author: User;
  content: string;
  isInternal: boolean;
  createdAt: Date;
  attachments?: string[];
}

export interface TicketChange {
  id: string;
  ticketId: string;
  agent: User;
  action: string;
  timestamp: Date;
  field: string;
  oldValue: any;
  newValue: any;
}

export interface FilterOptions {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  assignee?: string[];
  requester?: string[];
  satisfaction?: SatisfactionRating[];
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortOptions {
  field: keyof Ticket;
  direction: 'asc' | 'desc';
}