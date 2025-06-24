import React, { useState, useMemo } from 'react';
import { FilterOptions, SortOptions } from '../../types';
import { TicketRow } from './TicketRow';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TicketTableProps {
  tickets: any[];
  filters: FilterOptions;
  selectedTickets: string[];
  onSelectTicket: (ticketId: string) => void;
  onSelectAllTickets: (ticketIds: string[]) => void;
  onTicketClick: (ticket: any) => void;
  userRole?: string;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  filters,
  selectedTickets,
  onSelectTicket,
  onSelectAllTickets,
  onTicketClick,
  userRole
}) => {
  const [sort, setSort] = useState<SortOptions>({ field: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          ticket.subject.toLowerCase().includes(searchLower) ||
          ticket.ticket_number.toLowerCase().includes(searchLower) ||
          ticket.requester?.name.toLowerCase().includes(searchLower) ||
          ticket.assignee?.name?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [tickets, filters]);

  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      let aValue = a[sort.field];
      let bValue = b[sort.field];
      
      // Handle nested fields
      if (sort.field === 'requester') {
        aValue = a.requester?.name || '';
        bValue = b.requester?.name || '';
      } else if (sort.field === 'assignee') {
        aValue = a.assignee?.name || '';
        bValue = b.assignee?.name || '';
      }
      
      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTickets, sort]);

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTickets, currentPage]);

  const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);
  const isAllSelected = paginatedTickets.length > 0 && paginatedTickets.every(ticket => selectedTickets.includes(ticket.id));

  const handleSort = (field: string) => {
    setSort(prev => ({
      field: field as any,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectAllTickets([]);
    } else {
      onSelectAllTickets(paginatedTickets.map(ticket => ticket.id));
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const showSelectionColumn = userRole === 'agent' || userRole === 'admin';

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Table Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {sortedTickets.length} tickets {totalPages > 1 && `(Page ${currentPage} of ${totalPages})`}
          </h2>
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, sortedTickets.length)} of {sortedTickets.length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {showSelectionColumn && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket Status
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('subject')}
              >
                <div className="flex items-center gap-1">
                  Subject
                  <SortIcon field="subject" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('requester')}
              >
                <div className="flex items-center gap-1">
                  Requester
                  <SortIcon field="requester" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  Requested
                  <SortIcon field="created_at" />
                </div>
              </th>
              {(userRole === 'agent' || userRole === 'admin') && (
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('assignee')}
                >
                  <div className="flex items-center gap-1">
                    Assignee
                    <SortIcon field="assignee" />
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedTickets.map(ticket => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                isSelected={selectedTickets.includes(ticket.id)}
                onSelect={onSelectTicket}
                onTicketClick={onTicketClick}
                showSelection={showSelectionColumn}
                userRole={userRole}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};