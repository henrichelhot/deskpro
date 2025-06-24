import React, { useState, useEffect } from 'react';
import { X, Plus, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MockDataService } from '../../services/mockDataService';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket: (ticketData: any) => Promise<void>;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onCreateTicket
}) => {
  const { user, useMockAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [airlines, setAirlines] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    category: 'service' as 'service' | 'airline' | 'supplier',
    brand_id: '',
    airline_id: '',
    supplier_id: '',
    tags: [] as string[],
    tagInput: '',
    bookingId: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, useMockAuth]);

  const fetchData = async () => {
    try {
      const [brandsData, airlinesData, suppliersData] = await Promise.all([
        MockDataService.getBrands(),
        MockDataService.getAirlines(),
        MockDataService.getSuppliers()
      ]);
      
      setBrands(brandsData.filter(b => b.is_active));
      setAirlines(airlinesData.filter(a => a.is_active));
      setSuppliers(suppliersData.filter(s => s.is_active));
      
      // Set default brand if available
      if (brandsData.length > 0 && !formData.brand_id) {
        setFormData(prev => ({ ...prev, brand_id: brandsData[0].id }));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const customFields: any = {};
      
      // Add booking ID to custom fields if provided
      if (formData.bookingId.trim()) {
        customFields.booking_id = formData.bookingId.trim();
      }

      const ticketData = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        category: formData.category,
        requester_id: user.id,
        brand_id: formData.brand_id || null,
        airline_id: formData.category === 'airline' ? formData.airline_id || null : null,
        supplier_id: formData.category === 'supplier' ? formData.supplier_id || null : null,
        tags: formData.tags,
        status: 'new',
        satisfaction: 'unoffered',
        custom_fields: customFields
      };

      await onCreateTicket(ticketData);
      
      // Reset form and close modal
      setFormData({
        subject: '',
        description: '',
        priority: 'normal',
        category: 'service',
        brand_id: brands.length > 0 ? brands[0].id : '',
        airline_id: '',
        supplier_id: '',
        tags: [],
        tagInput: '',
        bookingId: ''
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    const tag = formData.tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleCategoryChange = (category: 'service' | 'airline' | 'supplier') => {
    setFormData(prev => ({
      ...prev,
      category,
      airline_id: '',
      supplier_id: ''
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Ticket</h2>
              <p className="text-sm text-gray-600">Submit a new support request</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Requester Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'service', label: 'Service', description: 'General customer service' },
                  { value: 'airline', label: 'Airline', description: 'Airline-related issues' },
                  { value: 'supplier', label: 'Supplier', description: 'Supplier-related issues' }
                ].map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleCategoryChange(category.value as any)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.category === category.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">{category.label}</div>
                    <div className="text-xs text-gray-500">{category.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Selection */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <select
                id="brand"
                required
                value={formData.brand_id}
                onChange={(e) => setFormData(prev => ({ ...prev, brand_id: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Airline Selection (only if category is airline) */}
            {formData.category === 'airline' && (
              <div>
                <label htmlFor="airline" className="block text-sm font-medium text-gray-700 mb-2">
                  Airline *
                </label>
                <select
                  id="airline"
                  required
                  value={formData.airline_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, airline_id: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an airline</option>
                  {airlines.map(airline => (
                    <option key={airline.id} value={airline.id}>
                      {airline.name} {airline.code && `(${airline.code})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Supplier Selection (only if category is supplier) */}
            {formData.category === 'supplier' && (
              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier *
                </label>
                <select
                  id="supplier"
                  required
                  value={formData.supplier_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier_id: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of your issue"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
              />
            </div>

            {/* Booking ID */}
            <div>
              <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-2">
                Booking ID (Optional)
              </label>
              <input
                type="text"
                id="bookingId"
                value={formData.bookingId}
                onChange={(e) => setFormData(prev => ({ ...prev, bookingId: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter booking ID if applicable"
              />
              <p className="text-xs text-gray-500 mt-1">
                If this ticket is related to a specific booking, please provide the booking ID
              </p>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low - General inquiry</option>
                <option value="normal">Normal - Standard issue</option>
                <option value="high">High - Important issue</option>
                <option value="urgent">Urgent - Critical issue</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.tagInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                    onKeyDown={handleTagInputKeyDown}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add tags to categorize your ticket"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
            <p className="text-sm text-gray-500">
              Your ticket will be reviewed by our support team
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.subject.trim() || !formData.description.trim() || !formData.brand_id || 
                  (formData.category === 'airline' && !formData.airline_id) ||
                  (formData.category === 'supplier' && !formData.supplier_id)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};