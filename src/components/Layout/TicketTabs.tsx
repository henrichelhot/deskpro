import React from 'react';
import { X, Plus } from 'lucide-react';
import { Ticket } from '../../types';

interface TicketTab {
  id: string;
  ticket: Ticket;
  isActive: boolean;
}

interface TicketTabsProps {
  openTabs: TicketTab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTicket: () => void;
}

export const TicketTabs: React.FC<TicketTabsProps> = ({
  openTabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTicket
}) => {
  const truncateText = (text: string, maxLength: number = 25) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="bg-white border-b border-gray-200 flex items-center overflow-x-auto min-h-[48px]">
      {/* New Ticket Tab */}
      <button
        onClick={onNewTicket}
        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200 whitespace-nowrap min-w-fit"
      >
        <Plus size={16} />
        New ticket
      </button>

      {/* Open Ticket Tabs */}
      {openTabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center border-r border-gray-200 min-w-0 max-w-xs ${
            tab.isActive
              ? 'bg-blue-50 border-b-2 border-b-blue-600'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <button
            onClick={() => onTabClick(tab.id)}
            className="flex items-center gap-2 px-3 py-3 text-sm min-w-0 flex-1"
          >
            {/* Ticket Status Indicator */}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              tab.ticket.status === 'new' ? 'bg-blue-500' :
              tab.ticket.status === 'open' ? 'bg-green-500' :
              tab.ticket.status === 'pending' ? 'bg-yellow-500' :
              tab.ticket.status === 'on-hold' ? 'bg-gray-500' :
              tab.ticket.status === 'solved' ? 'bg-emerald-500' :
              'bg-gray-400'
            }`} />
            
            <div className="min-w-0 flex-1 text-left">
              <div className={`font-medium truncate ${
                tab.isActive ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {truncateText(tab.ticket.subject)}
              </div>
              <div className="text-xs text-gray-500 truncate">
                #{tab.ticket.id}
              </div>
            </div>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-r flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Spacer to push everything to the left */}
      <div className="flex-1"></div>
    </div>
  );
};