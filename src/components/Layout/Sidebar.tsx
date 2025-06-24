import React from 'react';
import { 
  Ticket, 
  Users, 
  BarChart3, 
  Settings, 
  Home,
  Shield
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewTicket?: () => void;
  user: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, user }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (user?.role === 'customer') {
      return ['tickets'].includes(item.id);
    }
    // Hide admin section for non-admin users
    if (item.id === 'admin' && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <div className="w-16 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 p-2 pt-4">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id} className="relative group">
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={item.label}
                >
                  <Icon size={20} />
                </button>
                
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-2 border-t border-gray-200">
        <div className="relative group">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mx-auto cursor-pointer hover:bg-blue-700 transition-colors">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          {/* Tooltip */}
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            <div className="font-medium">{user?.name}</div>
            <div className="text-gray-300 capitalize">{user?.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};