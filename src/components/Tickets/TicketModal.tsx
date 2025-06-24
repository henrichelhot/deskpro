import React, { useState } from 'react';
import { Ticket, Comment, User } from '../../types';
import { X, MessageCircle, Clock, User as UserIcon, Tag, Calendar } from 'lucide-react';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { formatDistanceToNow, format } from 'date-fns';

interface TicketModalProps {
  ticket: Ticket;
  comments: Comment[];
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTicket: (updates: Partial<Ticket>) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  ticket,
  comments,
  users,
  isOpen,
  onClose,
  onUpdateTicket
}) => {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  if (!isOpen) return null;

  const agents = users.filter(user => user.role === 'agent');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // In a real app, this would make an API call
    console.log('New comment:', { content: newComment, isInternal });
    setNewComment('');
    setIsInternal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Ticket #{ticket.id}</h2>
            <p className="text-gray-600 mt-1">{ticket.subject}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Ticket Info */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <TicketStatusBadge status={ticket.status} />
                <TicketPriorityBadge priority={ticket.priority} />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={16} />
                  Created {formatDistanceToNow(ticket.createdAt, { addSuffix: true })}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{ticket.description}</p>
              </div>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {comments.filter(comment => comment.ticketId === ticket.id).map(comment => (
                  <div key={comment.id} className={`flex gap-3 ${comment.isInternal ? 'bg-yellow-50 p-3 rounded-lg' : ''}`}>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.author.name}</span>
                        {comment.isInternal && (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                            Internal
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Comment Form */}
            <form onSubmit={handleSubmitComment} className="p-6 border-t border-gray-200">
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Internal comment</span>
                </label>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Comment
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-gray-200 bg-gray-50">
            <div className="p-6 space-y-6">
              {/* Requester */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Requester</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {ticket.requester.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{ticket.requester.name}</p>
                    <p className="text-sm text-gray-500">{ticket.requester.email}</p>
                  </div>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Assignee</h3>
                <select
                  value={ticket.assignee?.id || ''}
                  onChange={(e) => {
                    const assignee = agents.find(agent => agent.id === e.target.value);
                    onUpdateTicket({ assignee });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Unassigned</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Status</h3>
                <select
                  value={ticket.status}
                  onChange={(e) => onUpdateTicket({ status: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="new">New</option>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="on-hold">On Hold</option>
                  <option value="solved">Solved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Priority</h3>
                <select
                  value={ticket.priority}
                  onChange={(e) => onUpdateTicket({ priority: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {ticket.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Important Dates</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span>{format(ticket.createdAt, 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Updated:</span>
                    <span>{format(ticket.updatedAt, 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  {ticket.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Due:</span>
                      <span>{format(ticket.dueDate, 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};