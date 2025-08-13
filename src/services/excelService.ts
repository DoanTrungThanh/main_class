import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ClassInventoryItem, InventoryCategory } from '../types';

export interface ExcelInventoryItem {
  'Tên sản phẩm': string;
  'Số lượng': number;
  'Danh mục': string;
  'Mô tả': string;
}

export interface ExcelValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

export interface ExcelImportResult {
  success: boolean;
  data: Partial<ClassInventoryItem>[];
  errors: ExcelValidationError[];
  totalRows: number;
  validRows: number;
}

class ExcelService {
  // Tạo file Excel mẫu
  async downloadTemplate(): Promise<void> {
    const templateData: ExcelInventoryItem[] = [
      {
        'Tên sản phẩm': 'Bút chì 2B',
        'Số lượng': 50,
        'Danh mục': 'Văn phòng phẩm',
        'Mô tả': 'Bút chì 2B chất lượng cao cho học sinh'
      },
      {
        'Tên sản phẩm': 'Vở ô li 200 trang',
        'Số lượng': 25,
        'Danh mục': 'Văn phòng phẩm',
        'Mô tả': 'Vở ô li 200 trang chất lượng tốt'
      },
      {
        'Tên sản phẩm': 'Bộ xếp hình gỗ',
        'Số lượng': 15,
        'Danh mục': 'Đồ chơi giáo dục',
        'Mô tả': 'Bộ xếp hình gỗ phát triển tư duy logic'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Thiết lập độ rộng cột
    const columnWidths = [
      { wch: 25 }, // Tên sản phẩm
      { wch: 12 }, // Số lượng
      { wch: 20 }, // Danh mục
      { wch: 40 }  // Mô tả
    ];
    worksheet['!cols'] = columnWidths;

    // Tạo workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kho lớp học');

    // Thêm sheet hướng dẫn
    const instructionData = [
      ['HƯỚNG DẪN SỬ DỤNG FILE EXCEL'],
      [''],
      ['1. Cột "Tên sản phẩm": Nhập tên sản phẩm (bắt buộc)'],
      ['2. Cột "Số lượng": Nhập số lượng (số nguyên dương)'],
      ['3. Cột "Danh mục": Nhập tên danh mục có sẵn trong hệ thống'],
      ['4. Cột "Mô tả": Mô tả chi tiết sản phẩm (tùy chọn)'],
      [''],
      ['LƯU Ý:'],
      ['- Không được để trống cột "Tên sản phẩm"'],
      ['- Số lượng phải là số nguyên dương'],
      ['- Danh mục phải tồn tại trong hệ thống'],
      ['- File phải được lưu với encoding UTF-8'],
      ['- Xóa dòng mẫu trước khi nhập dữ liệu thực tế']
    ];

    const instructionSheet = XLSX.utils.aoa_to_sheet(instructionData);
    instructionSheet['!cols'] = [{ wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Hướng dẫn');

    // Xuất file với encoding UTF-8
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false,
      compression: true
    });

    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
    });
    
    const fileName = `Mau_Kho_Lop_Hoc_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  }

  // Đọc file Excel
  async readExcelFile(file: File): Promise<ExcelImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { 
            type: 'array',
            codepage: 65001 // UTF-8
          });
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Chuyển đổi thành JSON với header
          const jsonData: ExcelInventoryItem[] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            blankrows: false
          }).slice(1) as any; // Bỏ header row

          const result = this.validateAndTransformData(jsonData);
          resolve(result);
        } catch (error) {
          console.error('Error reading Excel file:', error);
          resolve({
            success: false,
            data: [],
            errors: [{
              row: 0,
              field: 'file',
              message: 'Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.',
              value: null
            }],
            totalRows: 0,
            validRows: 0
          });
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  // Validate và transform dữ liệu
  private validateAndTransformData(rawData: any[]): ExcelImportResult {
    const errors: ExcelValidationError[] = [];
    const validData: Partial<ClassInventoryItem>[] = [];

    // Kiểm tra nếu không có dữ liệu
    if (!rawData || rawData.length === 0) {
      errors.push({
        row: 0,
        field: 'file',
        message: 'File Excel không có dữ liệu',
        value: null
      });
      return {
        success: false,
        data: [],
        errors,
        totalRows: 0,
        validRows: 0
      };
    }

    rawData.forEach((row, index) => {
      const rowNumber = index + 2; // +2 vì bắt đầu từ row 2 (sau header)

      // Kiểm tra row có dữ liệu không
      if (!row || (Array.isArray(row) && row.every(cell => !cell || cell === ''))) {
        return; // Bỏ qua row trống
      }

      const [tenSanPham, soLuong, danhMuc, moTa] = Array.isArray(row) ? row : [
        row['Tên sản phẩm'],
        row['Số lượng'],
        row['Danh mục'],
        row['Mô tả']
      ];

      // Validate tên sản phẩm
      if (!tenSanPham || typeof tenSanPham !== 'string' || tenSanPham.trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'Tên sản phẩm',
          message: 'Tên sản phẩm không được để trống',
          value: tenSanPham
        });
      } else if (tenSanPham.trim().length > 255) {
        errors.push({
          row: rowNumber,
          field: 'Tên sản phẩm',
          message: 'Tên sản phẩm không được vượt quá 255 ký tự',
          value: tenSanPham
        });
      }

      // Validate số lượng
      const quantity = Number(soLuong);
      if (soLuong === null || soLuong === undefined || soLuong === '') {
        errors.push({
          row: rowNumber,
          field: 'Số lượng',
          message: 'Số lượng không được để trống',
          value: soLuong
        });
      } else if (isNaN(quantity)) {
        errors.push({
          row: rowNumber,
          field: 'Số lượng',
          message: 'Số lượng phải là số',
          value: soLuong
        });
      } else if (quantity <= 0) {
        errors.push({
          row: rowNumber,
          field: 'Số lượng',
          message: 'Số lượng phải lớn hơn 0',
          value: soLuong
        });
      } else if (!Number.isInteger(quantity)) {
        errors.push({
          row: rowNumber,
          field: 'Số lượng',
          message: 'Số lượng phải là số nguyên',
          value: soLuong
        });
      } else if (quantity > 999999) {
        errors.push({
          row: rowNumber,
          field: 'Số lượng',
          message: 'Số lượng không được vượt quá 999,999',
          value: soLuong
        });
      }

      // Validate danh mục
      if (!danhMuc || typeof danhMuc !== 'string' || danhMuc.trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'Danh mục',
          message: 'Danh mục không được để trống',
          value: danhMuc
        });
      } else if (danhMuc.trim().length > 100) {
        errors.push({
          row: rowNumber,
          field: 'Danh mục',
          message: 'Tên danh mục không được vượt quá 100 ký tự',
          value: danhMuc
        });
      }

      // Validate mô tả (tùy chọn)
      if (moTa && typeof moTa === 'string' && moTa.trim().length > 1000) {
        errors.push({
          row: rowNumber,
          field: 'Mô tả',
          message: 'Mô tả không được vượt quá 1000 ký tự',
          value: moTa
        });
      }

      // Nếu row hợp lệ, thêm vào validData
      if (tenSanPham &&
          tenSanPham.trim() !== '' &&
          tenSanPham.trim().length <= 255 &&
          !isNaN(quantity) &&
          quantity > 0 &&
          Number.isInteger(quantity) &&
          quantity <= 999999 &&
          danhMuc &&
          danhMuc.trim() !== '' &&
          danhMuc.trim().length <= 100 &&
          (!moTa || moTa.toString().trim().length <= 1000)) {

        validData.push({
          title: tenSanPham.toString().trim(),
          quantity: quantity,
          category_name: danhMuc.toString().trim(), // Tạm thời lưu tên danh mục
          description: moTa && moTa.toString().trim() !== '' ? moTa.toString().trim() : undefined
        });
      }
    });

    return {
      success: errors.length === 0 && validData.length > 0,
      data: validData,
      errors,
      totalRows: rawData.length,
      validRows: validData.length
    };
  }

  // Xuất dữ liệu hiện tại ra Excel
  async exportCurrentData(
    inventoryItems: ClassInventoryItem[], 
    categories: InventoryCategory[]
  ): Promise<void> {
    // Tạo map danh mục để lookup
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

    const exportData: ExcelInventoryItem[] = inventoryItems.map(item => ({
      'Tên sản phẩm': item.title,
      'Số lượng': item.quantity,
      'Danh mục': categoryMap.get(item.category_id) || 'Không xác định',
      'Mô tả': item.description || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Thiết lập độ rộng cột
    const columnWidths = [
      { wch: 25 }, // Tên sản phẩm
      { wch: 12 }, // Số lượng
      { wch: 20 }, // Danh mục
      { wch: 40 }  // Mô tả
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kho lớp học');

    // Xuất file
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false,
      compression: true
    });

    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
    });
    
    const fileName = `Kho_Lop_Hoc_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  }
}

export const excelService = new ExcelService();
