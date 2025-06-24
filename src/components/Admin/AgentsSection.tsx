import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Mail, 
  Shield,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { TicketService } from '../../services/ticketService';
import { MockDataService } from '../../services/mockDataService';

interface Agent {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  is_online: boolean;
  last_seen: string;
  created_at: string;
}

export const AgentsSection: React.FC = () => {
  const { useMockAuth } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    console.log('AgentsSection: Component mounted, useMockAuth:', useMockAuth);
    fetchAgents();
  }, [useMockAuth]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      console.log('AgentsSection: Starting to fetch agents...');
      
      let data;
      if (useMockAuth) {
        console.log('AgentsSection: Using MockDataService...');
        
        // Debug the current state
        MockDataService.debugState();
        
        // Try to get agents
        data = await MockDataService.getAgents();
        console.log('AgentsSection: MockDataService returned:', data);
        
        // If no agents found, try reinitializing
        if (!data || data.length === 0) {
          console.log('AgentsSection: No agents found, reinitializing...');
          data = MockDataService.reinitializeUsers().filter(user => 
            user.role === 'agent' || user.role === 'admin'
          );
          console.log('AgentsSection: After reinitialize:', data);
        }
      } else {
        console.log('AgentsSection: Using TicketService...');
        data = await TicketService.getAgents();
        console.log('AgentsSection: TicketService returned:', data);
      }
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        console.log('AgentsSection: Setting agents to:', data);
        setAgents(data);
      } else {
        console.error('AgentsSection: Expected array but got:', typeof data, data);
        setAgents([]);
      }
    } catch (error) {
      console.error('AgentsSection: Error fetching agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAgent = () => {
    setEditingAgent(null);
    setShowAddModal(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setShowAddModal(true);
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        if (useMockAuth) {
          await MockDataService.deleteAgent(agentId);
        } else {
          // Real implementation would go here
          console.log('Deleting agent:', agentId);
        }
        // Refresh the agents list
        await fetchAgents();
      } catch (error) {
        console.error('Error deleting agent:', error);
      }
    }
  };

  const handleSaveAgent = async (agentData: any) => {
    try {
      console.log('AgentsSection: Saving agent data:', agentData);
      
      if (editingAgent) {
        // Update existing agent
        if (useMockAuth) {
          await MockDataService.updateAgent(editingAgent.id, agentData);
        } else {
          // Real implementation would go here
          console.log('Updating agent:', editingAgent.id, agentData);
        }
      } else {
        // Create new agent
        if (useMockAuth) {
          await MockDataService.createAgent(agentData);
        } else {
          // Real implementation would go here
          console.log('Creating agent:', agentData);
        }
      }
      
      // Refresh the agents list
      await fetchAgents();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving agent:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  console.log('AgentsSection: Rendering with agents:', agents);
  console.log('AgentsSection: Filtered agents:', filteredAgents);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Agents</h2>
            <p className="text-gray-600 mt-1">Manage support agents and their permissions</p>
          </div>
          <button
            onClick={handleAddAgent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Agent
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agents..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredAgents.length} of {agents.length} agents
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Seen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{agent.name}</div>
                          <div className="text-sm text-gray-500">{agent.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className={agent.role === 'admin' ? 'text-purple-600' : 'text-blue-600'} />
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          agent.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {agent.role === 'admin' ? 'Administrator' : 'Agent'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {agent.is_online ? (
                          <>
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-sm text-green-700 font-medium">Online</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-500">Offline</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(agent.last_seen).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditAgent(agent)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit agent"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete agent"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <UserPlus size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No agents match your search criteria.' : 'Get started by adding your first agent.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddAgent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Agent
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Agent Modal */}
      {showAddModal && (
        <AgentModal
          agent={editingAgent}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveAgent}
        />
      )}
    </div>
  );
};

interface AgentModalProps {
  agent: Agent | null;
  onClose: () => void;
  onSave: (agentData: any) => void;
}

const AgentModal: React.FC<AgentModalProps> = ({ agent, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: agent?.name || '',
    email: agent?.email || '',
    role: agent?.role || 'agent' as 'admin' | 'agent'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {agent ? 'Edit Agent' : 'Add New Agent'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'agent' }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="agent">Agent</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {agent ? 'Update' : 'Create'} Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};