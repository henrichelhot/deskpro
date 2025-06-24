import React from 'react';
import { TicketPriority } from '../../types';
import { AlertTriangle, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
}

export const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({ priority }) => {
  const getPriorityConfig = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return {
          color: 'text-red-600',
          bg: 'bg-red-50',
          icon: AlertTriangle,
          label: 'Urgent'
        };
      case 'high':
        return {
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          icon: ArrowUp,
          label: 'High'
        };
      case 'normal':
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          icon: Minus,
          label: 'Normal'
        };
      case 'low':
        return {
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          icon: ArrowDown,
          label: 'Low'
        };
      default:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          icon: Minus,
          label: 'Normal'
        };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${config.bg}`}>
      <Icon size={12} className={config.color} />
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};