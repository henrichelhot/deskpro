import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Building2, 
  Globe,
  Palette,
  MoreVertical,
  Upload
} from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  description: string;
  is_default: boolean;
  created_at: string;
}

export const BrandsSection: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([
    {
      id: 'brand-1',
      name: 'ServiceDesk Pro',
      domain: 'support.company.com',
      logo_url: undefined,
      primary_color: '#2563eb',
      secondary_color: '#64748b',
      description: 'Main support brand for customer service',
      is_default: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'brand-2',
      name: 'Enterprise Support',
      domain: 'enterprise.company.com',
      logo_url: undefined,
      primary_color: '#7c3aed',
      secondary_color: '#6b7280',
      description: 'Dedicated support for enterprise clients',
      is_default: false,
      created_at: new Date().toISOString()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBrand = () => {
    setEditingBrand(null);
    setShowAddModal(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setShowAddModal(true);
  };

  const handleDeleteBrand = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    if (brand?.is_default) {
      alert('Cannot delete the default brand');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this brand?')) {
      setBrands(prev => prev.filter(brand => brand.id !== brandId));
    }
  };

  const handleSetDefault = (brandId: string) => {
    setBrands(prev => prev.map(brand => ({
      ...brand,
      is_default: brand.id === brandId
    })));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Brands</h2>
            <p className="text-gray-600 mt-1">Manage brand identities and customization</p>
          </div>
          <button
            onClick={handleAddBrand}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Brand
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
              placeholder="Search brands..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredBrands.length} of {brands.length} brands
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredBrands.length === 0 ? (
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No brands match your search criteria.' : 'Get started by creating your first brand.'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddBrand}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Brand
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <div key={brand.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Brand Header */}
                <div 
                  className="h-24 p-4 flex items-center justify-between"
                  style={{ backgroundColor: brand.primary_color }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      {brand.logo_url ? (
                        <img src={brand.logo_url} alt={brand.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <Building2 size={20} className="text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{brand.name}</h3>
                      {brand.is_default && (
                        <span className="text-xs bg-white bg-opacity-20 text-white px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditBrand(brand)}
                      className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    {!brand.is_default && (
                      <button
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* Brand Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe size={14} />
                    <span>{brand.domain}</span>
                  </div>

                  <p className="text-gray-600 text-sm">{brand.description}</p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Palette size={14} className="text-gray-400" />
                      <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: brand.primary_color }}
                          title="Primary color"
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: brand.secondary_color }}
                          title="Secondary color"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Created {new Date(brand.created_at).toLocaleDateString()}
                    </span>
                    {!brand.is_default && (
                      <button
                        onClick={() => handleSetDefault(brand.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Brand Modal */}
      {showAddModal && (
        <BrandModal
          brand={editingBrand}
          onClose={() => setShowAddModal(false)}
          onSave={(brandData) => {
            if (editingBrand) {
              setBrands(prev => prev.map(b => b.id === editingBrand.id ? { ...b, ...brandData } : b));
            } else {
              const newBrand: Brand = {
                id: `brand-${Date.now()}`,
                ...brandData,
                is_default: brands.length === 0,
                created_at: new Date().toISOString()
              };
              setBrands(prev => [...prev, newBrand]);
            }
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

interface BrandModalProps {
  brand: Brand | null;
  onClose: () => void;
  onSave: (brandData: any) => void;
}

const BrandModal: React.FC<BrandModalProps> = ({ brand, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: brand?.name || '',
    domain: brand?.domain || '',
    description: brand?.description || '',
    primary_color: brand?.primary_color || '#2563eb',
    secondary_color: brand?.secondary_color || '#64748b',
    logo_url: brand?.logo_url || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {brand ? 'Edit Brand' : 'Create New Brand'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter brand name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain
            </label>
            <input
              type="text"
              required
              value={formData.domain}
              onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="support.company.com"
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
              placeholder="Describe this brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#2563eb"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#64748b"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL (Optional)
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/logo.png"
            />
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
              {brand ? 'Update' : 'Create'} Brand
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};