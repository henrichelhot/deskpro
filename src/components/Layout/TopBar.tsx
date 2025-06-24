import React from 'react';
import { TicketTabs } from './TicketTabs';
import { useTicketTabs } from '../../hooks/useTicketTabs';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User } from 'lucide-react';

interface TopBarProps {
  onNewTicket: () => void;
  ticketTabs: ReturnType<typeof useTicketTabs>;
  user: any;
}

export const TopBar: React.FC<TopBarProps> = ({ onNewTicket, ticketTabs, user }) => {
  const { logout } = useAuth();
  const {
    openTabs,
    activeTabId,
    switchToTab,
    closeTicketTab
  } = ticketTabs;

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex-1">
          <TicketTabs
            openTabs={openTabs}
            activeTabId={activeTabId}
            onTabClick={switchToTab}
            onTabClose={closeTicketTab}
            onNewTicket={onNewTicket}
          />
        </div>
        
        {/* User Menu */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};