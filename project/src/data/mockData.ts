import { Ticket, User, Comment } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Mohamed Hasanen',
    email: 'mohamed.hasanen@company.com',
    role: 'agent',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Fares mohsen',
    email: 'fares.mohsen@company.com',
    role: 'agent',
    isOnline: true,
  },
  {
    id: '3',
    name: 'Summer Elashry',
    email: 'summer.elashry@company.com',
    role: 'agent',
    isOnline: false,
  },
  {
    id: '4',
    name: 'Mustafa Hussien',
    email: 'mustafa.hussien@company.com',
    role: 'agent',
    isOnline: true,
  },
  {
    id: '5',
    name: 'Mary Bisch',
    email: 'mary.bisch@customer.com',
    role: 'customer',
  },
  {
    id: '6',
    name: 'Ludlinep30',
    email: 'ludlinep30@customer.com',
    role: 'customer',
  },
  {
    id: '7',
    name: 'Rita Dandal',
    email: 'rita.dandal@customer.com',
    role: 'customer',
  },
  {
    id: '8',
    name: 'ITA AIRWAYS CHANGES AND REFUNDS',
    email: 'changes@itaairways.com',
    role: 'customer',
  },
];

export const mockTickets: Ticket[] = [
  {
    id: '27472173',
    subject: 'Call for Booking ID: 274721731 SID: CA42c0b349ce945d4f03d0fe...',
    description: 'Customer needs assistance with flight booking modification',
    status: 'on-hold',
    priority: 'normal',
    satisfaction: 'unoffered',
    requester: mockUsers[4],
    assignee: mockUsers[0],
    createdAt: new Date('2024-01-15T08:41:00'),
    updatedAt: new Date('2024-01-15T08:41:00'),
    tags: ['booking', 'modification'],
  },
  {
    id: '25829825',
    subject: 'Call for Booking ID: 258298251 SID: CA43ca9310c123254aa22e7f...',
    description: 'Flight cancellation request and refund inquiry',
    status: 'on-hold',
    priority: 'high',
    satisfaction: 'unoffered',
    requester: mockUsers[5],
    assignee: mockUsers[1],
    createdAt: new Date('2024-01-15T08:39:00'),
    updatedAt: new Date('2024-01-15T08:39:00'),
    tags: ['cancellation', 'refund'],
  },
  {
    id: '27621394',
    subject: 'Call for Booking ID: 276213941 SID: CA72344f1e9ef0c6deac7a177...',
    description: 'Special assistance request for disabled passenger',
    status: 'on-hold',
    priority: 'high',
    satisfaction: 'unoffered',
    requester: mockUsers[6],
    assignee: mockUsers[2],
    createdAt: new Date('2024-01-15T08:33:00'),
    updatedAt: new Date('2024-01-15T08:33:00'),
    tags: ['special-assistance', 'disability'],
  },
  {
    id: '285C6Z',
    subject: '285C6Z // Medical waiver request // ITA airways',
    description: 'Medical documentation required for travel waiver',
    status: 'on-hold',
    priority: 'urgent',
    satisfaction: 'unoffered',
    requester: mockUsers[7],
    assignee: mockUsers[3],
    createdAt: new Date('2024-01-15T08:17:00'),
    updatedAt: new Date('2024-01-15T08:17:00'),
    tags: ['medical', 'waiver', 'documentation'],
  },
  {
    id: '27567818',
    subject: 'Call for Booking ID: 275678181 SID: CA146861654fc69dbfef9106...',
    description: 'Seat selection and meal preference changes',
    status: 'on-hold',
    priority: 'low',
    satisfaction: 'unoffered',
    requester: { id: '9', name: 'Dunia Paz', email: 'dunia.paz@customer.com', role: 'customer' },
    assignee: { id: '10', name: 'abdallah elsayed', email: 'abdallah.elsayed@company.com', role: 'agent' },
    createdAt: new Date('2024-01-15T08:16:00'),
    updatedAt: new Date('2024-01-15T08:16:00'),
    tags: ['seat-selection', 'meal'],
  },
];

export const mockComments: Comment[] = [
  {
    id: '1',
    ticketId: '27472173',
    author: mockUsers[0],
    content: 'I have reviewed the booking details and contacted the customer via phone. They are requesting to change their flight date from March 15th to March 20th. Checking availability now.',
    isInternal: true,
    createdAt: new Date('2024-01-15T09:00:00'),
  },
  {
    id: '2',
    ticketId: '27472173',
    author: mockUsers[4],
    content: 'Thank you for your assistance. I can be flexible with the dates. Please let me know about any additional fees.',
    isInternal: false,
    createdAt: new Date('2024-01-15T09:15:00'),
  },
];