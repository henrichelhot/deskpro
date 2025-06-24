import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import { ChevronDown, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MockDataService } from '../../services/mockDataService';
import { TicketService } from '../../services/ticketService';

interface AssigneeSelectorProps {
  currentAssignee?: User;
  agents: User[];
  currentUser: User;
  onAssigneeChange: (assignee: User | undefined) => void;
}

export const AssigneeSelector: React.FC<AssigneeSelectorProps> = ({
  currentAssignee,
  agents: initialAgents,
  currentUser,
  onAssigneeChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [agents, setAgents] = useState(initialAgents);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { useMockAuth } = useAuth();

  // Fetch agents when component mounts
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        let agentData
        if (useMockAuth) {
          agentData = await MockDataService.getAgents()
        } else {
          agentData = await TicketService.getAgents()
        }
        setAgents(agentData)
      } catch (err) {
        console.error('Error fetching agents:', err)
      }
    }
    
    if (initialAgents.length === 0) {
      fetchAgents()
    }
  }, [useMockAuth, initialAgents.length])

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssigneeSelect = (agent: User | undefined) => {
    onAssigneeChange(agent);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleTakeIt = () => {
    handleAssigneeSelect(currentUser);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredAgents.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredAgents.length) {
          handleAssigneeSelect(filteredAgents[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-500 mb-2">
        Assignee*
      </label>
      
      <div className="relative">
        <div
          className="w-full p-2 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center justify-between hover:border-gray-400 transition-colors"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
        >
          {currentAssignee ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {currentAssignee.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-900">{currentAssignee.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <UserIcon size={16} />
              <span className="text-sm">Unassigned</span>
            </div>
          )}
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search agents..."
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Take It Option */}
            {currentAssignee?.id !== currentUser.id && (
              <div className="border-b border-gray-200">
                <button
                  onClick={handleTakeIt}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center gap-2 text-blue-600 font-medium"
                >
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">take it</span>
                </button>
              </div>
            )}

            {/* Unassigned Option */}
            <button
              onClick={() => handleAssigneeSelect(undefined)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                highlightedIndex === -1 ? 'bg-gray-50' : ''
              }`}
            >
              <UserIcon size={16} className="text-gray-400" />
              <span className="text-sm text-gray-700">Unassigned</span>
            </button>

            {/* Agent Options */}
            <div className="max-h-40 overflow-y-auto">
              {filteredAgents.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">No agents found</div>
              ) : (
                filteredAgents.map((agent, index) => (
                  <button
                    key={agent.id}
                    onClick={() => handleAssigneeSelect(agent)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                      index === highlightedIndex ? 'bg-gray-50' : ''
                    } ${currentAssignee?.id === agent.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {agent.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {agent.email}
                      </div>
                    </div>
                    {currentAssignee?.id === agent.id && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};