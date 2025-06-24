import React from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { FilterOptions, TicketStatus, TicketPriority, SatisfactionRating } from '../../types';

interface TicketFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const TicketFilters: React.FC<TicketFiltersProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle
}) => {
  const statusOptions: TicketStatus[] = ['new', 'open', 'pending', 'on-hold', 'solved', 'closed'];
  const priorityOptions: TicketPriority[] = ['low', 'normal', 'high', 'urgent'];
  const satisfactionOptions: SatisfactionRating[] = ['offered', 'unoffered', 'good', 'bad'];

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter size={16} />
        <span>Filter</span>
        {activeFilterCount > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                <X size={14} />
                Clear all
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status?.includes(status) || false}
                        onChange={(e) => {
                          const current = filters.status || [];
                          const updated = e.target.checked
                            ? [...current, status]
                            : current.filter(s => s !== status);
                          updateFilter('status', updated.length > 0 ? updated : undefined);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  {priorityOptions.map(priority => (
                    <label key={priority} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.priority?.includes(priority) || false}
                        onChange={(e) => {
                          const current = filters.priority || [];
                          const updated = e.target.checked
                            ? [...current, priority]
                            : current.filter(p => p !== priority);
                          updateFilter('priority', updated.length > 0 ? updated : undefined);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Satisfaction Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Satisfaction</label>
                <div className="grid grid-cols-2 gap-2">
                  {satisfactionOptions.map(satisfaction => (
                    <label key={satisfaction} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.satisfaction?.includes(satisfaction) || false}
                        onChange={(e) => {
                          const current = filters.satisfaction || [];
                          const updated = e.target.checked
                            ? [...current, satisfaction]
                            : current.filter(s => s !== satisfaction);
                          updateFilter('satisfaction', updated.length > 0 ? updated : undefined);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{satisfaction}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};