import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { hasPermission } from '../constants/permissions';
import { ActivityReport as ActivityReportType } from '../types';
import { exportToWord } from '../utils/wordExport';
import {
  FileText,
  Download,
  Plus,
  Edit2,
  Trash2,
  Save,
  X
} from 'lucide-react';

export default function ActivityReport() {
  const {
    activityReports,
    addActivityReport,
    updateActivityReport,
    deleteActivityReport
  } = useData();
  const { users, user } = useAuth();
  const toast = useToastContext();


  const [showReportModal, setShowReportModal] = useState(false);
  const [editingReport, setEditingReport] = useState<ActivityReportType | null>(null);

  // Kiểm tra quyền dựa trên permissions
  const userPermissions = user?.permissions || [];
  const userRole = user?.role;
  const canViewActivityReports = hasPermission(userPermissions, 'activity-report.view', userRole);
  const canCreateActivityReports = hasPermission(userPermissions, 'activity-report.create', userRole);
  const canEditActivityReports = hasPermission(userPermissions, 'activity-report.edit', userRole);
  const canDeleteActivityReports = hasPermission(userPermissions, 'activity-report.delete', userRole);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    isPublic: false,
    tags: [] as string[]
  });



  // CRUD operations
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      status: 'draft',
      isPublic: false,
      tags: []
    });
    setEditingReport(null);
  };

  const openModal = (report?: ActivityReportType) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        title: report.title,
        description: report.description,
        content: report.content,
        status: report.status,
        isPublic: report.isPublic,
        tags: report.tags || []
      });
    } else {
      resetForm();
    }
    setShowReportModal(true);
  };

  const closeModal = () => {
    setShowReportModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }

    try {
      const reportData = {
        ...formData,
        createdBy: user?.id || '',
      };

      if (editingReport) {
        await updateActivityReport(editingReport.id, reportData);
        toast.success('Cập nhật báo cáo thành công!');
      } else {
        await addActivityReport(reportData);
        toast.success('Tạo báo cáo thành công!');
      }

      closeModal();
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('❌ Lỗi tạo báo cáo! Bảng activity_reports chưa được tạo trong database. 📋 Xem file ACTIVITY_REPORTS_SETUP.md để khắc phục (chạy SQL script trong Supabase Dashboard).');
    }
  };

  const handleDelete = async (report: ActivityReportType) => {
    if (!confirm(`Bạn có chắc muốn xóa báo cáo "${report.title}"?`)) {
      return;
    }

    try {
      await deleteActivityReport(report.id);
      toast.success('Xóa báo cáo thành công!');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Có lỗi khi xóa báo cáo!');
    }
  };










  // Kiểm tra quyền xem báo cáo hoạt động
  if (!canViewActivityReports) {
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
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo hoạt động sự kiện</h1>
          <p className="text-gray-600 mt-1">
            Tạo và quản lý báo cáo hoạt động, sự kiện của trung tâm
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canCreateActivityReports && (
            <button
              onClick={() => openModal()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Tạo báo cáo
            </button>
          )}
        </div>
      </div>

      {/* Thông báo hướng dẫn nếu chưa có báo cáo */}
      {activityReports.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Chưa có báo cáo nào được lưu
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Nếu gặp lỗi khi tạo báo cáo, có thể bảng <code className="bg-yellow-100 px-1 rounded">activity_reports</code> chưa được tạo trong database.
                Xem file <strong>ACTIVITY_REPORTS_SETUP.md</strong> để biết cách khắc phục (chạy SQL script trong Supabase Dashboard).
              </p>
            </div>
          </div>
        </div>
      )}







      {/* Danh sách báo cáo */}
      <div className="space-y-6">
        {activityReports.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có báo cáo nào</h3>
            <p className="text-gray-600 mb-4">Tạo báo cáo đầu tiên để bắt đầu</p>
            <button
              onClick={() => openModal()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Tạo báo cáo đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activityReports.map((report) => (
              <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'published' ? 'bg-green-100 text-green-800' :
                        report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status === 'published' ? 'Đã xuất bản' :
                         report.status === 'draft' ? 'Bản nháp' : 'Đã lưu trữ'}
                      </span>
                      {report.isPublic && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Công khai
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>Tạo: {new Date(report.createdAt).toLocaleDateString('vi-VN')}</p>
                      <p>Cập nhật: {new Date(report.updatedAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {canEditActivityReports && (
                      <button
                        onClick={() => openModal(report)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {canDeleteActivityReports && (
                      <button
                        onClick={() => handleDelete(report)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => exportToWord(report)}
                    className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                    title="Tải xuống file Word"
                  >
                    <Download size={14} />
                    Tải Word
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {editingReport ? 'Chỉnh sửa báo cáo' : 'Tạo báo cáo mới'}
                </h2>
                <button
                  onClick={closeModal}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề báo cáo *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tiêu đề báo cáo"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Mô tả ngắn gọn về báo cáo"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung báo cáo *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={12}
                  placeholder="Nhập nội dung chi tiết của báo cáo..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="archived">Đã lưu trữ</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Hiển thị công khai</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
                >
                  <Save size={20} />
                  {editingReport ? 'Cập nhật' : 'Tạo báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
