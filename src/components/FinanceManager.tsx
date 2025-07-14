import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { hasPermission } from '../constants/permissions';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  X,
  Save,
  Shield,
  Download,
} from 'lucide-react';
import { FinanceRecord } from '../types';
import { exportFinances } from '../lib/excelExport';

export default function FinanceManager() {
  const { finances, addFinance, updateFinance, deleteFinance } = useData();
  const { user } = useAuth();
  const toast = useToastContext();
  const [showModal, setShowModal] = useState(false);
  const [editingFinance, setEditingFinance] = useState<FinanceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterMonth, setFilterMonth] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    amount: 0,
    description: '',
    category: '',
    date: '',
  });

  // Kiểm tra quyền dựa trên permissions
  const userPermissions = user?.permissions || [];
  const userRole = user?.role;
  const canViewFinances = hasPermission(userPermissions, 'finances.view', userRole);
  const canCreateFinances = hasPermission(userPermissions, 'finances.create', userRole);
  const canEditFinances = hasPermission(userPermissions, 'finances.edit', userRole);
  const canDeleteFinances = hasPermission(userPermissions, 'finances.delete', userRole);

  const categories = {
    income: ['Học phí', 'Phụ cấp', 'Tài trợ', 'Khác'],
    expense: ['Lương', 'Tiện ích', 'Vật tư', 'Bảo trì', 'Khác'],
  };

  const filteredFinances = finances.filter(finance => {
    const matchesSearch = finance.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         finance.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || finance.type === filterType;
    const matchesMonth = !filterMonth || finance.date.startsWith(filterMonth);
    
    return matchesSearch && matchesType && matchesMonth;
  });

  const totalIncome = finances
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = finances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const balance = totalIncome - totalExpense;

  const resetForm = () => {
    setFormData({
      type: 'income',
      amount: 0,
      description: '',
      category: '',
      date: '',
    });
    setEditingFinance(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra quyền trước khi thực hiện
    if (editingFinance && !canEditFinances) {
      toast.error('Bạn không có quyền chỉnh sửa giao dịch!');
      return;
    }
    if (!editingFinance && !canCreateFinances) {
      toast.error('Bạn không có quyền thêm giao dịch!');
      return;
    }

    try {
      if (editingFinance) {
        await updateFinance(editingFinance.id, { ...formData, createdBy: user?.id || '' });
        toast.success('Cập nhật giao dịch thành công!');
      } else {
        await addFinance({ ...formData, createdBy: user?.id || '' });
        toast.success('Thêm giao dịch thành công!');
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving finance:', error);
      toast.error('Có lỗi xảy ra khi lưu giao dịch!');
    }
  };

  const handleEdit = (finance: FinanceRecord) => {
    if (!canEditFinances) {
      toast.error('Bạn không có quyền chỉnh sửa giao dịch!');
      return;
    }
    setEditingFinance(finance);
    setFormData({
      type: finance.type,
      amount: finance.amount,
      description: finance.description,
      category: finance.category,
      date: finance.date,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!canDeleteFinances) {
      toast.error('Bạn không có quyền xóa giao dịch!');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      try {
        await deleteFinance(id);
        toast.success('Xóa giao dịch thành công!');
      } catch (error) {
        console.error('Error deleting finance:', error);
        toast.error('Có lỗi xảy ra khi xóa giao dịch!');
      }
    }
  };

  const handleExportWithDateRange = async () => {
    if (!canViewFinances) {
      toast.error('Bạn không có quyền xuất dữ liệu!');
      return;
    }
    try {
      setIsExporting(true);
      await exportFinances(
        finances,
        exportDateRange.startDate,
        exportDateRange.endDate
      );
      setShowExportModal(false);
      toast.success('Xuất dữ liệu thành công!');
    } catch (error) {
      console.error('Error exporting finances:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  // Kiểm tra quyền xem finances
  if (!canViewFinances) {
    return (
      <div className="text-center py-8">
        <Shield className="mx-auto mb-4 text-gray-300" size={48} />
        <p className="text-gray-500">Bạn không có quyền truy cập chức năng này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý thu chi</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi tình hình tài chính của trung tâm
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canViewFinances && (
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <Download size={20} />
              Xuất Excel
            </button>
          )}
          {canCreateFinances && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Thêm giao dịch
            </button>
          )}
        </div>
      </div>

      {/* Thống kê tổng quan - Mobile Optimized */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-green-100">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Tổng thu</p>
            <p className="text-sm font-bold text-green-600">
              {totalIncome.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-red-100">
              <TrendingDown size={16} className="text-red-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Tổng chi</p>
            <p className="text-sm font-bold text-red-600">
              {totalExpense.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-100">
              <DollarSign size={16} className="text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Số dư</p>
            <p className={`text-sm font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {balance.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="income">Thu</option>
            <option value="expense">Chi</option>
          </select>

          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Loại</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Danh mục</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Mô tả</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Số tiền</th>
                {(canEditFinances || canDeleteFinances) && (
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredFinances.map((finance) => (
                <tr key={finance.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(finance.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      finance.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {finance.type === 'income' ? 'Thu' : 'Chi'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{finance.category}</td>
                  <td className="py-3 px-4">{finance.description}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      finance.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {finance.type === 'income' ? '+' : '-'}{finance.amount.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </td>
                  {(canEditFinances || canDeleteFinances) && (
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {canEditFinances && (
                          <button
                            onClick={() => handleEdit(finance)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {canDeleteFinances && (
                          <button
                            onClick={() => handleDelete(finance.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFinances.length === 0 && (
          <div className="text-center py-8">
            <DollarSign className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' || filterMonth 
                ? 'Không tìm thấy giao dịch nào' 
                : 'Chưa có giao dịch nào'}
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingFinance ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
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
                  Loại giao dịch *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="income">Thu</option>
                  <option value="expense">Chi</option>
                </select>
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
                  {categories[formData.type].map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền (VNĐ) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày giao dịch *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                  {editingFinance ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Xuất dữ liệu tài chính</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={exportDateRange.startDate}
                  onChange={(e) => setExportDateRange({ ...exportDateRange, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={exportDateRange.endDate}
                  onChange={(e) => setExportDateRange({ ...exportDateRange, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleExportWithDateRange}
                  disabled={isExporting}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}