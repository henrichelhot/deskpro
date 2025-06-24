import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  RefreshCw, 
  Eye, 
  Calendar,
  User,
  Server,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Trash2,
  TestTube,
  Info,
  Wifi,
  WifiOff,
  Settings
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MockDataService } from '../../services/mockDataService';
import { RealEmailService } from '../../services/realEmailService';
import { EmailProcessingService } from '../../services/emailProcessingService';

interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: Date;
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  headers?: { [key: string]: string };
  processed?: boolean;
  ticketId?: string;
  error?: string;
  isSimulated?: boolean;
}

export const EmailsSection: React.FC = () => {
  const { useMockAuth } = useAuth();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [inboxes, setInboxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInbox, setSelectedInbox] = useState<string>('all');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [processingResults, setProcessingResults] = useState<any[]>([]);
  const [useRealConnections, setUseRealConnections] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: 'connected' | 'disconnected' | 'testing' }>({});

  useEffect(() => {
    fetchInboxes();
  }, [useMockAuth]);

  const fetchInboxes = async () => {
    try {
      const data = await MockDataService.getInboxes();
      setInboxes(data);
    } catch (error) {
      console.error('Error fetching inboxes:', error);
    }
  };

  const testInboxConnection = async (inbox: any) => {
    setConnectionStatus(prev => ({ ...prev, [inbox.id]: 'testing' }));
    
    try {
      const connection = {
        host: inbox.settings?.host || '',
        port: inbox.settings?.port || 993,
        secure: inbox.settings?.secure || true,
        auth: {
          user: inbox.settings?.auth?.user || inbox.email_address,
          pass: inbox.settings?.auth?.pass || ''
        },
        provider: inbox.provider
      };

      const result = await RealEmailService.testConnection(connection);
      
      if (result.success) {
        setConnectionStatus(prev => ({ ...prev, [inbox.id]: 'connected' }));
        alert(`✅ Connection successful!\n\n${result.message}\n\nDetails: ${JSON.stringify(result.details, null, 2)}`);
      } else {
        setConnectionStatus(prev => ({ ...prev, [inbox.id]: 'disconnected' }));
        alert(`❌ Connection failed: ${result.message}`);
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [inbox.id]: 'disconnected' }));
      alert(`❌ Connection test failed: ${error}`);
    }
  };

  const fetchEmailsFromInbox = async (inboxId: string) => {
    setLoading(true);
    try {
      const inbox = inboxes.find(i => i.id === inboxId);
      if (!inbox) {
        throw new Error('Inbox not found');
      }

      let fetchedEmails: EmailMessage[];

      if (useRealConnections) {
        console.log(`📧 Fetching REAL emails from ${inbox.name}...`);
        
        const connection = {
          host: inbox.settings?.host || '',
          port: inbox.settings?.port || 993,
          secure: inbox.settings?.secure || true,
          auth: {
            user: inbox.settings?.auth?.user || inbox.email_address,
            pass: inbox.settings?.auth?.pass || ''
          },
          provider: inbox.provider
        };

        // Validate connection settings
        if (!connection.host || !connection.auth.user || !connection.auth.pass) {
          throw new Error('Invalid inbox configuration. Please check host, username, and password.');
        }

        fetchedEmails = await RealEmailService.fetchEmailsFromProvider(connection);
        
      } else {
        console.log(`🎭 Simulating email fetch from ${inbox.name}...`);
        fetchedEmails = await EmailProcessingService.fetchEmailsFromProvider({
          host: inbox.settings?.host || '',
          port: inbox.settings?.port || 993,
          secure: inbox.settings?.secure || true,
          auth: {
            user: inbox.settings?.auth?.user || inbox.email_address,
            pass: inbox.settings?.auth?.pass || ''
          },
          provider: inbox.provider
        });
      }
      
      // Convert to our format
      const formattedEmails = fetchedEmails.map(email => ({
        ...email,
        processed: false,
        ticketId: undefined,
        error: undefined,
        isSimulated: !useRealConnections,
        inboxName: inbox.name,
        inboxId: inbox.id
      }));

      setEmails(formattedEmails);
      console.log(`📧 Retrieved ${formattedEmails.length} ${useRealConnections ? 'real' : 'simulated'} emails`);
      
    } catch (error) {
      console.error('Error fetching emails:', error);
      alert(`Failed to fetch emails: ${error}`);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEmails = async () => {
    setLoading(true);
    try {
      const allEmails: EmailMessage[] = [];
      
      for (const inbox of inboxes.filter(i => i.is_active)) {
        try {
          console.log(`📧 Fetching ${useRealConnections ? 'REAL' : 'simulated'} emails from ${inbox.name}...`);
          
          const connection = {
            host: inbox.settings?.host || '',
            port: inbox.settings?.port || 993,
            secure: inbox.settings?.secure || true,
            auth: {
              user: inbox.settings?.auth?.user || inbox.email_address,
              pass: inbox.settings?.auth?.pass || ''
            },
            provider: inbox.provider
          };

          let fetchedEmails: EmailMessage[];

          if (useRealConnections) {
            // Validate connection settings for real connections
            if (!connection.host || !connection.auth.user || !connection.auth.pass || connection.auth.pass === '[ENCRYPTED]') {
              console.warn(`Skipping ${inbox.name}: Invalid or missing credentials`);
              continue;
            }
            
            fetchedEmails = await RealEmailService.fetchEmailsFromProvider(connection);
          } else {
            fetchedEmails = await EmailProcessingService.fetchEmailsFromProvider(connection);
          }
          
          const formattedEmails = fetchedEmails.map(email => ({
            ...email,
            processed: false,
            ticketId: undefined,
            error: undefined,
            isSimulated: !useRealConnections,
            inboxName: inbox.name,
            inboxId: inbox.id
          }));

          allEmails.push(...formattedEmails);
          
        } catch (error) {
          console.error(`Error fetching emails from ${inbox.name}:`, error);
        }
      }
      
      setEmails(allEmails);
      console.log(`📧 Retrieved ${allEmails.length} total ${useRealConnections ? 'real' : 'simulated'} emails from all inboxes`);
      
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const processEmail = async (email: EmailMessage) => {
    try {
      console.log(`🔄 Processing ${email.isSimulated ? 'simulated' : 'real'} email: ${email.subject}`);
      
      // Find the inbox for this email
      const inbox = inboxes.find(i => i.email_address === email.to);
      if (!inbox) {
        throw new Error('No matching inbox found for email');
      }

      const result = await EmailProcessingService.processIncomingEmail(email, inbox.id, useMockAuth);
      
      // Update email status
      setEmails(prev => prev.map(e => 
        e.id === email.id 
          ? { 
              ...e, 
              processed: true, 
              ticketId: result.ticketId,
              error: result.error 
            }
          : e
      ));

      // Add to processing results
      setProcessingResults(prev => [result, ...prev]);
      
      console.log(`✅ Email processed successfully:`, result);
      
    } catch (error) {
      console.error('Error processing email:', error);
      
      // Update email with error
      setEmails(prev => prev.map(e => 
        e.id === email.id 
          ? { 
              ...e, 
              processed: true, 
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          : e
      ));
    }
  };

  const processAllEmails = async () => {
    setLoading(true);
    try {
      const unprocessedEmails = emails.filter(e => !e.processed);
      console.log(`🔄 Processing ${unprocessedEmails.length} ${useRealConnections ? 'real' : 'simulated'} emails...`);
      
      for (const email of unprocessedEmails) {
        await processEmail(email);
        // Add small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`✅ Finished processing all emails`);
      
    } catch (error) {
      console.error('Error processing emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearEmails = () => {
    setEmails([]);
    setProcessingResults([]);
    setSelectedEmail(null);
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.body.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInbox = selectedInbox === 'all' || 
                        (email as any).inboxId === selectedInbox ||
                        email.to === inboxes.find(i => i.id === selectedInbox)?.email_address;
    
    return matchesSearch && matchesInbox;
  });

  const getEmailStatusIcon = (email: EmailMessage) => {
    if (email.error) {
      return <AlertCircle size={16} className="text-red-500" />;
    } else if (email.processed) {
      return <CheckCircle size={16} className="text-green-500" />;
    } else {
      return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getEmailStatusText = (email: EmailMessage) => {
    if (email.error) {
      return 'Error';
    } else if (email.processed) {
      return 'Processed';
    } else {
      return 'Pending';
    }
  };

  const getConnectionIcon = (inboxId: string) => {
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Email Debug Console</h2>
            <p className="text-gray-600 mt-1">
              Debug and monitor email fetching and processing 
              {useRealConnections ? ' (Real Email Servers)' : ' (Simulation Mode)'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Real/Simulation Toggle */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <Settings size={16} className="text-gray-600" />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useRealConnections}
                  onChange={(e) => setUseRealConnections(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">
                  {useRealConnections ? 'Real Email Servers' : 'Simulation Mode'}
                </span>
              </label>
            </div>
            
            <button
              onClick={fetchAllEmails}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : 
                useRealConnections ? <Mail size={16} /> : <TestTube size={16} />
              }
              {useRealConnections ? 'Fetch Real Emails' : 'Generate Simulated Emails'}
            </button>
            <button
              onClick={processAllEmails}
              disabled={loading || emails.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Mail size={16} />
              Process All
            </button>
            <button
              onClick={clearEmails}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Mode Notice */}
      <div className={`px-6 py-3 border-b ${useRealConnections ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-center gap-3">
          {useRealConnections ? (
            <>
              <Wifi size={20} className="text-green-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-green-800 font-medium">Real Email Server Mode</p>
                <p className="text-green-700">
                  Connecting to actual email servers (Gmail, Outlook, IMAP, POP3, Exchange). 
                  Ensure your inbox credentials are properly configured.
                </p>
              </div>
            </>
          ) : (
            <>
              <Info size={20} className="text-yellow-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">Simulation Mode Active</p>
                <p className="text-yellow-700">
                  Generating realistic sample emails for testing. Toggle "Real Email Servers" above to connect to actual email providers.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${useRealConnections ? 'real' : 'simulated'} emails...`}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={selectedInbox}
              onChange={(e) => setSelectedInbox(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Inboxes</option>
              {inboxes.map(inbox => (
                <option key={inbox.id} value={inbox.id}>
                  {inbox.name} ({inbox.email_address})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => selectedInbox !== 'all' && fetchEmailsFromInbox(selectedInbox)}
              disabled={loading || selectedInbox === 'all'}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {useRealConnections ? <Mail size={16} /> : <TestTube size={16} />}
              {useRealConnections ? 'Fetch from Selected' : 'Generate for Selected'}
            </button>
            
            {useRealConnections && selectedInbox !== 'all' && (
              <button
                onClick={() => {
                  const inbox = inboxes.find(i => i.id === selectedInbox);
                  if (inbox) testInboxConnection(inbox);
                }}
                disabled={loading}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {getConnectionIcon(selectedInbox)}
                Test Connection
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {filteredEmails.length} of {emails.length} {useRealConnections ? 'real' : 'simulated'} emails
          </div>
        </div>
      </div>

      {/* Stats */}
      {emails.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              {useRealConnections ? <Mail size={14} className="text-blue-500" /> : <TestTube size={14} className="text-blue-500" />}
              <span>{useRealConnections ? 'Real' : 'Simulated'}: {emails.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              <span>Pending: {emails.filter(e => !e.processed).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500" />
              <span>Processed: {emails.filter(e => e.processed && !e.error).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-red-500" />
              <span>Errors: {emails.filter(e => e.error).length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {loading && emails.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                {useRealConnections ? (
                  <>
                    <Mail size={32} className="animate-pulse text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Connecting to real email servers...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a moment depending on server response</p>
                  </>
                ) : (
                  <>
                    <TestTube size={32} className="animate-pulse text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Generating simulated emails...</p>
                    <p className="text-sm text-gray-500 mt-2">Creating realistic email patterns based on time of day</p>
                  </>
                )}
              </div>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Mail size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {useRealConnections ? 'real' : 'simulated'} emails found
                </h3>
                <p className="text-gray-500 mb-4">
                  {emails.length === 0 
                    ? `Click "${useRealConnections ? 'Fetch Real Emails' : 'Generate Simulated Emails'}" to ${useRealConnections ? 'connect to email servers' : 'create sample emails for testing'}`
                    : 'No emails match your search criteria'
                  }
                </p>
                <div className={`border rounded-lg p-4 max-w-md mx-auto ${useRealConnections ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start gap-3">
                    {useRealConnections ? (
                      <Wifi size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className={`text-sm ${useRealConnections ? 'text-green-800' : 'text-blue-800'}`}>
                      <p className="font-medium mb-1">
                        {useRealConnections ? 'Real Email Server Mode' : 'About Simulation Mode'}
                      </p>
                      <p>
                        {useRealConnections 
                          ? 'Connects to actual email providers (Gmail, Outlook, IMAP, POP3, Exchange) to fetch real emails and convert them to support tickets.'
                          : 'Generates realistic email patterns including booking modifications, cancellations, and support requests to test the email-to-ticket conversion system.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {useRealConnections ? (
                          <Mail size={14} className="text-green-500" />
                        ) : (
                          <TestTube size={14} className="text-blue-500" />
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          useRealConnections 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {useRealConnections ? 'REAL' : 'SIMULATED'}
                        </span>
                        {getEmailStatusIcon(email)}
                        <span className="text-sm font-medium text-gray-900">
                          {getEmailStatusText(email)}
                        </span>
                        {email.ticketId && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Ticket: {email.ticketId}
                          </span>
                        )}
                        {(email as any).inboxName && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            {(email as any).inboxName}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-gray-900 truncate mb-1">
                        {email.subject}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{email.from}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{email.date.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {email.body.substring(0, 150)}...
                      </p>
                      
                      {email.error && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                          Error: {email.error}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          processEmail(email);
                        }}
                        disabled={email.processed || loading}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {email.processed ? 'Processed' : 'Process'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Detail Panel */}
        {selectedEmail && (
          <div className="w-96 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {useRealConnections ? 'Real' : 'Simulated'} Email Details
                </h3>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                <div className={`border rounded-lg p-3 ${
                  useRealConnections 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {useRealConnections ? (
                      <Mail size={16} className="text-green-600" />
                    ) : (
                      <TestTube size={16} className="text-blue-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      useRealConnections ? 'text-green-800' : 'text-blue-800'
                    }`}>
                      {useRealConnections ? 'Real Email' : 'Simulated Email'}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${
                    useRealConnections ? 'text-green-700' : 'text-blue-700'
                  }`}>
                    {useRealConnections 
                      ? 'Fetched from actual email server'
                      : 'Generated test data for debugging email processing'
                    }
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getEmailStatusIcon(selectedEmail)}
                    <span className="text-sm">{getEmailStatusText(selectedEmail)}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">From</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedEmail.from}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">To</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedEmail.to}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedEmail.date.toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Subject</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedEmail.subject}</p>
                </div>
                
                {selectedEmail.ticketId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created Ticket</label>
                    <p className="text-sm text-green-600 mt-1">{selectedEmail.ticketId}</p>
                  </div>
                )}
                
                {selectedEmail.headers && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      {useRealConnections ? 'Email Headers' : 'Simulated Headers'}
                    </label>
                    <div className="mt-1 text-xs bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                      {Object.entries(selectedEmail.headers).map(([key, value]) => (
                        <div key={key} className="mb-1">
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <label className="text-sm font-medium text-gray-500">
                {useRealConnections ? 'Email Body' : 'Simulated Email Body'}
              </label>
              <div className="mt-2 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-96 overflow-y-auto">
                {selectedEmail.body}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Processing Results */}
      {processingResults.length > 0 && (
        <div className="border-t border-gray-200 bg-white p-4 max-h-48 overflow-y-auto">
          <h4 className="font-medium text-gray-900 mb-3">Processing Results</h4>
          <div className="space-y-2">
            {processingResults.slice(0, 10).map((result, index) => (
              <div key={index} className="text-sm flex items-center gap-2">
                {result.error ? (
                  <AlertCircle size={14} className="text-red-500" />
                ) : (
                  <CheckCircle size={14} className="text-green-500" />
                )}
                <span className={result.error ? 'text-red-600' : 'text-green-600'}>
                  {result.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};