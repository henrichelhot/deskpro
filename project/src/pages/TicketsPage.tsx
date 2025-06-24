import React, { useState, useMemo } from 'react';
import { Header } from '../components/Layout/Header';
import { TicketFilters } from '../components/Tickets/TicketFilters';
import { TicketActions } from '../components/Tickets/TicketActions';
import { TicketTable } from '../components/Tickets/TicketTable';
import { FilterOptions } from '../types';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';

interface TicketsPageProps {
  onTicketClick?: (ticket: any) => void;
}

export const TicketsPage: React.FC<TicketsPageProps> = ({ onTicketClick }) => {
  const { user } = useAuth();
  
  // Initialize filters with all options enabled by default
  const [filters, setFilters] = useState<FilterOptions>({
    status: ['new', 'open', 'pending', 'on-hold', 'solved', 'closed'],
    priority: ['low', 'normal', 'high', 'urgent'],
    satisfaction: ['offered', 'unoffered', 'good', 'bad']
  });
  
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  const { tickets, loading, error, updateTicket } = useTickets(filters);

  const filteredCount = tickets.length;

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAllTickets = (ticketIds: string[]) => {
    setSelectedTickets(ticketIds);
  };

  const handleBulkAction = async (action: string) => {
    console.log(`Performing ${action} on tickets:`, selectedTickets);
    
    try {
      switch (action) {
        case 'play':
          // Change status from on-hold to open
          for (const ticketId of selectedTickets) {
            await updateTicket(ticketId, { status: 'open' });
          }
          break;
        case 'pause':
          // Change status to on-hold
          for (const ticketId of selectedTickets) {
            await updateTicket(ticketId, { status: 'on-hold' });
          }
          break;
        // Add other actions as needed
      }
      
      setSelectedTickets([]);
    } catch (err) {
      console.error('Error performing bulk action:', err);
    }
  };

  const handleTicketClick = (ticket: any) => {
    if (onTicketClick) {
      onTicketClick(ticket);
    }
  };

  const getPageTitle = () => {
    if (filters.status?.length === 1) {
      const status = filters.status[0];
      return `TICKETS - ${status.toUpperCase().replace('-', ' ')}`;
    }
    return user?.role === 'customer' ? 'My Tickets' : 'TICKETS';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading tickets: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title={getPageTitle()}
        subtitle={`${filteredCount} tickets found`}
      />
      
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between mb-6">
          <TicketFilters
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />
          
          {(user?.role === 'agent' || user?.role === 'admin') && (
            <TicketActions
              selectedCount={selectedTickets.length}
              onBulkAction={handleBulkAction}
            />
          )}
        </div>

        {/* Tickets Table */}
        <TicketTable
          tickets={tickets}
          filters={filters}
          selectedTickets={selectedTickets}
          onSelectTicket={handleSelectTicket}
          onSelectAllTickets={handleSelectAllTickets}
          onTicketClick={handleTicketClick}
          userRole={user?.role}
        />
      </div>
    </div>
  );
};