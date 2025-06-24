import React from 'react';
import { Ticket, Users, Clock, CheckCircle } from 'lucide-react';

interface DashboardStatsProps {
  totalTickets: number;
  openTickets: number;
  onHoldTickets: number;
  solvedToday: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalTickets,
  openTickets,
  onHoldTickets,
  solvedToday
}) => {
  const stats = [
    {
      label: 'Total Tickets',
      value: totalTickets,
      icon: Ticket,
      color: 'blue',
      change: '+12%'
    },
    {
      label: 'Open Tickets',
      value: openTickets,
      icon: Users,
      color: 'green',
      change: '+5%'
    },
    {
      label: 'On Hold',
      value: onHoldTickets,
      icon: Clock,
      color: 'yellow',
      change: '-8%'
    },
    {
      label: 'Solved Today',
      value: solvedToday,
      icon: CheckCircle,
      color: 'emerald',
      change: '+15%'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600';
      case 'green':
        return 'bg-green-50 text-green-600';
      case 'yellow':
        return 'bg-yellow-50 text-yellow-600';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last week</p>
              </div>
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};