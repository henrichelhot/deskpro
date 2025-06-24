import React from 'react';
import { Pause, Archive, Trash2, UserPlus, Tag } from 'lucide-react';

interface TicketActionsProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
}

export const TicketActions: React.FC<TicketActionsProps> = ({
  selectedCount,
  onBulkAction
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        {selectedCount} ticket{selectedCount > 1 ? 's' : ''} selected
      </span>
      
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={() => onBulkAction('play')}
          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          Open
        </button>
        
        <button
          onClick={() => onBulkAction('pause')}
          className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
        >
          <Pause size={16} />
          Hold
        </button>
        
        <button
          onClick={() => onBulkAction('assign')}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <UserPlus size={16} />
          Assign
        </button>
        
        <button
          onClick={() => onBulkAction('tag')}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Tag size={16} />
          Tag
        </button>
        
        <button
          onClick={() => onBulkAction('archive')}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <Archive size={16} />
          Archive
        </button>
        
        <button
          onClick={() => onBulkAction('delete')}
          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
};