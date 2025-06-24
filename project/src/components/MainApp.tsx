import React, { useState, useEffect } from 'react';
import { Sidebar } from './Layout/Sidebar';
import { TopBar } from './Layout/TopBar';
import { TicketsPage } from '../pages/TicketsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AdminPage } from '../pages/AdminPage';
import { TicketDetailView } from './Tickets/TicketDetailView';
import { CreateTicketModal } from './Tickets/CreateTicketModal';
import { useTicketTabs } from '../hooks/useTicketTabs';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';

export const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const ticketTabs = useTicketTabs();
  const { user, useMockAuth } = useAuth();
  const { createTicket, refetch } = useTickets();

  // Clear all tabs when authentication mode changes
  useEffect(() => {
    ticketTabs.clearAllTabs();
  }, [useMockAuth]);

  const handleNewTicket = () => {
    setShowCreateModal(true);
  };

  const handleCreateTicket = async (ticketData: any) => {
    try {
      console.log('MainApp: Creating ticket with data:', ticketData);
      
      const newTicket = await createTicket(ticketData);
      
      console.log('MainApp: Ticket created successfully:', newTicket);
      
      // Refresh tickets list
      await refetch();
      
      // Open the new ticket in a tab
      ticketTabs.openTicketTab(newTicket);
      
      // Switch to tickets page if not already there
      if (activeTab !== 'tickets') {
        setActiveTab('tickets');
      }
      
      // Close the modal
      setShowCreateModal(false);
      
    } catch (error) {
      console.error('MainApp: Error creating ticket:', error);
      throw error;
    }
  };

  const handleTicketClick = (ticket: any) => {
    ticketTabs.openTicketTab(ticket);
  };

  const handleUpdateTicket = (updates: any) => {
    const activeTicket = ticketTabs.getActiveTicket();
    if (activeTicket) {
      ticketTabs.updateTicketInTab(activeTicket.id, updates);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Clear active ticket tab when navigating to other sections (except tickets page)
    if (tab !== 'tickets') {
      ticketTabs.clearActiveTab();
    }
  };

  const renderContent = () => {
    // If there's an active ticket tab AND we're on the tickets page, show the ticket detail view
    const activeTicket = ticketTabs.getActiveTicket();
    if (activeTicket && activeTab === 'tickets') {
      return (
        <TicketDetailView
          ticket={activeTicket}
          onUpdateTicket={handleUpdateTicket}
        />
      );
    }

    // Otherwise show the regular page content
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'tickets':
        return <TicketsPage onTicketClick={handleTicketClick} />;
      case 'customers':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Customers</h2>
              <p className="text-gray-600">Customer management features coming soon...</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
              <p className="text-gray-600">Analytics and reporting features coming soon...</p>
            </div>
          </div>
        );
      case 'admin':
        return <AdminPage />;
      default:
        return <TicketsPage onTicketClick={handleTicketClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar with Ticket Tabs - Always visible */}
      <TopBar onNewTicket={handleNewTicket} ticketTabs={ticketTabs} user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Always visible and clickable */}
        <div className="flex-shrink-0 z-10">
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            onNewTicket={handleNewTicket}
            user={user} 
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTicket={handleCreateTicket}
      />
    </div>
  );
};