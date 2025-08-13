import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, X, Calendar, User, Package, Download, ArrowLeft, ChevronDown } from 'lucide-react';
import { AssetDistribution } from '../types';
import { assetDistributionsService } from '../lib/supabaseService';
import { useToastContext } from '../context/ToastContext';
import { useData } from '../context/DataContext';

export default function AssetDistributionManager() {
  const [distributions, setDistributions] = useState<AssetDistribution[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDistribution, setEditingDistribution] = useState<AssetDistribution | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'returned'>('all');
  const [itemSearchTerm, setItemSearchTerm] = useState(''); // Tìm kiếm trong modal
  const [showItemList, setShowItemList] = useState(false); // Hiển thị danh sách items
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref cho dropdown
  const toast = useToastContext();
  const { refreshData, assets, classInventory, inventoryCategories } = useData();

  const [formData, setFormData] = useState({
    sourceType: 'asset' as 'asset' | 'inventory', // Nguồn: tài sản hoặc kho lớp
    sourceId: '', // ID của item được chọn
    assetName: '',
    quantity: 1,
    maxQuantity: 1, // Số lượng tối đa có thể phân phối
    assignedTo: '',
    distributedDate: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'active' as 'active' | 'returned',
  });

  useEffect(() => {
    loadDistributions();
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowItemList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadDistributions = async () => {
    try {
      setLoading(true);
      const data = await assetDistributionsService.getAll();
      setDistributions(data);
    } catch (error) {
      console.error('Error loading distributions:', error);
      toast.error('Có lỗi khi tải danh sách phân phối!');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sourceType: 'asset',
      sourceId: '',
      assetName: '',
      quantity: 1,
      maxQuantity: 1,
      assignedTo: '',
      distributedDate: new Date().toISOString().split('T')[0],
      notes: '',
      status: 'active',
    });
    setEditingDistribution(null);
    setItemSearchTerm('');
    setShowItemList(false);
  };

  // Lấy danh sách items có thể phân phối
  const getAvailableItems = () => {
    if (formData.sourceType === 'asset') {
      return assets.filter(asset => asset.status === 'available' && asset.quantity > 0);
    } else {
      return classInventory.filter(item => item.quantity > 0);
    }
  };

  // Lọc items theo từ khóa tìm kiếm
  const getFilteredItems = () => {
    const items = getAvailableItems();

    if (!itemSearchTerm) return items;

    return items.filter(item => {
      // Xử lý tên item khác nhau giữa asset và inventory
      const itemName = formData.sourceType === 'asset'
        ? (item.name || '')
        : ((item as any).title || '');

      // Xử lý category khác nhau giữa asset và inventory
      let itemCategory = '';
      if (formData.sourceType === 'asset') {
        itemCategory = item.category || '';
      } else {
        // Với inventory, tìm tên category từ category_id
        const categoryId = (item as any).category_id;
        const category = inventoryCategories.find(cat => cat.id === categoryId);
        itemCategory = category?.name || '';
      }

      const searchLower = itemSearchTerm.toLowerCase();
      const nameMatch = itemName.toLowerCase().includes(searchLower);
      const categoryMatch = itemCategory.toLowerCase().includes(searchLower);

      return nameMatch || categoryMatch;
    });
  };

  // Xử lý khi chọn item
  const handleItemSelect = (itemId: string) => {
    const availableItems = getAvailableItems();
    const selectedItem = availableItems.find(item => item.id === itemId);

    if (selectedItem) {
      const itemName = formData.sourceType === 'asset'
        ? (selectedItem.name || 'Không có tên')
        : ((selectedItem as any).title || 'Không có tên');

      setFormData(prev => ({
        ...prev,
        sourceId: itemId,
        assetName: itemName,
        maxQuantity: selectedItem.quantity || 0,
        quantity: Math.min(prev.quantity, selectedItem.quantity || 0)
      }));
      setShowItemList(false);
      setItemSearchTerm('');
    }
  };

  // Xử lý khi thay đổi loại nguồn
  const handleSourceTypeChange = (sourceType: 'asset' | 'inventory') => {
    setFormData(prev => ({
      ...prev,
      sourceType,
      sourceId: '',
      assetName: '',
      quantity: 1,
      maxQuantity: 1
    }));
  };

  const openModal = (distribution?: AssetDistribution) => {
    if (distribution) {
      setEditingDistribution(distribution);
      // Khi edit, chỉ cho phép sửa thông tin phân phối, không đổi item
      setFormData({
        sourceType: 'asset', // Mặc định, sẽ được xác định từ dữ liệu có sẵn
        sourceId: distribution.assetId,
        assetName: distribution.assetName,
        quantity: distribution.quantity,
        maxQuantity: distribution.quantity, // Khi edit, max = current quantity
        assignedTo: distribution.assignedTo,
        distributedDate: distribution.distributedDate,
        notes: distribution.notes || '',
        status: distribution.status,
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

    // Validation
    if (!formData.sourceId && !editingDistribution) {
      toast.error('Vui lòng chọn tài sản/vật phẩm!');
      return;
    }

    if (!formData.assignedTo.trim()) {
      toast.error('Vui lòng nhập người được phân phối!');
      return;
    }

    if (formData.quantity <= 0 || formData.quantity > formData.maxQuantity) {
      toast.error(`Số lượng phải từ 1 đến ${formData.maxQuantity}!`);
      return;
    }

    try {
      setLoading(true);

      const distributionData = {
        assetId: editingDistribution ? editingDistribution.assetId : formData.sourceId,
        assetName: formData.assetName,
        quantity: formData.quantity,
        assignedTo: formData.assignedTo.trim(),
        distributedDate: formData.distributedDate,
        notes: formData.notes.trim() || undefined,
        status: formData.status,
      };

      if (editingDistribution) {
        await assetDistributionsService.update(editingDistribution.id, distributionData);
        toast.success('Cập nhật phân phối thành công!');
      } else {
        await assetDistributionsService.create(distributionData);
        toast.success('Thêm phân phối thành công!');

        // Cập nhật số lượng trong nguồn gốc
        // TODO: Implement quantity update in source (asset or inventory)
      }

      await loadDistributions();
      await refreshData();
      closeModal();
    } catch (error) {
      console.error('Error saving distribution:', error);
      toast.error('Có lỗi khi lưu phân phối!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (distribution: AssetDistribution) => {
    if (!confirm(`Bạn có chắc muốn xóa phân phối "${distribution.assetName}" cho ${distribution.assignedTo}?`)) {
      return;
    }

    try {
      setLoading(true);
      await assetDistributionsService.delete(distribution.id);
      toast.success('Xóa phân phối thành công!');
      await loadDistributions();
      await refreshData();
    } catch (error) {
      console.error('Error deleting distribution:', error);
      toast.error('Có lỗi khi xóa phân phối!');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (distribution: AssetDistribution) => {
    if (!confirm(`Xác nhận thu hồi "${distribution.assetName}" từ ${distribution.assignedTo}?`)) {
      return;
    }

    try {
      setLoading(true);
      await assetDistributionsService.update(distribution.id, { status: 'returned' });
      toast.success('Thu hồi tài sản thành công!');
      await loadDistributions();
      await refreshData();
    } catch (error) {
      console.error('Error returning asset:', error);
      toast.error('Có lỗi khi thu hồi tài sản!');
    } finally {
      setLoading(false);
    }
  };

  // Filter distributions
  const filteredDistributions = distributions.filter(distribution => {
    const matchesSearch = (distribution.assetName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (distribution.assignedTo?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || distribution.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: distributions.length,
    active: distributions.filter(d => d.status === 'active').length,
    returned: distributions.filter(d => d.status === 'returned').length,
    thisMonth: distributions.filter(d => {
      const distributedDate = new Date(d.distributedDate);
      const now = new Date();
      return distributedDate.getMonth() === now.getMonth() && 
             distributedDate.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý phân phối tài sản</h2>
          <p className="text-gray-600">Theo dõi và quản lý việc phân phối tài sản cho nhân viên</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Phân phối mới
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng phân phối</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang sử dụng</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <User className="text-green-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã thu hồi</p>
              <p className="text-2xl font-bold text-orange-600">{stats.returned}</p>
            </div>
            <ArrowLeft className="text-orange-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tháng này</p>
              <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
            </div>
            <Calendar className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm tài sản hoặc người được giao..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'returned')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang sử dụng</option>
          <option value="returned">Đã thu hồi</option>
        </select>
      </div>

      {/* Distributions List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tài sản
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người được giao
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày phân phối
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDistributions.map((distribution) => (
                <tr key={distribution.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{distribution.assetName}</div>
                      {distribution.notes && (
                        <div className="text-sm text-gray-500">{distribution.notes}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {distribution.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {distribution.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(distribution.distributedDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      distribution.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {distribution.status === 'active' ? 'Đang sử dụng' : 'Đã thu hồi'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(distribution)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 size={16} />
                      </button>
                      {distribution.status === 'active' && (
                        <button
                          onClick={() => handleReturn(distribution)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Thu hồi"
                        >
                          <ArrowLeft size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(distribution)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDistributions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Không tìm thấy phân phối nào phù hợp.' 
              : 'Chưa có phân phối nào. Hãy thêm phân phối đầu tiên!'
            }
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingDistribution ? 'Sửa phân phối' : 'Phân phối mới'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingDistribution && (
                <>
                  {/* Chọn nguồn */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nguồn phân phối *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSourceTypeChange('asset')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.sourceType === 'asset'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Package size={20} className="mx-auto mb-1" />
                        <div className="text-sm font-medium">Tài sản nhận</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSourceTypeChange('inventory')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.sourceType === 'inventory'
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Package size={20} className="mx-auto mb-1" />
                        <div className="text-sm font-medium">Kho lớp</div>
                      </button>
                    </div>
                  </div>

                  {/* Chọn item */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chọn {formData.sourceType === 'asset' ? 'tài sản' : 'vật phẩm'} *
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <div
                        onClick={() => setShowItemList(!showItemList)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white flex justify-between items-center"
                      >
                        <span className={formData.assetName ? 'text-gray-900' : 'text-gray-500'}>
                          {formData.assetName || `-- Chọn ${formData.sourceType === 'asset' ? 'tài sản' : 'vật phẩm'} --`}
                        </span>
                        <svg className={`w-5 h-5 transition-transform ${showItemList ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {showItemList && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                          <div className="p-2 border-b border-gray-200">
                            <input
                              type="text"
                              placeholder={`Tìm kiếm ${formData.sourceType === 'asset' ? 'tài sản' : 'vật phẩm'}...`}
                              value={itemSearchTerm}
                              onChange={(e) => setItemSearchTerm(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {getFilteredItems().length === 0 ? (
                              <div className="p-3 text-gray-500 text-center">
                                Không tìm thấy {formData.sourceType === 'asset' ? 'tài sản' : 'vật phẩm'} nào
                              </div>
                            ) : (
                              getFilteredItems().map(item => (
                                <div
                                  key={item.id}
                                  onClick={() => handleItemSelect(item.id)}
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">
                                    {formData.sourceType === 'asset' ? (item.name || 'Không có tên') : ((item as any).title || 'Không có tên')}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {(() => {
                                      let categoryName = '';
                                      if (formData.sourceType === 'asset') {
                                        categoryName = item.category || '';
                                      } else {
                                        const categoryId = (item as any).category_id;
                                        const category = inventoryCategories.find(cat => cat.id === categoryId);
                                        categoryName = category?.name || '';
                                      }
                                      return categoryName && <span className="mr-2">Danh mục: {categoryName}</span>;
                                    })()}
                                    <span>Số lượng: {item.quantity || 0}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Tên item (readonly khi chọn từ dropdown, editable khi edit) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên {formData.sourceType === 'asset' ? 'tài sản' : 'vật phẩm'} *
                </label>
                <input
                  type="text"
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Nhập tên ${formData.sourceType === 'asset' ? 'tài sản' : 'vật phẩm'}...`}
                  readOnly={!editingDistribution && formData.sourceId !== ''}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng * {formData.maxQuantity > 1 && (
                    <span className="text-sm text-gray-500">(Tối đa: {formData.maxQuantity})</span>
                  )}
                </label>
                <input
                  type="number"
                  min="1"
                  max={formData.maxQuantity}
                  value={formData.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setFormData({
                      ...formData,
                      quantity: Math.min(value, formData.maxQuantity)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {formData.maxQuantity > 1 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Số lượng có sẵn: {formData.maxQuantity}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Người được giao *
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên người được giao..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày phân phối *
                </label>
                <input
                  type="date"
                  value={formData.distributedDate}
                  onChange={(e) => setFormData({ ...formData, distributedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'returned' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Đang sử dụng</option>
                  <option value="returned">Đã thu hồi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú thêm..."
                  rows={3}
                />
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
                  {loading ? 'Đang lưu...' : (editingDistribution ? 'Cập nhật' : 'Thêm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
