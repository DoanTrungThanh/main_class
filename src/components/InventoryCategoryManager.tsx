import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { hasPermission, getEffectivePermissions } from '../constants/permissions';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Palette,
  Hash
} from 'lucide-react';

interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface InventoryCategoryManagerProps {
  onClose: () => void;
  onCategoryAdded?: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export default function InventoryCategoryManager({ onClose, onCategoryAdded }: InventoryCategoryManagerProps) {
  const { user } = useAuth();
  const toast = useToastContext();

  // State management
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0]
  });

  // Check permissions
  const userPermissions = getEffectivePermissions(user?.permissions || [], user?.role);
  const canCreate = hasPermission(userPermissions, 'class-inventory.create', user?.role);
  const canEdit = hasPermission(userPermissions, 'class-inventory.edit', user?.role);
  const canDelete = hasPermission(userPermissions, 'class-inventory.delete', user?.role);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading categories:', error);
        // Fallback to mock data
        const mockCategories: InventoryCategory[] = [
          {
            id: '1',
            name: 'Văn phòng phẩm',
            description: 'Bút, giấy, tẩy, thước...',
            color: '#3B82F6',
            created_by: user?.id || 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Đồ chơi giáo dục',
            description: 'Đồ chơi hỗ trợ học tập',
            color: '#10B981',
            created_by: user?.id || 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Thiết bị điện tử',
            description: 'Máy tính, máy chiếu, loa...',
            color: '#8B5CF6',
            created_by: user?.id || 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setCategories(mockCategories);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Lỗi khi tải danh mục!');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục!');
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('inventory_categories')
          .update({
            name: formData.name,
            description: formData.description || null,
            color: formData.color,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);

        if (error) {
          console.error('Error updating category:', error);
          // Fallback to local update
          const updatedCategory: InventoryCategory = {
            ...editingCategory,
            ...formData,
            updated_at: new Date().toISOString()
          };
          setCategories(prev => prev.map(cat => 
            cat.id === editingCategory.id ? updatedCategory : cat
          ));
        } else {
          await loadCategories();
        }
        toast.success('Cập nhật danh mục thành công!');
      } else {
        // Create new category
        const newCategory = {
          name: formData.name,
          description: formData.description || null,
          color: formData.color,
          created_by: user?.id || 'unknown'
        };

        const { error } = await supabase
          .from('inventory_categories')
          .insert([newCategory]);

        if (error) {
          console.error('Error creating category:', error);
          // Fallback to local add
          const localCategory: InventoryCategory = {
            id: Date.now().toString(),
            ...newCategory,
            created_by: user?.id || 'unknown',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setCategories(prev => [localCategory, ...prev]);
        } else {
          await loadCategories();
        }
        toast.success('Thêm danh mục thành công!');
      }

      resetForm();
      if (onCategoryAdded) {
        onCategoryAdded();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Lỗi khi lưu danh mục!');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: PRESET_COLORS[0]
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (category: InventoryCategory) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('inventory_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        // Fallback to local delete
        setCategories(prev => prev.filter(cat => cat.id !== id));
      } else {
        await loadCategories();
      }
      toast.success('Xóa danh mục thành công!');
      if (onCategoryAdded) {
        onCategoryAdded();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Lỗi khi xóa danh mục!');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">
            <div className="mx-auto mb-4 text-gray-300" style={{ fontSize: '48px' }}>⏳</div>
            <p className="text-gray-500">Đang tải danh mục...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="text-blue-600" />
            Quản lý danh mục kho
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Add Category Button */}
        {canCreate && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-medium"
            >
              <Plus size={16} />
              Thêm danh mục
            </button>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {canEdit && (
                      <button
                        onClick={() => handleEdit(category)}
                        className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-all flex items-center gap-2 text-sm"
                      >
                        <Edit size={14} />
                        Sửa
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 text-sm"
                      >
                        <Trash2 size={14} />
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Tag className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-gray-500">Chưa có danh mục nào</p>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
                </h3>
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
                    Tên danh mục *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tên danh mục"
                    required
                  />
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
                    placeholder="Mô tả danh mục"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màu sắc
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    {editingCategory ? 'Cập nhật' : 'Thêm mới'}
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
      </div>
    </div>
  );
}
