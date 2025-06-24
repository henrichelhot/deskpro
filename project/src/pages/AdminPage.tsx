import React, { useState } from 'react';
import { Header } from '../components/Layout/Header';
import { AgentsSection } from '../components/Admin/AgentsSection';
import { CustomersSection } from '../components/Admin/CustomersSection';
import { GroupsSection } from '../components/Admin/GroupsSection';
import { BrandsSection } from '../components/Admin/BrandsSection';
import { InboxesSection } from '../components/Admin/InboxesSection';
import { AirlinesSection } from '../components/Admin/AirlinesSection';
import { SuppliersSection } from '../components/Admin/SuppliersSection';
import { EmailsSection } from '../components/Admin/EmailsSection';
import { 
  Users, 
  UserCheck, 
  Users2, 
  Building2, 
  Inbox,
  Plane,
  Building,
  Mail
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('agents');

  const sections = [
    { id: 'agents', label: 'Agents', icon: UserCheck, description: 'Manage support agents' },
    { id: 'customers', label: 'Customers', icon: Users, description: 'View customer accounts' },
    { id: 'groups', label: 'Groups', icon: Users2, description: 'Organize teams and permissions' },
    { id: 'brands', label: 'Brands', icon: Building2, description: 'Manage brand identities' },
    { id: 'airlines', label: 'Airlines', icon: Plane, description: 'Manage airline partners' },
    { id: 'suppliers', label: 'Suppliers', icon: Building, description: 'Manage supplier partners' },
    { id: 'inboxes', label: 'Inboxes', icon: Inbox, description: 'Configure support channels' },
    { id: 'emails', label: 'Email Debug', icon: Mail, description: 'Debug email processing' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'agents':
        return <AgentsSection />;
      case 'customers':
        return <CustomersSection />;
      case 'groups':
        return <GroupsSection />;
      case 'brands':
        return <BrandsSection />;
      case 'airlines':
        return <AirlinesSection />;
      case 'suppliers':
        return <SuppliersSection />;
      case 'inboxes':
        return <InboxesSection />;
      case 'emails':
        return <EmailsSection />;
      default:
        return <AgentsSection />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Admin Panel"
        subtitle="System administration and configuration"
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Admin Navigation Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Administration
            </h3>
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{section.label}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};