import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Plane, 
  Mail,
  MoreVertical,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MockDataService } from '../../services/mockDataService';

interface Airline {
  id: string;
  name: string;
  email: string;
  code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const AirlinesSection: React.FC = () => {
  const { useMockAuth } = useAuth();
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null);

  useEffect(() => {
    fetchAirlines();
  }, [useMockAuth]);

  const fetchAirlines = async () => {
    try {
      setLoading(true);
      const data = await MockDataService.getAirlines();
      setAirlines(data);
    } catch (error) {
      console.error('Error fetching airlines:', error);
      setAirlines([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAirlines = airlines.filter(airline =>
    airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    airline.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (airline.code && airline.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddAirline = () => {
    setEditingAirline(null);
    setShowAddModal(true);
  };

  const handleEditAirline = (airline: Airline) => {
    setEditingAirline(airline);
    setShowAddModal(true);
  };

  const handleDeleteAirline = async (airlineId: string) => {
    if (window.confirm('Are you sure you want to delete this airline?')) {
      try {
        await MockDataService.deleteAirline(airlineId);
        await fetchAirlines();
      } catch (error) {
        console.error('Error deleting airline:', error);
      }
    }
  };

  const handleToggleActive = async (airlineId: string) => {
    try {
      const airline = airlines.find(a => a.id === airlineId);
      if (airline) {
        await MockDataService.updateAirline(airlineId, { is_active: !airline.is_active });
        await fetchAirlines();
      }
    } catch (error) {
      console.error('Error toggling airline status:', error);
    }
  };

  const handleSaveAirline = async (airlineData: any) => {
    try {
      if (editingAirline) {
        await MockDataService.updateAirline(editingAirline.id, airlineData);
      } else {
        await MockDataService.createAirline(airlineData);
      }
      await fetchAirlines();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving airline:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading airlines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Airlines</h2>
            <p className="text-gray-600 mt-1">Manage airline partners and contacts</p>
          </div>
          <button
            onClick={handleAddAirline}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Airline
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
              placeholder="Search airlines..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredAirlines.length} of {airlines.length} airlines
          </div>
        </div>
      </div>

      {/* Airlines List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Airline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAirlines.map((airline) => (
                  <tr key={airline.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          <Plane size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{airline.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-900">
                        {airline.code || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{airline.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(airline.id)}
                        className="flex items-center gap-2"
                      >
                        {airline.is_active ? (
                          <>
                            <ToggleRight className="text-green-600" size={20} />
                            <span className="text-sm text-green-600 font-medium">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="text-gray-400" size={20} />
                            <span className="text-sm text-gray-500">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(airline.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditAirline(airline)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit airline"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAirline(airline.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete airline"
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

          {filteredAirlines.length === 0 && (
            <div className="text-center py-12">
              <Plane size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No airlines found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No airlines match your search criteria.' : 'Get started by adding your first airline partner.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddAirline}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Airline
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Airline Modal */}
      {showAddModal && (
        <AirlineModal
          airline={editingAirline}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveAirline}
        />
      )}
    </div>
  );
};

interface AirlineModalProps {
  airline: Airline | null;
  onClose: () => void;
  onSave: (airlineData: any) => void;
}

const AirlineModal: React.FC<AirlineModalProps> = ({ airline, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: airline?.name || '',
    email: airline?.email || '',
    code: airline?.code || '',
    is_active: airline?.is_active ?? true
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
            {airline ? 'Edit Airline' : 'Add New Airline'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Airline Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter airline name"
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
              Airline Code (Optional)
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., AC, WS, AZ"
              maxLength={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Active
            </label>
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
              {airline ? 'Update' : 'Create'} Airline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};