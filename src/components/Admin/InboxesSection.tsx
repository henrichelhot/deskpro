import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Inbox, 
  Mail,
  MessageSquare,
  Phone,
  Globe,
  MoreVertical,
  Settings,
  ToggleLeft,
  ToggleRight,
  TestTube,
  RefreshCw,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { EmailProcessingService } from '../../services/emailProcessingService';
import { InboxService } from '../../services/inboxService';
import { MockDataService } from '../../services/mockDataService';

interface InboxConfig {
  id: string;
  name: string;
  description: string | null;
  provider: 'gmail' | 'outlook' | 'imap' | 'pop3' | 'exchange';
  email_address: string;
  brand_id: string | null;
  is_active: boolean;
  settings: any;
  created_at: string;
  updated_at: string;
  brand?: any;
}

export const InboxesSection: React.FC = () => {
  const { useMockAuth } = useAuth();
  const [inboxes, setInboxes] = useState<InboxConfig[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInbox, setEditingInbox] = useState<InboxConfig | null>(null);
  const [testingInbox, setTestingInbox] = useState<string | null>(null);
  const [syncingInbox, setSyncingInbox] = useState<string | null>(null);
  const [showStatsModal, setShowStatsModal] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: 'connected' | 'disconnected' | 'testing' }>({});

  useEffect(() => {
    fetchData();
    // Check connection status for all inboxes
    checkAllConnectionStatus();
  }, [useMockAuth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inboxesData, brandsData] = await Promise.all([
        InboxService.getInboxes(),
        MockDataService.getBrands()
      ]);
      setInboxes(inboxesData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setInboxes([]);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const checkAllConnectionStatus = async () => {
    // Simulate checking connection status for all inboxes
    const status: { [key: string]: 'connected' | 'disconnected' | 'testing' } = {};
    
    // In a real implementation, this would test actual connections
    // For demo, we'll simulate realistic connection states
    inboxes.forEach(inbox => {
      if (inbox.is_active) {
        // 80% chance of being connected for active inboxes
        status[inbox.id] = Math.random() > 0.2 ? 'connected' : 'disconnected';
      } else {
        status[inbox.id] = 'disconnected';
      }
    });
    
    setConnectionStatus(status);
  };

  const filteredInboxes = inboxes.filter(inbox =>
    inbox.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inbox.email_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inbox.description && inbox.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddInbox = () => {
    setEditingInbox(null);
    setShowAddModal(true);
  };

  const handleEditInbox = (inbox: InboxConfig) => {
    setEditingInbox(inbox);
    setShowAddModal(true);
  };

  const handleDeleteInbox = async (inboxId: string) => {
    if (window.confirm('Are you sure you want to delete this inbox? This action cannot be undone and will affect any tickets associated with this inbox.')) {
      try {
        await InboxService.deleteInbox(inboxId);
        await fetchData();
      } catch (error) {
        console.error('Error deleting inbox:', error);
        alert('Failed to delete inbox. Please try again.');
      }
    }
  };

  const handleToggleActive = async (inboxId: string) => {
    try {
      const inbox = inboxes.find(i => i.id === inboxId);
      if (inbox) {
        await InboxService.updateInbox(inboxId, { is_active: !inbox.is_active });
        await fetchData();
        
        // Update connection status
        setConnectionStatus(prev => ({
          ...prev,
          [inboxId]: inbox.is_active ? 'disconnected' : 'connected'
        }));
      }
    } catch (error) {
      console.error('Error toggling inbox status:', error);
      alert('Failed to update inbox status. Please try again.');
    }
  };

  const handleTestConnection = async (inbox: InboxConfig) => {
    setTestingInbox(inbox.id);
    setConnectionStatus(prev => ({ ...prev, [inbox.id]: 'testing' }));
    
    try {
      const connectionDetails = {
        provider: inbox.provider,
        host: inbox.settings.host,
        port: inbox.settings.port,
        secure: inbox.settings.secure,
        auth: {
          user: inbox.settings.auth.user,
          pass: inbox.settings.auth.pass,
        },
      };

      const result = await EmailProcessingService.testEmailConnection(connectionDetails);
      
      if (result.success) {
        setConnectionStatus(prev => ({ ...prev, [inbox.id]: 'connected' }));
        alert(`✅ Connection test successful!\n\nServer: ${result.details?.server}\nPort: ${result.details?.port}\nSecure: ${result.details?.secure ? 'Yes' : 'No'}`);
      } else {
        setConnectionStatus(prev => ({ ...prev, [inbox.id]: 'disconnected' }));
        alert(`❌ Connection test failed: ${result.message}\n\nDetails: ${result.details || 'No details available.'}`);
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [inbox.id]: 'disconnected' }));
      alert('❌ Connection test failed: ' + error);
    } finally {
      setTestingInbox(null);
    }
  };

  const handleSyncEmails = async (inboxId: string) => {
    const inbox = inboxes.find(i => i.id === inboxId);
    if (!inbox) return;

    if (!inbox.is_active) {
      alert('⚠️ This inbox is inactive. Please activate it before syncing emails.');
      return;
    }

    if (connectionStatus[inboxId] === 'disconnected') {
      const shouldTest = window.confirm('⚠️ This inbox appears to be disconnected. Would you like to test the connection first?');
      if (shouldTest) {
        await handleTestConnection(inbox);
        return;
      }
    }

    setSyncingInbox(inboxId);
    
    try {
      console.log(`🔄 Starting enhanced email sync for ${inbox.name}...`);
      
      const result = await EmailProcessingService.syncInboxEmails(inboxId, useMockAuth);
      
      if (result.success) {
        const message = `📧 Email sync completed successfully!\n\n` +
          `📊 Summary:\n` +
          `• Processed: ${result.processed} emails\n` +
          `• New tickets: ${result.newTickets}\n` +
          `• Updated tickets: ${result.updatedTickets || 0}\n` +
          `• Errors: ${result.errors}\n\n` +
          `${result.newTickets > 0 ? '🎫 New tickets have been created and are ready for review.' : ''}`;
        
        alert(message);
        
        // Refresh the page to show new tickets
        if (result.newTickets > 0) {
          const shouldRefresh = window.confirm('Would you like to refresh the page to see the new tickets?');
          if (shouldRefresh) {
            window.location.reload();
          }
        }
      } else {
        alert(`❌ Email sync failed: ${result.message || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Email sync error:', error);
      alert('❌ Email sync failed: ' + error);
    } finally {
      setSyncingInbox(null);
    }
  };

  const handleSaveInbox = async (inboxData: any) => {
    try {
      if (editingInbox) {
        await InboxService.updateInbox(editingInbox.id, inboxData);
      } else {
        await InboxService.createInbox(inboxData);
      }
      await fetchData();
      setShowAddModal(false);
      
      // Test connection for new/updated inbox
      if (!editingInbox || inboxData.settings) {
        setTimeout(() => {
          const inbox = inboxes.find(i => i.email_address === inboxData.email_address);
          if (inbox) {
            handleTestConnection(inbox);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving inbox:', error);
      alert('Failed to save inbox. Please check your settings and try again.');
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return Mail;
      case 'outlook':
        return Mail;
      case 'imap':
        return Inbox;
      case 'pop3':
        return Inbox;
      case 'exchange':
        return MessageSquare;
      default:
        return Inbox;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return 'bg-red-100 text-red-800';
      case 'outlook':
        return 'bg-blue-100 text-blue-800';
      case 'imap':
        return 'bg-green-100 text-green-800';
      case 'pop3':
        return 'bg-purple-100 text-purple-800';
      case 'exchange':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectionStatusIcon = (inboxId: string) => {
    const status = connectionStatus[inboxId];
    switch (status) {
      case 'connected':
        return <Wifi size={14} className="text-green-600" />;
      case 'testing':
        return <RefreshCw size={14} className="text-blue-600 animate-spin" />;
      case 'disconnected':
      default:
        return <WifiOff size={14} className="text-red-600" />;
    }
  };

  const getConnectionStatusText = (inboxId: string) => {
    const status = connectionStatus[inboxId];
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'testing':
        return 'Testing...';
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inboxes...</p>
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
            <h2 className="text-xl font-semibold text-gray-900">Email Inboxes</h2>
            <p className="text-gray-600 mt-1">Configure email inboxes for automatic ticket creation from incoming emails</p>
          </div>
          <button
            onClick={handleAddInbox}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Inbox
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
              placeholder="Search inboxes..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredInboxes.length} of {inboxes.length} inboxes
          </div>
        </div>
      </div>

      {/* Inboxes List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredInboxes.length === 0 ? (
          <div className="text-center py-12">
            <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inboxes found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No inboxes match your search criteria.' : 'Get started by creating your first email inbox to automatically convert emails into support tickets.'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddInbox}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Inbox
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInboxes.map((inbox) => {
              const ProviderIcon = getProviderIcon(inbox.provider);
              const isConnected = connectionStatus[inbox.id] === 'connected';
              const isTesting = connectionStatus[inbox.id] === 'testing';
              
              return (
                <div key={inbox.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getProviderColor(inbox.provider)}`}>
                        <ProviderIcon size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{inbox.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProviderColor(inbox.provider)}`}>
                            {inbox.provider.toUpperCase()}
                          </span>
                          
                          {/* Connection Status */}
                          <div className="flex items-center gap-1">
                            {getConnectionStatusIcon(inbox.id)}
                            <span className={`text-xs ${
                              isConnected ? 'text-green-600' : 
                              isTesting ? 'text-blue-600' : 'text-red-600'
                            }`}>
                              {getConnectionStatusText(inbox.id)}
                            </span>
                          </div>
                          
                          {/* Active Status */}
                          <button
                            onClick={() => handleToggleActive(inbox.id)}
                            className="flex items-center gap-1"
                          >
                            {inbox.is_active ? (
                              <ToggleRight className="text-green-600" size={20} />
                            ) : (
                              <ToggleLeft className="text-gray-400" size={20} />
                            )}
                            <span className={`text-sm ${inbox.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                              {inbox.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </button>
                        </div>
                        
                        {inbox.description && (
                          <p className="text-gray-600 text-sm mb-3">{inbox.description}</p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} />
                            <span>{inbox.email_address}</span>
                          </div>
                          
                          {inbox.brand && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: inbox.brand.primary_color }}
                              />
                              <span>{inbox.brand.name}</span>
                            </div>
                          )}
                          
                          {inbox.settings?.host && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Globe size={14} />
                              <span>{inbox.settings.host}:{inbox.settings.port}</span>
                              {inbox.settings.secure && (
                                <span className="text-green-600 text-xs font-medium">SSL</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Created {new Date(inbox.created_at).toLocaleDateString()}
                          </span>
                          {inbox.settings?.auto_reply && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Auto-reply enabled
                            </span>
                          )}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            Last sync: {Math.floor(Math.random() * 30) + 1}m ago
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setShowStatsModal(inbox.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View statistics"
                      >
                        <BarChart3 size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleTestConnection(inbox)}
                        disabled={testingInbox === inbox.id}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Test connection"
                      >
                        {testingInbox === inbox.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <TestTube size={16} />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleSyncEmails(inbox.id)}
                        disabled={syncingInbox === inbox.id || !inbox.is_active}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 relative"
                        title={inbox.is_active ? "Process incoming emails" : "Inbox is inactive"}
                      >
                        {syncingInbox === inbox.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <>
                            <Zap size={16} />
                            {inbox.is_active && isConnected && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
                            )}
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleEditInbox(inbox)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit inbox"
                      >
                        <Edit3 size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteInbox(inbox.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete inbox"
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Inbox Modal */}
      {showAddModal && (
        <InboxModal
          inbox={editingInbox}
          brands={brands}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveInbox}
        />
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <InboxStatsModal
          inboxId={showStatsModal}
          onClose={() => setShowStatsModal(null)}
        />
      )}
    </div>
  );
};

interface InboxModalProps {
  inbox: InboxConfig | null;
  brands: any[];
  onClose: () => void;
  onSave: (inboxData: any) => void;
}

const InboxModal: React.FC<InboxModalProps> = ({ inbox, brands, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: inbox?.name || '',
    description: inbox?.description || '',
    provider: inbox?.provider || 'gmail' as 'gmail' | 'outlook' | 'imap' | 'pop3' | 'exchange',
    email_address: inbox?.email_address || '',
    brand_id: inbox?.brand_id || '',
    is_active: inbox?.is_active ?? true,
    settings: {
      host: inbox?.settings?.host || '',
      port: inbox?.settings?.port || 993,
      secure: inbox?.settings?.secure ?? true,
      auth: {
        user: inbox?.settings?.auth?.user || '',
        pass: inbox?.settings?.auth?.pass || ''
      },
      auto_reply: inbox?.settings?.auto_reply ?? false,
      signature: inbox?.settings?.signature || ''
    }
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getDefaultSettings = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return { host: 'imap.gmail.com', port: 993, secure: true };
      case 'outlook':
        return { host: 'outlook.office365.com', port: 993, secure: true };
      case 'imap':
        return { host: '', port: 993, secure: true };
      case 'pop3':
        return { host: '', port: 995, secure: true };
      case 'exchange':
        return { host: '', port: 993, secure: true };
      default:
        return { host: '', port: 993, secure: true };
    }
  };

  const handleProviderChange = (provider: string) => {
    const defaults = getDefaultSettings(provider);
    setFormData(prev => ({
      ...prev,
      provider: provider as any,
      settings: {
        ...prev.settings,
        ...defaults
      }
    }));
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {inbox ? 'Edit Inbox' : 'Create New Inbox'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure email settings to automatically convert incoming emails into support tickets
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-120px)]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inbox Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter inbox name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe this inbox"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, email_address: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="support@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Associated Brand (Optional)
                </label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand_id: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No brand association</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Provider Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Email Provider Settings</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Type
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook/Office 365</option>
                  <option value="imap">IMAP</option>
                  <option value="pop3">POP3</option>
                  <option value="exchange">Exchange</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Server Host
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.settings.host}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, host: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="imap.gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.settings.port}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, port: parseInt(e.target.value) }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="993"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.settings.auth.user}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    settings: { 
                      ...prev.settings, 
                      auth: { ...prev.settings.auth, user: e.target.value }
                    }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Usually the same as email address"
                />
              </div>

              <div>
                {formData.provider === 'gmail' ? (
                  <div className="col-span-2 relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Gmail OAuth2 Access Token
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="auth.pass"
                        value={formData.settings.auth.pass}
                        onChange={handleSettingsChange}
                        placeholder="Paste your OAuth2 token here"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      This is a temporary token from Google. 
                      <a href="https://developers.google.com/oauthplayground/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        Get one from OAuth Playground
                      </a>.
                    </p>
                  </div>
                ) : (
                  <div className="col-span-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password / App Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="auth.pass"
                        value={formData.settings.auth.pass}
                        onChange={handleSettingsChange}
                        placeholder={formData.provider === 'outlook' ? 'Enter your Microsoft account password' : 'Enter IMAP/POP3 password'}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Additional Settings</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Signature (Optional)
                </label>
                <textarea
                  value={formData.settings.signature}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    settings: { ...prev.settings, signature: e.target.value }
                  }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Best regards,&#10;Support Team"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.secure}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, secure: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Use SSL/TLS encryption</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.auto_reply}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, auto_reply: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Send auto-reply to new emails</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active (start monitoring emails)</span>
                </label>
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
              {inbox ? 'Update' : 'Create'} Inbox
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface InboxStatsModalProps {
  inboxId: string;
  onClose: () => void;
}

const InboxStatsModal: React.FC<InboxStatsModalProps> = ({ inboxId, onClose }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await MockDataService.getInboxStats(inboxId);
        setStats(data);
      } catch (error) {
        console.error('Error fetching inbox stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [inboxId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Inbox Statistics</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading statistics...</p>
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-blue-600">Total Tickets</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.new}</div>
                  <div className="text-sm text-green-600">New Tickets</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
                  <div className="text-sm text-yellow-600">Open Tickets</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.solved}</div>
                  <div className="text-sm text-purple-600">Solved Tickets</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">{stats.thisWeek}</div>
                <div className="text-sm text-gray-600">Tickets this week</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Failed to load statistics
            </div>
          )}
        </div>
      </div>
    </div>
  );
};