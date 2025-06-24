import React from 'react';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { formatDistanceToNow } from 'date-fns';
import { Lock, Eye, User, Plane, Building } from 'lucide-react';

interface TicketRowProps {
  ticket: any;
  isSelected: boolean;
  onSelect: (ticketId: string) => void;
  onTicketClick: (ticket: any) => void;
  showSelection?: boolean;
  userRole?: string;
}

export const TicketRow: React.FC<TicketRowProps> = ({
  ticket,
  isSelected,
  onSelect,
  onTicketClick,
  showSelection = true,
  userRole
}) => {
  const getCategoryIcon = () => {
    switch (ticket.category) {
      case 'airline':
        return <Plane size={14} className="text-blue-500" />;
      case 'supplier':
        return <Building size={14} className="text-green-500" />;
      default:
        return <User size={14} className="text-purple-500" />;
    }
  };

  return (
    <tr 
      className="hover:bg-gray-50 border-b border-gray-200 cursor-pointer"
      onClick={() => onTicketClick(ticket)}
    >
      {showSelection && (
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(ticket.id);
            }}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </td>
      )}
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {ticket.status === 'on-hold' && <Lock size={14} className="text-gray-500" />}
          <Eye size={14} className="text-gray-400" />
          {getCategoryIcon()}
        </div>
      </td>
      
      <td className="px-4 py-3">
        <TicketStatusBadge status={ticket.status} />
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <TicketPriorityBadge priority={ticket.priority} />
          <div>
            <p className="font-medium text-gray-900 truncate max-w-md" title={ticket.subject}>
              {ticket.subject}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>#{ticket.ticket_number}</span>
              {ticket.category !== 'service' && (
                <>
                  <span>•</span>
                  <span className="capitalize">{ticket.category}</span>
                  {ticket.airline && (
                    <>
                      <span>•</span>
                      <span>{ticket.airline.name}</span>
                    </>
                  )}
                  {ticket.supplier && (
                    <>
                      <span>•</span>
                      <span>{ticket.supplier.name}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {ticket.requester?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-gray-900">{ticket.requester?.name || 'Unknown'}</span>
        </div>
      </td>
      
      <td className="px-4 py-3">
        <span className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
        </span>
      </td>
      
      {(userRole === 'agent' || userRole === 'admin') && (
        <td className="px-4 py-3">
          {ticket.assignee ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {ticket.assignee.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-900">{ticket.assignee.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <User size={16} />
              <span className="text-sm">Unassigned</span>
            </div>
          )}
        </td>
      )}
    </tr>
  );
};