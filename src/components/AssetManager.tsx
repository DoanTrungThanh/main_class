import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { hasPermission } from '../constants/permissions';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Save,
  Download,
  Upload,
  ArrowUpDown,
  FileText,
  ArrowRight,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import { Asset } from '../types';
import { exportAssets } from '../lib/excelExport';
import AssetCategoryManager from './AssetCategoryManager';
import AssetDistributionManager from './AssetDistributionManager';

export default function AssetManager() {
  const {
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    refreshData
  } = useData();
  const { user } = useAuth();
  const toast = useToastContext();
  const [activeTab, setActiveTab] = useState<'assets' | 'categories' | 'distributions'>('assets');
  const [showModal, setShowModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'maintenance'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 1,
    status: 'available' as 'available' | 'distributed' | 'maintenance',
    assignedTo: '',
    receivedDate: '',
    description: '',
  });
  const [receiveFormData, setReceiveFormData] = useState({
    name: '',
    category: '',
    quantity: 1,
    receivedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });


  // Kiểm tra quyền dựa trên permissions
  const userPermissions = user?.permissions || [];
  const userRole = user?.role;
  const canViewAssets = hasPermission(userPermissions, 'assets.view', userRole);
  const canCreateAssets = hasPermission(userPermissions, 'assets.create', userRole);
  const canEditAssets = hasPermission(userPermissions, 'assets.edit', userRole);
  const canDeleteAssets = hasPermission(userPermissions, 'assets.delete', userRole);
  const canManageAssets = canEditAssets || canDeleteAssets;

  const categories = ['Thiết bị điện tử', 'Đồ dùng văn phòng', 'Thiết bị dạy học', 'Nội thất', 'Khác'];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusStats = () => {
    return {
      available: assets.filter(a => a.status === 'available').length,
      maintenance: assets.filter(a => a.status === 'maintenance').length,
    };
  };

  const stats = getStatusStats();

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 1,
      status: 'available',
      assignedTo: '',
      receivedDate: '',
      description: '',
    });
    setEditingAsset(null);
  };

  const resetReceiveForm = () => {
    setReceiveFormData({
      name: '',
      category: '',
      quantity: 1,
      receivedDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAsset) {
        await updateAsset(editingAsset.id, formData);
        toast.success('Cập nhật tài sản thành công!');
      } else {
        await addAsset(formData);
        toast.success('Thêm tài sản thành công!');
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving asset:', error);
      toast.error('Có lỗi xảy ra khi lưu tài sản!');
    }
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!receiveFormData.name.trim()) {
        toast.error('Vui lòng nhập tên tài sản!');
        return;
      }

      if (!receiveFormData.category.trim()) {
        toast.error('Vui lòng chọn danh mục!');
        return;
      }

      if (receiveFormData.quantity <= 0) {
        toast.error('Số lượng phải lớn hơn 0!');
        return;
      }

      const assetData = {
        name: receiveFormData.name.trim(),
        category: receiveFormData.category,
        quantity: receiveFormData.quantity,
        status: 'available' as const,
        receivedDate: receiveFormData.receivedDate || new Date().toISOString().split('T')[0],
        description: receiveFormData.notes.trim() || undefined,
      };

      // Receiving new assets
      await addAsset(assetData);

      toast.success(`Đã nhận ${receiveFormData.quantity} ${receiveFormData.name}`);
      setShowReceiveModal(false);
      resetReceiveForm();
    } catch (error) {
      console.error('Error receiving asset:', error);
      toast.error(`Có lỗi xảy ra khi nhận tài sản: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };



  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      category: asset.category,
      quantity: asset.quantity,
      status: asset.status,
      assignedTo: asset.assignedTo || '',
      receivedDate: asset.receivedDate,
      description: asset.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài sản này?')) {
      try {
        await deleteAsset(id);
        toast.success('Xóa tài sản thành công!');
      } catch (error) {
        console.error('Error deleting asset:', error);
        toast.error('Có lỗi xảy ra khi xóa tài sản!');
      }
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'distributed':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'distributed':
        return 'Đã phân phối';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return CheckCircle;
      case 'distributed':
        return User;
      case 'maintenance':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getStaffName = (staffId: string) => {
    // For now, just return the staffId as name since staff data is not available
    return staffId || 'Không xác định';
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportAssets(filteredAssets);
      toast.success('Xuất dữ liệu thành công!');
    } catch (error) {
      console.error('Error exporting assets:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  // Kiểm tra quyền xem assets
  if (!canViewAssets) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 text-gray-300" style={{ fontSize: '48px' }}>🚫</div>
        <p className="text-gray-500">Bạn không có quyền truy cập chức năng này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tài sản</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý tài sản của trung tâm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <Download size={20} />
            {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
          {canCreateAssets && (
            <>
              <button
                onClick={() => setShowReceiveModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Nhận tài sản
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                Thêm tài sản
              </button>

            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('assets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package size={16} />
              Tài sản
            </div>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings size={16} />
              Danh mục
            </div>
          </button>
          <button
            onClick={() => setActiveTab('distributions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'distributions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ArrowRight size={16} />
              Phân phối
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'categories' ? (
        <AssetCategoryManager />
      ) : activeTab === 'distributions' ? (
        <AssetDistributionManager />
      ) : (
        <>
          {/* Thống kê tổng quan - Mobile Optimized */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-gray-100">
              <Package size={16} className="text-gray-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Tổng tài sản</p>
            <p className="text-lg font-bold text-gray-900">{assets.length}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-green-100">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Có sẵn</p>
            <p className="text-lg font-bold text-green-600">{stats.available}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-yellow-100">
              <AlertCircle size={16} className="text-yellow-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Bảo trì</p>
            <p className="text-lg font-bold text-yellow-600">{stats.maintenance}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm tài sản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="available">Có sẵn</option>
            <option value="maintenance">Bảo trì</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => {
            const StatusIcon = getStatusIcon(asset.status);
            return (
              <div key={asset.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                      <p className="text-sm text-gray-600">{asset.category}</p>
                    </div>
                  </div>
                  {(canEditAssets || canDeleteAssets) && (
                    <div className="flex items-center gap-2">
                      {canEditAssets && (
                        <button
                          onClick={() => handleEdit(asset)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {canDeleteAssets && (
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Số lượng:</span>
                    <span className="font-semibold text-gray-900">{asset.quantity}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(asset.status)}`}>
                      <StatusIcon size={12} />
                      {getStatusLabel(asset.status)}
                    </span>
                  </div>

                  {asset.assignedTo && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Được giao cho:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getStaffName(asset.assignedTo)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ngày nhận:</span>
                    <span className="text-sm text-gray-900">
                      {asset.receivedDate ? new Date(asset.receivedDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                    </span>
                  </div>

                  {asset.description && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{asset.description}</p>
                    </div>
                  )}
                  

                </div>
              </div>
            );
          })}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-8">
            <Package className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Không tìm thấy tài sản nào' 
                : 'Chưa có tài sản nào'}
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAsset ? 'Chỉnh sửa tài sản' : 'Thêm tài sản mới'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tài sản *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="available">Có sẵn</option>
                  <option value="maintenance">Bảo trì</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày nhận *
                </label>
                <input
                  type="date"
                  value={formData.receivedDate}
                  onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingAsset ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Asset Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Nhận tài sản mới
              </h2>
              <button
                onClick={() => {
                  setShowReceiveModal(false);
                  resetReceiveForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleReceiveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tài sản *
                </label>
                <input
                  type="text"
                  value={receiveFormData.name}
                  onChange={(e) => setReceiveFormData({...receiveFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục *
                </label>
                <select
                  value={receiveFormData.category}
                  onChange={(e) => setReceiveFormData({...receiveFormData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng *
                </label>
                <input
                  type="number"
                  min="1"
                  value={receiveFormData.quantity}
                  onChange={(e) => setReceiveFormData({ ...receiveFormData, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày nhận *
                </label>
                <input
                  type="date"
                  value={receiveFormData.receivedDate}
                  onChange={(e) => setReceiveFormData({ ...receiveFormData, receivedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={receiveFormData.notes}
                  onChange={(e) => setReceiveFormData({ ...receiveFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Thông tin về nguồn gốc tài sản..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReceiveModal(false);
                    resetReceiveForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Nhận tài sản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}