import React, { useState } from 'react';
import { 
  MessageCircle, 
  Reply, 
  Info, 
  History, 
  Eye, 
  Clock, 
  User as UserIcon, 
  Tag, 
  Calendar, 
  Edit3,
  ExternalLink,
  Mail,
  Plus,
  X,
  Send,
  Bookmark,
  Plane,
  Building
} from 'lucide-react';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { AssigneeSelector } from './AssigneeSelector';
import { formatDistanceToNow, format } from 'date-fns';
import { useTicketDetail } from '../../hooks/useTicketDetail';
import { useAuth } from '../../hooks/useAuth';
import { TicketService } from '../../services/ticketService';
import { MockDataService } from '../../services/mockDataService';

interface TicketDetailViewProps {
  ticket: any;
  onUpdateTicket: (updates: any) => void;
}

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({
  ticket: initialTicket,
  onUpdateTicket
}) => {
  const { user, useMockAuth } = useAuth();
  const { ticket, loading, viewers, addComment, updateTicket } = useTicketDetail(initialTicket?.id);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [replyTo, setReplyTo] = useState('');
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState('');
  const [showCcSuggestions, setShowCcSuggestions] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);

  // Use the detailed ticket data if available, otherwise fall back to initial ticket
  const currentTicket = ticket || initialTicket;

  React.useEffect(() => {
    if (currentTicket?.requester?.email) {
      setReplyTo(currentTicket.requester.email);
    }
  }, [currentTicket]);

  React.useEffect(() => {
    const fetchAgents = async () => {
      try {
        let agentData
        if (useMockAuth) {
          agentData = await MockDataService.getAgents()
        } else {
          agentData = await TicketService.getAgents()
        }
        setAgents(agentData);
      } catch (err) {
        console.error('Error fetching agents:', err);
      }
    };
    fetchAgents();
  }, [useMockAuth]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    try {
      await addComment(newComment.trim(), isInternal);
      setNewComment('');
      setCcEmails([]);
      setCcInput('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleAssigneeChange = async (assignee: any) => {
    if (!user || !currentTicket) return;
    
    try {
      if (useMockAuth) {
        await MockDataService.assignTicket(currentTicket.id, assignee?.id || null, user.id);
      } else {
        await TicketService.assignTicket(currentTicket.id, assignee?.id || null, user.id);
      }
      onUpdateTicket({ assignee });
    } catch (err) {
      console.error('Error updating assignee:', err);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!currentTicket) return;
    
    try {
      await updateTicket({ status });
      onUpdateTicket({ status });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handlePriorityChange = async (priority: string) => {
    if (!currentTicket) return;
    
    try {
      await updateTicket({ priority });
      onUpdateTicket({ priority });
    } catch (err) {
      console.error('Error updating priority:', err);
    }
  };

  const addCcEmail = (email: string) => {
    if (email && !ccEmails.includes(email)) {
      setCcEmails([...ccEmails, email]);
      setCcInput('');
      setShowCcSuggestions(false);
    }
  };

  const removeCcEmail = (email: string) => {
    setCcEmails(ccEmails.filter(e => e !== email));
  };

  const getSuggestedEmails = () => {
    if (!ccInput) return [];
    return agents
      .filter(agent => 
        agent.email.toLowerCase().includes(ccInput.toLowerCase()) ||
        agent.name.toLowerCase().includes(ccInput.toLowerCase())
      )
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!currentTicket) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Ticket not found</p>
        </div>
      </div>
    );
  }

  const isAgent = user?.role === 'agent' || user?.role === 'admin';

  // Get booking ID from custom fields
  const bookingId = currentTicket?.custom_fields?.booking_id;

  // Filter viewers to exclude current user and only show agents/admins
  const activeViewers = viewers.filter(viewer => 
    viewer.user_id !== user?.id && 
    viewer.user && 
    (viewer.user.role === 'agent' || viewer.user.role === 'admin')
  );

  console.log('TicketDetailView render - viewers:', viewers);
  console.log('TicketDetailView render - activeViewers:', activeViewers);
  console.log('TicketDetailView render - current user:', user?.id);

  // Get category display info
  const getCategoryInfo = () => {
    switch (currentTicket.category) {
      case 'airline':
        return {
          icon: Plane,
          label: 'Airline',
          color: 'text-blue-600 bg-blue-50',
          entity: currentTicket.airline
        };
      case 'supplier':
        return {
          icon: Building,
          label: 'Supplier',
          color: 'text-green-600 bg-green-50',
          entity: currentTicket.supplier
        };
      default:
        return {
          icon: UserIcon,
          label: 'Service',
          color: 'text-purple-600 bg-purple-50',
          entity: null
        };
    }
  };

  const categoryInfo = getCategoryInfo();
  const CategoryIcon = categoryInfo.icon;

  return (
    <div className="flex-1 flex bg-gray-50 h-full overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-xl font-semibold text-gray-900">Ticket #{currentTicket.ticket_number}</h1>
                <TicketStatusBadge status={currentTicket.status} />
                <TicketPriorityBadge priority={currentTicket.priority} />
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${categoryInfo.color}`}>
                  <CategoryIcon size={16} />
                  <span className="text-sm font-medium">{categoryInfo.label}</span>
                </div>
              </div>
              <h2 className="text-lg text-gray-700">{currentTicket.subject}</h2>
            </div>
            
            {/* Viewing Agents */}
            {activeViewers.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                    <Eye size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700">{activeViewers.length}</span>
                    <span className="text-xs text-green-600">viewing</span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 mb-3">Currently viewing:</p>
                      <div className="space-y-2">
                        {activeViewers.map(viewer => (
                          <div key={viewer.id} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {viewer.user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-700">{viewer.user?.name}</span>
                              <div className="text-xs text-gray-500">
                                Last seen {format(new Date(viewer.last_viewed), 'HH:mm')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-8">
            
            {/* Messages Section */}
            <section className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <MessageCircle size={20} className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                  <span className="text-sm text-gray-500">({currentTicket.comments?.length || 0})</span>
                </div>
              </div>
              <div className="p-6">
                {!currentTicket.comments || currentTicket.comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Initial ticket description */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {currentTicket.requester?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{currentTicket.requester?.name}</span>
                            <span className="text-sm text-gray-500">
                              {format(new Date(currentTicket.created_at), 'MMM d, yyyy • HH:mm')}
                            </span>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 leading-relaxed">{currentTicket.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comments */}
                    {currentTicket.comments
                      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((comment: any) => (
                      <div key={comment.id} className={`${comment.is_internal ? 'bg-yellow-50 border border-yellow-200 rounded-lg p-4' : ''}`}>
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                            {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-gray-900">{comment.author?.name}</span>
                              {comment.is_internal && (
                                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium">
                                  Internal Note
                                </span>
                              )}
                              <span className="text-sm text-gray-500">
                                {format(new Date(comment.created_at), 'MMM d, yyyy • HH:mm')}
                              </span>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Reply Section - Only show if user can reply */}
            {(isAgent || currentTicket.requester?.id === user?.id) && (
              <section className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Reply size={20} className="text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Reply</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex gap-4 mb-4">
                      <button
                        type="button"
                        onClick={() => setIsInternal(false)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          !isInternal 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Mail className="inline w-4 h-4 mr-2" />
                        Public Reply
                      </button>
                      {isAgent && (
                        <button
                          type="button"
                          onClick={() => setIsInternal(true)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isInternal 
                              ? 'bg-yellow-600 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Edit3 className="inline w-4 h-4 mr-2" />
                          Internal Note
                        </button>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSubmitReply} className="space-y-4">
                    {!isInternal && (
                      <>
                        {/* Reply To Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reply to
                          </label>
                          <input
                            type="email"
                            value={replyTo}
                            onChange={(e) => setReplyTo(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="recipient@email.com"
                          />
                        </div>

                        {/* CC Field */}
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CC
                          </label>
                          <div className="border border-gray-300 rounded-lg p-2 min-h-[44px] flex flex-wrap gap-2 items-center">
                            {ccEmails.map(email => (
                              <span key={email} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                                {email}
                                <button
                                  type="button"
                                  onClick={() => removeCcEmail(email)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            ))}
                            <input
                              type="email"
                              value={ccInput}
                              onChange={(e) => {
                                setCcInput(e.target.value);
                                setShowCcSuggestions(e.target.value.length > 0);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && ccInput) {
                                  e.preventDefault();
                                  addCcEmail(ccInput);
                                }
                              }}
                              className="flex-1 min-w-[200px] outline-none"
                              placeholder="Add CC recipients..."
                            />
                          </div>
                          
                          {/* CC Suggestions */}
                          {showCcSuggestions && getSuggestedEmails().length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              {getSuggestedEmails().map(agent => (
                                <button
                                  key={agent.id}
                                  type="button"
                                  onClick={() => addCcEmail(agent.email)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                                    {agent.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{agent.name}</div>
                                    <div className="text-sm text-gray-500">{agent.email}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Message Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isInternal ? 'Internal Note' : 'Message'}
                      </label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={isInternal ? "Add an internal note..." : "Type your reply..."}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={6}
                        required
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {!isInternal && (
                          <span>This will send an email to the customer with ticket #{currentTicket.ticket_number}</span>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                          isInternal
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Send size={16} />
                        {isInternal ? 'Add Internal Note' : 'Send Reply'}
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          
          {/* Ticket Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Info size={20} className="text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Ticket Information</h3>
            </div>
            
            <div className="space-y-4">
              {/* Created Date */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                <p className="text-gray-900">{format(new Date(currentTicket.created_at), 'MMM d, yyyy • HH:mm')}</p>
              </div>

              {/* Ticket Number */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Ticket Number</label>
                <p className="text-gray-900 font-mono">{currentTicket.ticket_number}</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${categoryInfo.color}`}>
                  <CategoryIcon size={16} />
                  <span className="text-sm font-medium">{categoryInfo.label}</span>
                </div>
              </div>

              {/* Brand */}
              {currentTicket.brand && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Brand</label>
                  <p className="text-gray-900">{currentTicket.brand.name}</p>
                </div>
              )}

              {/* Airline/Supplier specific info */}
              {categoryInfo.entity && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {currentTicket.category === 'airline' ? 'Airline' : 'Supplier'}
                  </label>
                  <div className="space-y-1">
                    <p className="text-gray-900 font-medium">{categoryInfo.entity.name}</p>
                    <p className="text-sm text-gray-600">{categoryInfo.entity.email}</p>
                    {currentTicket.category === 'airline' && categoryInfo.entity.code && (
                      <p className="text-sm text-gray-500">Code: {categoryInfo.entity.code}</p>
                    )}
                    {currentTicket.category === 'supplier' && categoryInfo.entity.contact_person && (
                      <p className="text-sm text-gray-500">Contact: {categoryInfo.entity.contact_person}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Booking ID */}
              {bookingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Booking ID</label>
                  <div className="flex items-center gap-2">
                    <Bookmark size={16} className="text-blue-600" />
                    <a
                      href={`https://reservations.voyagesalacarte.ca/booking/index/${bookingId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-mono text-sm flex items-center gap-1 hover:underline"
                    >
                      {bookingId}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}

              {/* Requester */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Requester</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {currentTicket.requester?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{currentTicket.requester?.name}</p>
                    <p className="text-sm text-gray-600">{currentTicket.requester?.email}</p>
                  </div>
                </div>
              </div>

              {/* Assignee with Autocomplete - Only for agents */}
              {isAgent && (
                <AssigneeSelector
                  currentAssignee={currentTicket.assignee}
                  agents={agents}
                  currentUser={user}
                  onAssigneeChange={handleAssigneeChange}
                />
              )}

              {/* Status - Only for agents */}
              {isAgent && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
                  <select
                    value={currentTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="new">New</option>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="on-hold">On Hold</option>
                    <option value="solved">Solved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              )}

              {/* Priority - Only for agents */}
              {isAgent && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Priority</label>
                  <select
                    value={currentTicket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              )}

              {/* Tags */}
              {currentTicket.tags && currentTicket.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {currentTicket.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* History Section - Only for agents */}
          {isAgent && currentTicket.ticket_changes && currentTicket.ticket_changes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <History size={20} className="text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">History</h3>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {currentTicket.ticket_changes
                  .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((change: any) => (
                  <div key={change.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {change.agent?.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{change.agent?.name}</p>
                        <p className="text-xs text-gray-600 mb-1">{change.action}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(change.created_at), 'MMM d • HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};