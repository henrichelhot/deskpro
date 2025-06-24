import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Users2, 
  Shield,
  MoreVertical,
  UserPlus
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  members_count: number;
  permissions: string[];
  created_at: string;
  color: string;
}

export const GroupsSection: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: 'group-1',
      name: 'Support Team',
      description: 'Primary customer support agents',
      members_count: 5,
      permissions: ['view_tickets', 'edit_tickets', 'create_comments'],
      created_at: new Date().toISOString(),
      color: 'blue'
    },
    {
      id: 'group-2',
      name: 'Technical Team',
      description: 'Technical specialists for complex issues',
      members_count: 3,
      permissions: ['view_tickets', 'edit_tickets', 'create_comments', 'escalate_tickets'],
      created_at: new Date().toISOString(),
      color: 'purple'
    },
    {
      id: 'group-3',
      name: 'Managers',
      description: 'Team leads and supervisors',
      members_count: 2,
      permissions: ['view_all_tickets', 'edit_all_tickets', 'manage_agents', 'view_reports'],
      created_at: new Date().toISOString(),
      color: 'green'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddGroup = () => {
    setEditingGroup(null);
    setShowAddModal(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setShowAddModal(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      setGroups(prev => prev.filter(group => group.id !== groupId));
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Groups</h2>
            <p className="text-gray-600 mt-1">Organize teams and manage permissions</p>
          </div>
          <button
            onClick={handleAddGroup}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Create Group
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search groups..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredGroups.length} of {groups.length} groups
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users2 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No groups match your search criteria.' : 'Get started by creating your first group.'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddGroup}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${getColorClasses(group.color)}`}>
                      <Users2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.members_count} members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditGroup(group)}
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{group.description}</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Permissions</h4>
                    <div className="flex flex-wrap gap-1">
                      {group.permissions.slice(0, 3).map((permission) => (
                        <span
                          key={permission}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {permission.replace('_', ' ')}
                        </span>
                      ))}
                      {group.permissions.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{group.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                      <UserPlus size={14} />
                      Add Members
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Group Modal */}
      {showAddModal && (
        <GroupModal
          group={editingGroup}
          onClose={() => setShowAddModal(false)}
          onSave={(groupData) => {
            if (editingGroup) {
              setGroups(prev => prev.map(g => g.id === editingGroup.id ? { ...g, ...groupData } : g));
            } else {
              const newGroup: Group = {
                id: `group-${Date.now()}`,
                ...groupData,
                members_count: 0,
                created_at: new Date().toISOString()
              };
              setGroups(prev => [...prev, newGroup]);
            }
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

interface GroupModalProps {
  group: Group | null;
  onClose: () => void;
  onSave: (groupData: any) => void;
}

const GroupModal: React.FC<GroupModalProps> = ({ group, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    color: group?.color || 'blue',
    permissions: group?.permissions || []
  });

  const availablePermissions = [
    'view_tickets',
    'edit_tickets',
    'create_comments',
    'escalate_tickets',
    'view_all_tickets',
    'edit_all_tickets',
    'manage_agents',
    'view_reports',
    'manage_groups',
    'system_admin'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {group ? 'Edit Group' : 'Create New Group'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-120px)]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter group name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe the group's purpose"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {['blue', 'purple', 'green', 'red', 'yellow', 'gray'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-gray-300'
                    } ${color === 'blue' ? 'bg-blue-500' : 
                        color === 'purple' ? 'bg-purple-500' :
                        color === 'green' ? 'bg-green-500' :
                        color === 'red' ? 'bg-red-500' :
                        color === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {availablePermissions.map((permission) => (
                  <label key={permission} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
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
              {group ? 'Update' : 'Create'} Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};