import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { classInventoryService } from '../lib/supabaseService';
import { hasPermission, getEffectivePermissions } from '../constants/permissions';
import InventoryCategoryManager from './InventoryCategoryManager';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Users,
  Hash,
  Tag,
  Settings,
  Grid3X3,
  List,
  Layers,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface ClassInventoryItem {
  id: string;
  title: string;
  quantity: number;
  category_id: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function ClassInventoryManager() {
  const { user } = useAuth();
  const toast = useToastContext();
  const { classInventory, inventoryCategories, refreshData } = useData();

  // State management
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassInventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'categories'>('inventory');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    quantity: 1,
    category_id: '',
    description: ''
  });

  // Check permissions
  const userPermissions = getEffectivePermissions(user?.permissions || [], user?.role);
  const canView = hasPermission(userPermissions, 'class-inventory.view', user?.role);
  const canCreate = hasPermission(userPermissions, 'class-inventory.create', user?.role);
  const canEdit = hasPermission(userPermissions, 'class-inventory.edit', user?.role);
  const canDelete = hasPermission(userPermissions, 'class-inventory.delete', user?.role);

  // Data is now loaded from DataContext, no need for separate loading





  // Filter inventory items
  const filteredInventory = classInventory.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get category info
  const getCategoryInfo = (categoryId: string) => {
    const category = inventoryCategories.find(c => c.id === categoryId);
    return category || { name: 'Danh mục không xác định', color: '#6B7280' };
  };

  // Get inventory statistics
  const getInventoryStats = () => {
    const totalCategories = categories.length;
    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = inventory.filter(item => item.quantity <= 10).length;

    return { totalCategories, totalItems, totalQuantity, lowStockItems };
  };

  const stats = getInventoryStats();

  // Render inventory table
  const renderInventoryTable = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Search and Filter */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Tìm kiếm vật phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-auto px-2 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả danh mục</option>
            {inventoryCategories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên vật phẩm
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Danh mục
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số lượng
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item) => {
                const categoryInfo = getCategoryInfo(item.category_id);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="text-blue-600 mr-2" size={16} />
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: categoryInfo.color }}
                      >
                        {categoryInfo.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${item.quantity <= 10 ? 'text-orange-600' : 'text-green-600'}`}>
                          {item.quantity}
                        </span>
                        {item.quantity <= 10 && (
                          <AlertTriangle size={14} className="text-orange-500 ml-1" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {item.description || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1">
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <Package className="mx-auto mb-2 text-gray-300" size={32} />
                  <p className="text-gray-500 text-sm">
                    {searchTerm || selectedCategory ? 'Không tìm thấy vật phẩm nào' : 'Chưa có vật phẩm nào trong kho'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      {filteredInventory.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-700">
            Hiển thị <span className="font-medium">{filteredInventory.length}</span> vật phẩm
          </div>
        </div>
      )}
    </div>
  );

  // Render categories table
  const renderCategoriesTable = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900">Quản lý danh mục</h3>
        <button
          onClick={() => setShowCategoryManager(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
        >
          <Plus size={14} />
          Thêm danh mục
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên danh mục
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Màu sắc
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số vật phẩm
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventoryCategories.length > 0 ? (
              inventoryCategories.map((category) => {
                const itemCount = classInventory.filter(item => item.category_id === category.id).length;
                return (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Tag className="text-blue-600 mr-2" size={16} />
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-xs text-gray-600">{category.color}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{itemCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {category.description || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setShowCategoryManager(true)}
                          className="text-yellow-600 hover:text-yellow-900 p-1"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {/* Handle delete category */}}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <Tag className="mx-auto mb-2 text-gray-300" size={32} />
                  <p className="text-gray-500 text-sm">Chưa có danh mục nào</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.category_id) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      if (editingItem) {
        // Update existing item using service
        await classInventoryService.update(editingItem.id, {
          title: formData.title,
          quantity: formData.quantity,
          category_id: formData.category_id,
          description: formData.description || null,
        });
        toast.success('Cập nhật vật phẩm thành công!');
      } else {
        // Create new item using service
        await classInventoryService.create({
          title: formData.title,
          quantity: formData.quantity,
          category_id: formData.category_id,
          description: formData.description || null,
          created_by: user?.id || 'unknown'
        });
        toast.success('Thêm vật phẩm thành công!');
      }

      // Refresh data from DataContext
      await refreshData();

      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Lỗi khi lưu vật phẩm!');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      quantity: 1,
      category_id: '',
      description: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (item: ClassInventoryItem) => {
    setFormData({
      title: item.title,
      quantity: item.quantity,
      category_id: item.category_id,
      description: item.description || ''
    });
    setEditingItem(item);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vật phẩm này?')) {
      return;
    }

    try {
      await classInventoryService.delete(id);
      await refreshData();
      toast.success('Xóa vật phẩm thành công!');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Lỗi khi xóa vật phẩm!');
    }
  };

  // Check permissions
  if (!canView) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 text-gray-300" style={{ fontSize: '48px' }}>🚫</div>
        <p className="text-gray-500">Bạn không có quyền truy cập chức năng này</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 text-gray-300" style={{ fontSize: '48px' }}>⏳</div>
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Quản lý kho lớp
        </h1>
        <p className="text-gray-600 text-sm">
          Quản lý vật phẩm và thiết bị theo danh mục
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <div
          className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all ${
            activeTab === 'inventory'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('inventory')}
        >
          <div className="flex items-center gap-2">
            <Package className={`${activeTab === 'inventory' ? 'text-blue-600' : 'text-gray-400'}`} size={18} />
            <div>
              <h3 className={`text-sm font-medium ${activeTab === 'inventory' ? 'text-blue-900' : 'text-gray-700'}`}>
                Vật phẩm kho
              </h3>
              <p className={`text-xs ${activeTab === 'inventory' ? 'text-blue-600' : 'text-gray-500'}`}>
                Quản lý vật phẩm trong kho
              </p>
            </div>
          </div>
        </div>

        <div
          className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all ${
            activeTab === 'categories'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('categories')}
        >
          <div className="flex items-center gap-2">
            <Tag className={`${activeTab === 'categories' ? 'text-purple-600' : 'text-gray-400'}`} size={18} />
            <div>
              <h3 className={`text-sm font-medium ${activeTab === 'categories' ? 'text-purple-900' : 'text-gray-700'}`}>
                Danh mục
              </h3>
              <p className={`text-xs ${activeTab === 'categories' ? 'text-purple-600' : 'text-gray-500'}`}>
                Quản lý danh mục sản phẩm
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
          <div className="flex items-center justify-center mb-1">
            <Tag className="text-blue-600" size={20} />
          </div>
          <div className="text-xl font-bold text-gray-900">{stats.totalCategories}</div>
          <div className="text-xs text-gray-600">Danh mục</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
          <div className="flex items-center justify-center mb-1">
            <Package className="text-green-600" size={20} />
          </div>
          <div className="text-xl font-bold text-gray-900">{stats.totalItems}</div>
          <div className="text-xs text-gray-600">Loại vật phẩm</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
          <div className="flex items-center justify-center mb-1">
            <Hash className="text-purple-600" size={20} />
          </div>
          <div className="text-xl font-bold text-gray-900">{stats.totalQuantity}</div>
          <div className="text-xs text-gray-600">Tổng số lượng</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
          <div className="flex items-center justify-center mb-1">
            <AlertTriangle className="text-orange-600" size={20} />
          </div>
          <div className="text-xl font-bold text-gray-900">{stats.lowStockItems}</div>
          <div className="text-xs text-gray-600">Sắp hết hàng</div>
        </div>
      </div>

      {/* Action buttons */}
      {activeTab === 'inventory' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex flex-wrap gap-2">
            {canCreate && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
              >
                <Plus size={14} />
                Thêm vật phẩm
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'inventory' && renderInventoryTable()}
      {activeTab === 'categories' && renderCategoriesTable()}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Sửa vật phẩm' : 'Thêm vật phẩm'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên vật phẩm *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên vật phẩm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {inventoryCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Mô tả chi tiết về vật phẩm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingItem ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <InventoryCategoryManager
          onClose={() => setShowCategoryManager(false)}
          onCategoryAdded={() => loadCategories()}
        />
      )}
    </div>
  );
}
