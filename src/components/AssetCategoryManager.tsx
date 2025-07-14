import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { AssetCategory } from '../types';
import { assetCategoriesService } from '../lib/supabaseService';
import { useToastContext } from '../context/ToastContext';

interface AssetCategoryManagerProps {
  onCategoryChange?: () => void;
}

export default function AssetCategoryManager({ onCategoryChange }: AssetCategoryManagerProps) {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToastContext();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isActive: true,
  });

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await assetCategoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Có lỗi khi tải danh mục!');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      isActive: true,
    });
    setEditingCategory(null);
  };

  const openModal = (category?: AssetCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color,
        isActive: category.isActive,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục!');
      return;
    }

    try {
      setLoading(true);
      
      if (editingCategory) {
        await assetCategoriesService.update(editingCategory.id, formData);
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await assetCategoriesService.create(formData);
        toast.success('Thêm danh mục thành công!');
      }
      
      await loadCategories();
      onCategoryChange?.();
      closeModal();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Có lỗi khi lưu danh mục!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category: AssetCategory) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await assetCategoriesService.delete(category.id);
      toast.success('Xóa danh mục thành công!');
      await loadCategories();
      onCategoryChange?.();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Có lỗi khi xóa danh mục!');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (category: AssetCategory) => {
    try {
      setLoading(true);
      await assetCategoriesService.update(category.id, {
        isActive: !category.isActive
      });
      toast.success('Cập nhật trạng thái thành công!');
      await loadCategories();
      onCategoryChange?.();
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error('Có lỗi khi cập nhật trạng thái!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý danh mục</h3>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Thêm danh mục
        </button>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <h4 className="font-medium text-gray-900">{category.name}</h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openModal(category)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            {category.description && (
              <p className="text-sm text-gray-600 mb-3">{category.description}</p>
            )}
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                category.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {category.isActive ? 'Hoạt động' : 'Tạm dừng'}
              </span>
              <button
                onClick={() => toggleStatus(category)}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                {category.isActive ? 'Tạm dừng' : 'Kích hoạt'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên danh mục..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả danh mục..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu sắc
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Kích hoạt danh mục
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Thêm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
