import { useState, useCallback } from 'react';
import { Ticket } from '../types';

interface TicketTab {
  id: string;
  ticket: Ticket;
  isActive: boolean;
}

export const useTicketTabs = () => {
  const [openTabs, setOpenTabs] = useState<TicketTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTicketTab = useCallback((ticket: Ticket) => {
    const tabId = `ticket-${ticket.id}`;
    
    setOpenTabs(prevTabs => {
      // Check if tab already exists
      const existingTabIndex = prevTabs.findIndex(tab => tab.id === tabId);
      
      if (existingTabIndex !== -1) {
        // Tab exists, just make it active
        return prevTabs.map(tab => ({
          ...tab,
          isActive: tab.id === tabId
        }));
      }
      
      // Create new tab and deactivate others
      const newTab: TicketTab = {
        id: tabId,
        ticket,
        isActive: true
      };
      
      return [
        ...prevTabs.map(tab => ({ ...tab, isActive: false })),
        newTab
      ];
    });
    
    setActiveTabId(tabId);
  }, []);

  const closeTicketTab = useCallback((tabId: string) => {
    setOpenTabs(prevTabs => {
      const filteredTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // If we closed the active tab, activate the last remaining tab
      if (activeTabId === tabId) {
        if (filteredTabs.length > 0) {
          const newActiveTab = filteredTabs[filteredTabs.length - 1];
          newActiveTab.isActive = true;
          setActiveTabId(newActiveTab.id);
        } else {
          setActiveTabId(null);
        }
      }
      
      return filteredTabs;
    });
  }, [activeTabId]);

  const switchToTab = useCallback((tabId: string) => {
    setOpenTabs(prevTabs => 
      prevTabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      }))
    );
    setActiveTabId(tabId);
  }, []);

  const clearActiveTab = useCallback(() => {
    setOpenTabs(prevTabs => 
      prevTabs.map(tab => ({
        ...tab,
        isActive: false
      }))
    );
    setActiveTabId(null);
  }, []);

  const clearAllTabs = useCallback(() => {
    setOpenTabs([]);
    setActiveTabId(null);
  }, []);

  const getActiveTicket = useCallback(() => {
    if (!activeTabId) return null;
    const activeTab = openTabs.find(tab => tab.id === activeTabId && tab.isActive);
    return activeTab?.ticket || null;
  }, [activeTabId, openTabs]);

  const updateTicketInTab = useCallback((ticketId: string, updates: Partial<Ticket>) => {
    setOpenTabs(prevTabs =>
      prevTabs.map(tab => {
        if (tab.ticket.id === ticketId) {
          return {
            ...tab,
            ticket: { ...tab.ticket, ...updates, updatedAt: new Date() }
          };
        }
        return tab;
      })
    );
  }, []);

  return {
    openTabs,
    activeTabId,
    openTicketTab,
    closeTicketTab,
    switchToTab,
    clearActiveTab,
    clearAllTabs,
    getActiveTicket,
    updateTicketInTab
  };
};