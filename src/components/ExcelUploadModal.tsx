import React, { useState, useRef } from 'react';
import { useToastContext } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { excelService, ExcelImportResult, ExcelValidationError } from '../services/excelService';
import { classInventoryService, inventoryCategoriesService } from '../lib/supabaseService';
import { ClassInventoryItem, InventoryCategory } from '../types';
import {
  Upload,
  X,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  Save,
  Loader
} from 'lucide-react';

interface ExcelUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface PreviewItem extends Partial<ClassInventoryItem> {
  category_name?: string;
  isValid: boolean;
  errors: string[];
}

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ onClose, onSuccess }) => {
  const { toast } = useToastContext();
  const { inventoryCategories, refreshData } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);
  const [previewData, setPreviewData] = useState<PreviewItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Xử lý chọn file
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng file
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await excelService.readExcelFile(file);
      setImportResult(result);
      
      if (result.success || result.validRows > 0) {
        await processPreviewData(result);
        setShowPreview(true);
        toast.success(`Đọc file thành công! ${result.validRows}/${result.totalRows} dòng hợp lệ`);
      } else {
        toast.error('File không có dữ liệu hợp lệ');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Lỗi khi xử lý file Excel');
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý dữ liệu preview
  const processPreviewData = async (result: ExcelImportResult) => {
    const categoryMap = new Map(inventoryCategories.map(cat => [cat.name.toLowerCase(), cat]));
    
    const preview: PreviewItem[] = result.data.map((item, index) => {
      const errors: string[] = [];
      let isValid = true;
      let category_id: string | undefined;

      // Tìm category_id từ tên danh mục
      if (item.category_name) {
        const category = categoryMap.get(item.category_name.toLowerCase());
        if (category) {
          category_id = category.id;
        } else {
          errors.push(`Danh mục "${item.category_name}" không tồn tại`);
          isValid = false;
        }
      }

      // Kiểm tra các lỗi từ validation
      const rowErrors = result.errors.filter(err => err.row === index + 2);
      if (rowErrors.length > 0) {
        errors.push(...rowErrors.map(err => err.message));
        isValid = false;
      }

      return {
        ...item,
        category_id,
        isValid,
        errors
      };
    });

    setPreviewData(preview);
  };

  // Xử lý import dữ liệu
  const handleImport = async () => {
    if (!importResult || previewData.length === 0) {
      toast.error('Không có dữ liệu để import');
      return;
    }

    const validItems = previewData.filter(item => item.isValid);
    if (validItems.length === 0) {
      toast.error('Không có dữ liệu hợp lệ để import');
      return;
    }

    setIsUploading(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      const errorDetails: string[] = [];

      // Import từng item một cách tuần tự để tránh race condition
      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        try {
          // Kiểm tra lại dữ liệu trước khi import
          if (!item.title || !item.category_id || !item.quantity) {
            throw new Error('Dữ liệu không đầy đủ');
          }

          await classInventoryService.create({
            title: item.title,
            quantity: item.quantity,
            category_id: item.category_id,
            description: item.description
          });
          successCount++;
        } catch (error: any) {
          console.error(`Error creating item ${i + 1}:`, error);
          errorCount++;
          errorDetails.push(`Dòng ${i + 1}: ${error.message || 'Lỗi không xác định'}`);
        }
      }

      await refreshData();

      if (successCount > 0) {
        if (errorCount === 0) {
          toast.success(`Import thành công ${successCount} sản phẩm`);
        } else {
          toast.success(`Import thành công ${successCount} sản phẩm, ${errorCount} lỗi`);
          console.warn('Import errors:', errorDetails);
        }
        onSuccess();
        onClose();
      } else {
        toast.error(`Không thể import dữ liệu. Chi tiết lỗi: ${errorDetails.slice(0, 3).join(', ')}`);
      }
    } catch (error: any) {
      console.error('Error importing data:', error);
      toast.error(`Lỗi khi import dữ liệu: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Tải file mẫu
  const handleDownloadTemplate = async () => {
    try {
      await excelService.downloadTemplate();
      toast.success('Tải file mẫu thành công!');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Lỗi khi tải file mẫu');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={24} />
              <h2 className="text-xl font-bold">Import dữ liệu từ Excel</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!showPreview ? (
            // Upload Section
            <div className="space-y-6">
              {/* Download Template */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Tải file mẫu Excel</h3>
                    <p className="text-blue-700 text-sm">
                      Tải xuống file Excel mẫu với định dạng chuẩn và hướng dẫn sử dụng
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <Download size={16} />
                    Tải mẫu
                  </button>
                </div>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-all">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload size={32} className="text-blue-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Chọn file Excel để upload
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Hỗ trợ file .xlsx và .xls với encoding UTF-8
                    </p>
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                      {isProcessing ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Chọn file
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">Lưu ý quan trọng:</h4>
                    <ul className="text-yellow-800 text-sm space-y-1">
                      <li>• File Excel phải có định dạng UTF-8</li>
                      <li>• Cột "Tên sản phẩm" và "Số lượng" là bắt buộc</li>
                      <li>• Danh mục phải tồn tại trong hệ thống</li>
                      <li>• Số lượng phải là số nguyên dương</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Preview Section
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="text-blue-600" size={20} />
                    <div>
                      <p className="text-blue-900 font-semibold">{importResult?.totalRows || 0}</p>
                      <p className="text-blue-700 text-sm">Tổng dòng</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <div>
                      <p className="text-green-900 font-semibold">{previewData.filter(item => item.isValid).length}</p>
                      <p className="text-green-700 text-sm">Dòng hợp lệ</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-red-600" size={20} />
                    <div>
                      <p className="text-red-900 font-semibold">{previewData.filter(item => !item.isValid).length}</p>
                      <p className="text-red-700 text-sm">Dòng lỗi</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Eye size={16} />
                    Xem trước dữ liệu
                  </h3>
                </div>
                
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {previewData.map((item, index) => (
                        <tr key={index} className={item.isValid ? 'bg-white' : 'bg-red-50'}>
                          <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.category_name}</td>
                          <td className="px-4 py-3 text-sm">
                            {item.isValid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                <CheckCircle size={12} />
                                Hợp lệ
                              </span>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  <AlertTriangle size={12} />
                                  Lỗi
                                </span>
                                {item.errors.map((error, errorIndex) => (
                                  <p key={errorIndex} className="text-xs text-red-600">{error}</p>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setImportResult(null);
                    setPreviewData([]);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all"
                >
                  ← Chọn file khác
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                  >
                    Hủy
                  </button>
                  
                  <button
                    onClick={handleImport}
                    disabled={isUploading || previewData.filter(item => item.isValid).length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Đang import...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Import ({previewData.filter(item => item.isValid).length} sản phẩm)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadModal;
