import React from 'react';
import { useData } from '../context/DataContext';
import { exportToWord } from '../utils/wordExport';
import {
  FileText,
  Download,
  X
} from 'lucide-react';

interface PublicActivityReportProps {
  onClose: () => void;
}

export default function PublicActivityReport({ onClose }: PublicActivityReportProps) {
  const { activityReports } = useData();

  // Chỉ hiển thị các báo cáo công khai
  const publicReports = activityReports.filter(report => report.isPublic && report.status === 'published');




  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Báo cáo hoạt động sự kiện</h2>
              <p className="text-blue-100">Các báo cáo hoạt động công khai của trung tâm</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {publicReports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có báo cáo công khai</h3>
              <p>Hiện tại chưa có báo cáo hoạt động nào được công khai.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {publicReports.map((report) => (
                <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{report.title}</h3>
                      {report.description && (
                        <p className="text-gray-600 mb-4">{report.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span>Tạo: {new Date(report.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span>Cập nhật: {new Date(report.updatedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => exportToWord(report)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                      title="Tải xuống file Word"
                    >
                      <Download size={16} />
                      Tải Word
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Nội dung báo cáo:</h4>
                    <div className="text-gray-700 whitespace-pre-wrap text-sm max-h-40 overflow-y-auto">
                      {report.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
