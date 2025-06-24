import React from 'react';
import { Header } from '../components/Layout/Header';
import { DashboardStats } from '../components/Dashboard/DashboardStats';
import { mockTickets } from '../data/mockData';

export const DashboardPage: React.FC = () => {
  const totalTickets = mockTickets.length;
  const openTickets = mockTickets.filter(t => t.status === 'open').length;
  const onHoldTickets = mockTickets.filter(t => t.status === 'on-hold').length;
  const solvedToday = mockTickets.filter(t => 
    t.status === 'solved' && 
    t.updatedAt.toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Dashboard"
        subtitle="Welcome to ServiceDesk Pro"
      />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <DashboardStats
          totalTickets={totalTickets}
          openTickets={openTickets}
          onHoldTickets={onHoldTickets}
          solvedToday={solvedToday}
        />

        {/* Additional dashboard content can go here */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {mockTickets.slice(0, 5).map(ticket => (
                <div key={ticket.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {ticket.requester.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {ticket.requester.name} • #{ticket.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left">
                Create New Ticket
              </button>
              <button className="w-full p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-left">
                View All Open Tickets
              </button>
              <button className="w-full p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-left">
                Manage On-Hold Tickets
              </button>
              <button className="w-full p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left">
                Generate Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};