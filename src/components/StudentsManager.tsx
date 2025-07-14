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
  User,
  Mail,
  Phone,
  Calendar,
  X,
  Save,
  Download,
  Upload,
  Filter,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle,
  AlertCircle,
  List,
  Grid,
  FileSpreadsheet,
} from 'lucide-react';
import { Student } from '../types';
import { exportStudents } from '../lib/excelExport';
import * as XLSX from 'xlsx';

export default function StudentsManager() {
  const { students, classes, addStudent, updateStudent, deleteStudent, updateStudentClass } = useData();
  const { user } = useAuth();
  const toast = useToastContext();
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Kiểm tra quyền dựa trên permissions
  const userPermissions = user?.permissions || [];
  const userRole = user?.role;
  const canViewStudents = hasPermission(userPermissions, 'students.view', userRole);
  const canCreateStudents = hasPermission(userPermissions, 'students.create', userRole);
  const canEditStudents = hasPermission(userPermissions, 'students.edit', userRole);
  const canDeleteStudents = hasPermission(userPermissions, 'students.delete', userRole);
  const canManageStudents = canEditStudents || canDeleteStudents;
  const [expandedStudents, setExpandedStudents] = useState<string[]>([]);
  const [importData, setImportData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<{[key: string]: string}>({});
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female' | 'other',
    parentName: '',
    motherName: '',
    parentPhone: '',
    parentIdCard: '',
    parentIdCard2: '',
    status: 'active' as 'active' | 'inactive',
    driveLink: '',
    classId: '',
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parentPhone.includes(searchTerm);
    const matchesClass = !filterClass || student.classId === filterClass;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      birthDate: '',
      gender: 'male',
      parentName: '',
      motherName: '',
      parentPhone: '',
      parentIdCard: '',
      parentIdCard2: '',
      status: 'active',
      driveLink: '',
      classId: '',
    });
    setEditingStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStudent) {
        // Kiểm tra xem có thay đổi lớp không
        const oldClassId = editingStudent.classId;
        const newClassId = formData.classId;

        if (oldClassId !== newClassId) {
          // Nếu có thay đổi lớp, sử dụng updateStudentClass để đồng bộ dữ liệu
          await updateStudentClass(editingStudent.id, newClassId, oldClassId);

          // Cập nhật các thông tin khác (trừ classId vì đã được xử lý ở trên)
          const { classId, ...otherData } = formData;
          await updateStudent(editingStudent.id, otherData);
        } else {
          // Nếu không thay đổi lớp, chỉ cập nhật thông tin khác
          await updateStudent(editingStudent.id, formData);
        }

        toast.success('Cập nhật học sinh thành công!');
      } else {
        await addStudent(formData);
        toast.success('Thêm học sinh thành công!');
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Có lỗi xảy ra khi lưu thông tin học sinh!');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      birthDate: student.birthDate,
      gender: student.gender,
      parentName: student.parentName,
      motherName: student.motherName || '',
      parentPhone: student.parentPhone,
      parentIdCard: student.parentIdCard || '',
      parentIdCard2: student.parentIdCard2 || '',
      status: student.status,
      driveLink: student.driveLink || '',
      classId: student.classId || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa học sinh này?')) {
      deleteStudent(id);
      toast.success('Xóa học sinh thành công!');
    }
  };

  const getClassName = (classId?: string) => {
    if (!classId) return '';
    const classInfo = classes.find(c => c.id === classId);
    return classInfo?.name || '';
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportStudents(filteredStudents, classes);
      toast.success('Xuất dữ liệu thành công!');
    } catch (error) {
      console.error('Error exporting students:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleExpandStudent = (studentId: string) => {
    setExpandedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const isStudentExpanded = (studentId: string) => {
    return expandedStudents.includes(studentId);
  };

  // Excel import functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate and transform data
        const transformedData = data.map((row: any, index) => {
          return {
            index: index + 1,
            name: row['Tên học sinh'] || '',
            birthDate: formatExcelDate(row['Ngày sinh']),
            gender: mapGender(row['Giới tính']),
            parentName: row['Tên phụ huynh (Ba)'] || '',
            motherName: row['Tên phụ huynh (Mẹ)'] || '',
            parentPhone: row['SĐT'] ? String(row['SĐT']) : '',
            parentIdCard: row['CCCD (Ba)'] ? String(row['CCCD (Ba)']) : '',
            parentIdCard2: row['CCCD (Mẹ)'] ? String(row['CCCD (Mẹ)']) : '',
            status: 'active',
            className: row['Lớp'] || '',
          };
        });
        
        setImportData(transformedData);
        validateImportData(transformedData);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        toast.error('Có lỗi xảy ra khi đọc file Excel!');
      }
    };
    reader.readAsBinaryString(file);
  };

  const formatExcelDate = (excelDate: any): string => {
    if (!excelDate) return '';
    
    // If it's already a string in YYYY-MM-DD format
    if (typeof excelDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
      return excelDate;
    }
    
    // If it's a date object
    if (excelDate instanceof Date) {
      return excelDate.toISOString().split('T')[0];
    }
    
    // If it's a string in DD/MM/YYYY format
    if (typeof excelDate === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(excelDate)) {
      const [day, month, year] = excelDate.split('/').map(Number);
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    
    // If it's a number (Excel serial date)
    if (typeof excelDate === 'number') {
      // Excel dates are number of days since 1900-01-01
      // (except there's a leap year bug, but we'll ignore that for simplicity)
      const date = new Date(1900, 0, excelDate - 1);
      return date.toISOString().split('T')[0];
    }
    
    return '';
  };

  const mapGender = (gender: string): 'male' | 'female' | 'other' => {
    if (!gender) return 'other';
    
    const lowerGender = gender.toLowerCase();
    if (lowerGender === 'nam' || lowerGender === 'male') return 'male';
    if (lowerGender === 'nữ' || lowerGender === 'nu' || lowerGender === 'female') return 'female';
    
    return 'other';
  };

  const validateImportData = (data: any[]) => {
    const errors: {[key: string]: string} = {};
    const phoneNumbers = new Set();
    
    data.forEach((row, index) => {
      // Required fields
      if (!row.name) {
        errors[`${index}-name`] = 'Tên học sinh không được để trống';
      }
      
      if (!row.birthDate) {
        errors[`${index}-birthDate`] = 'Ngày sinh không được để trống';
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.birthDate)) {
        errors[`${index}-birthDate`] = 'Ngày sinh không đúng định dạng (YYYY-MM-DD)';
      }
      
      if (!row.parentName) {
        errors[`${index}-parentName`] = 'Tên phụ huynh không được để trống';
      }
      
      if (!row.parentPhone) {
        errors[`${index}-parentPhone`] = 'Số điện thoại không được để trống';
      } else if (!/^\d{10,11}$/.test(row.parentPhone.replace(/\s/g, ''))) {
        errors[`${index}-parentPhone`] = 'Số điện thoại không hợp lệ';
      } else if (phoneNumbers.has(row.parentPhone)) {
        errors[`${index}-parentPhone`] = 'Số điện thoại bị trùng lặp';
      } else {
        phoneNumbers.add(row.parentPhone);
      }
      
      // Check if class exists
      if (row.className && !classes.some(c => c.name === row.className)) {
        errors[`${index}-className`] = `Lớp "${row.className}" không tồn tại`;
      }
    });
    
    setImportErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImportStudents = async () => {
    if (Object.keys(importErrors).length > 0) {
      toast.error('Vui lòng sửa các lỗi trước khi nhập dữ liệu!');
      return;
    }
    
    if (importData.length === 0) {
      toast.error('Không có dữ liệu để nhập!');
      return;
    }
    
    try {
      setIsImporting(true);
      
      // Process each student
      for (const row of importData) {
        // Find class ID from class name
        let classId = '';
        if (row.className) {
          const classInfo = classes.find(c => c.name === row.className);
          if (classInfo) {
            classId = classInfo.id;
          }
        }
        
        // Create student
        const studentData = {
          name: row.name,
          birthDate: row.birthDate,
          gender: row.gender,
          parentName: row.parentName,
          motherName: row.motherName,
          parentPhone: row.parentPhone,
          parentIdCard: row.parentIdCard,
          parentIdCard2: row.parentIdCard2,
          status: 'active' as 'active' | 'inactive',
          classId: classId,
        };
        
        await addStudent(studentData);
      }
      
      toast.success(`Đã nhập ${importData.length} học sinh thành công!`);
      setShowImportModal(false);
      setImportData([]);
      setImportErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing students:', error);
      toast.error('Có lỗi xảy ra khi nhập dữ liệu!');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplateFile = () => {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Create worksheet with headers
    const headers = [
      'Tên học sinh', 
      'Ngày sinh', 
      'Giới tính', 
      'Tên phụ huynh (Ba)', 
      'Tên phụ huynh (Mẹ)', 
      'SĐT', 
      'CCCD (Ba)', 
      'CCCD (Mẹ)', 
      'Lớp'
    ];
    
    // Add sample data
    const sampleData = [
      [
        'Nguyễn Văn A', 
        '2010-05-15', 
        'Nam', 
        'Nguyễn Văn B', 
        'Trần Thị C', 
        '0901234567', 
        '001201012345', 
        '001201012346', 
        'Lớp Toán 6A'
      ],
      [
        'Trần Thị D', 
        '2011-03-20', 
        'Nữ', 
        'Trần Văn E', 
        'Lê Thị F', 
        '0902345678', 
        '001201023456', 
        '001201023457', 
        'Lớp Văn 7B'
      ],
    ];
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mẫu nhập học sinh');
    
    // Generate Excel file
    XLSX.writeFile(workbook, 'Mau_nhap_hoc_sinh.xlsx');
  };

  // Kiểm tra quyền xem học sinh
  if (!canViewStudents) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 text-gray-300" style={{ fontSize: '48px' }}>🚫</div>
        <p className="text-gray-500">Bạn không có quyền truy cập chức năng này</p>
      </div>
    );
  }

  // Kiểm tra quyền xem học sinh
  if (!canViewStudents) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 text-gray-300" style={{ fontSize: '48px' }}>🚫</div>
        <p className="text-gray-500">Bạn không có quyền truy cập chức năng này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-in-down">
        <div className="animate-slide-in-left">
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-scale-in">Quản lý học sinh</h1>
          <p className="text-gray-600 mt-1 animate-fade-in-delay">
            Tổng cộng <span className="font-semibold text-blue-600 animate-number-count">{students.length}</span> học sinh
          </p>
        </div>
        <div className="flex items-center gap-2 animate-slide-in-right">
          <div className="flex items-center bg-gray-100 rounded-lg p-1 animate-scale-in">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all duration-300 hover-scale ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600 animate-glow' : 'text-gray-600 hover:text-blue-600'}`}
              title="Chế độ lưới"
            >
              <Grid size={18} className="animate-bounce-slow" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all duration-300 hover-scale ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600 animate-glow' : 'text-gray-600 hover:text-blue-600'}`}
              title="Chế độ danh sách"
            >
              <List size={18} className="animate-bounce-slow" />
            </button>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2 hover-lift hover-glow animate-fade-in-delay"
          >
            <Download size={20} className={isExporting ? 'animate-spin' : 'hover:animate-bounce'} />
            {isExporting ? <span className="loading-dots">Đang xuất</span> : 'Xuất Excel'}
          </button>
          {canCreateStudents && (
            <>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center gap-2 hover-lift hover-glow animate-fade-in-delay-2"
              >
                <Upload size={20} className="hover:animate-bounce" />
                Nhập Excel
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 hover-lift hover-glow animate-fade-in-delay-3"
              >
                <Plus size={20} className="hover:rotate-90 transition-transform duration-300" />
                Thêm học sinh
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm học sinh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả lớp</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang học</option>
            <option value="inactive">Nghỉ học</option>
          </select>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div key={student.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">
                        {student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Khác'} • 
                        {new Date().getFullYear() - new Date(student.birthDate).getFullYear()} tuổi
                      </p>
                    </div>
                  </div>
                  {(canEditStudents || canDeleteStudents) && (
                    <div className="flex items-center gap-2">
                      {canEditStudents && (
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {canDeleteStudents && (
                        <button
                          onClick={() => handleDelete(student.id)}
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
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span className="text-sm">
                      {new Date(student.birthDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={16} />
                    <span className="text-sm">
                      {student.parentName} {student.motherName ? `& ${student.motherName}` : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    <span className="text-sm">{student.parentPhone}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Lớp:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getClassName(student.classId) || 'Chưa phân lớp'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status === 'active' ? 'Đang học' : 'Nghỉ học'}
                    </span>
                  </div>

                  {student.driveLink && (
                    <div className="pt-3 border-t border-gray-200">
                      <a 
                        href={student.driveLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <FileText size={14} />
                        Xem hồ sơ
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700"></th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên học sinh</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày sinh</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Giới tính</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Phụ huynh</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">SĐT</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Lớp</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                  {(canEditStudents || canDeleteStudents) && (
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const isExpanded = isStudentExpanded(student.id);
                  
                  return (
                    <React.Fragment key={student.id}>
                      <tr className={`border-b border-gray-100 hover:bg-gray-50 ${isExpanded ? 'bg-blue-50' : ''}`}>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => toggleExpandStudent(student.id)}
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-medium">{student.name}</td>
                        <td className="py-3 px-4">{new Date(student.birthDate).toLocaleDateString('vi-VN')}</td>
                        <td className="py-3 px-4">
                          {student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Khác'}
                        </td>
                        <td className="py-3 px-4">{student.parentName}</td>
                        <td className="py-3 px-4">{student.parentPhone}</td>
                        <td className="py-3 px-4">{getClassName(student.classId) || 'Chưa phân lớp'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.status === 'active' ? 'Đang học' : 'Nghỉ học'}
                          </span>
                        </td>
                        {(canEditStudents || canDeleteStudents) && (
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {canEditStudents && (
                                <button
                                  onClick={() => handleEdit(student)}
                                  className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-100"
                                  title="Chỉnh sửa"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              {canDeleteStudents && (
                                <button
                                  onClick={() => handleDelete(student.id)}
                                  className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100"
                                  title="Xóa"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                      {isExpanded && (
                        <tr className="bg-blue-50">
                          <td colSpan={canManageStudents ? 9 : 8} className="py-4 px-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Thông tin học sinh</h4>
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-600 min-w-[120px]">Mã học sinh:</span>
                                    <span className="font-mono">{student.id}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-600 min-w-[120px]">Ngày sinh:</span>
                                    <span>{new Date(student.birthDate).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-600 min-w-[120px]">Tuổi:</span>
                                    <span>{new Date().getFullYear() - new Date(student.birthDate).getFullYear()} tuổi</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-600 min-w-[120px]">Giới tính:</span>
                                    <span>{student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Khác'}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-600 min-w-[120px]">Lớp:</span>
                                    <span>{getClassName(student.classId) || 'Chưa phân lớp'}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Thông tin phụ huynh</h4>
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-600 min-w-[120px]">Tên phụ huynh:</span>
                                    <span>{student.parentName}</span>
                                  </div>
                                  {student.motherName && (
                                    <div className="flex items-start gap-2">
                                      <span className="text-gray-600 min-w-[120px]">Tên mẹ:</span>
                                      <span>{student.motherName}</span>
                                    </div>
                                  )}
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-600 min-w-[120px]">Số điện thoại:</span>
                                    <span>{student.parentPhone}</span>
                                  </div>
                                  {student.parentIdCard && (
                                    <div className="flex items-start gap-2">
                                      <span className="text-gray-600 min-w-[120px]">CCCD (Ba):</span>
                                      <span className="font-mono">{student.parentIdCard}</span>
                                    </div>
                                  )}
                                  {student.parentIdCard2 && (
                                    <div className="flex items-start gap-2">
                                      <span className="text-gray-600 min-w-[120px]">CCCD (Mẹ):</span>
                                      <span className="font-mono">{student.parentIdCard2}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {student.driveLink && (
                              <div className="mt-4 pt-4 border-t border-blue-200">
                                <a 
                                  href={student.driveLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                                >
                                  <FileText size={16} />
                                  Xem hồ sơ học sinh
                                </a>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredStudents.length === 0 && (
          <div className="text-center py-8">
            <User className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-500">
              {searchTerm || filterClass || filterStatus !== 'all' 
                ? 'Không tìm thấy học sinh nào' 
                : 'Chưa có học sinh nào'}
            </p>
          </div>
        )}
      </div>

      {/* Modal thêm/sửa học sinh */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingStudent ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên học sinh *
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
                    Ngày sinh *
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Đang học</option>
                    <option value="inactive">Nghỉ học</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lớp
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn lớp</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên phụ huynh (Ba) *
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên phụ huynh (Mẹ)
                  </label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CCCD (Ba)
                  </label>
                  <input
                    type="text"
                    value={formData.parentIdCard}
                    onChange={(e) => setFormData({ ...formData, parentIdCard: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CCCD (Mẹ)
                  </label>
                  <input
                    type="text"
                    value={formData.parentIdCard2}
                    onChange={(e) => setFormData({ ...formData, parentIdCard2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link hồ sơ (Google Drive)
                </label>
                <input
                  type="url"
                  value={formData.driveLink}
                  onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://drive.google.com/file/d/..."
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
                  {editingStudent ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal nhập Excel */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Nhập học sinh từ Excel
              </h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData([]);
                  setImportErrors({});
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">Hướng dẫn nhập dữ liệu</h3>
                    <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                      <li>Tải file mẫu Excel để biết cấu trúc dữ liệu cần nhập</li>
                      <li>Điền thông tin học sinh vào file Excel theo mẫu</li>
                      <li>Tải lên file Excel đã điền thông tin</li>
                      <li>Kiểm tra dữ liệu và sửa các lỗi (nếu có)</li>
                      <li>Nhấn "Nhập dữ liệu" để hoàn tất</li>
                    </ol>
                    <div className="mt-3">
                      <button
                        onClick={downloadTemplateFile}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-all flex items-center gap-1 text-sm"
                      >
                        <Download size={14} />
                        Tải file mẫu
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls"
                  className="hidden"
                  id="excel-file-input"
                />
                <label
                  htmlFor="excel-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <Upload size={40} className="text-gray-400" />
                  <p className="text-gray-700 font-medium">Chọn file Excel hoặc kéo thả vào đây</p>
                  <p className="text-sm text-gray-500">Chỉ chấp nhận file .xlsx, .xls</p>
                  <button
                    type="button"
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                    onClick={() => document.getElementById('excel-file-input')?.click()}
                  >
                    Chọn file
                  </button>
                </label>
              </div>

              {importData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dữ liệu nhập ({importData.length} học sinh)
                    </h3>
                    <div className="flex items-center gap-2">
                      {Object.keys(importErrors).length > 0 ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle size={16} />
                          <span className="text-sm font-medium">
                            {Object.keys(importErrors).length} lỗi cần sửa
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={16} />
                          <span className="text-sm font-medium">
                            Dữ liệu hợp lệ
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">STT</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Tên học sinh</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Ngày sinh</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Giới tính</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Tên phụ huynh</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">SĐT</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Lớp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importData.map((row, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3">{index + 1}</td>
                            <td className="py-2 px-3">
                              <div>
                                <p className={importErrors[`${index}-name`] ? 'text-red-600' : ''}>{row.name}</p>
                                {importErrors[`${index}-name`] && (
                                  <p className="text-xs text-red-600">{importErrors[`${index}-name`]}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div>
                                <p className={importErrors[`${index}-birthDate`] ? 'text-red-600' : ''}>{row.birthDate}</p>
                                {importErrors[`${index}-birthDate`] && (
                                  <p className="text-xs text-red-600">{importErrors[`${index}-birthDate`]}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              {row.gender === 'male' ? 'Nam' : row.gender === 'female' ? 'Nữ' : 'Khác'}
                            </td>
                            <td className="py-2 px-3">
                              <div>
                                <p className={importErrors[`${index}-parentName`] ? 'text-red-600' : ''}>{row.parentName}</p>
                                {importErrors[`${index}-parentName`] && (
                                  <p className="text-xs text-red-600">{importErrors[`${index}-parentName`]}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div>
                                <p className={importErrors[`${index}-parentPhone`] ? 'text-red-600' : ''}>{row.parentPhone}</p>
                                {importErrors[`${index}-parentPhone`] && (
                                  <p className="text-xs text-red-600">{importErrors[`${index}-parentPhone`]}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div>
                                <p className={importErrors[`${index}-className`] ? 'text-red-600' : ''}>{row.className}</p>
                                {importErrors[`${index}-className`] && (
                                  <p className="text-xs text-red-600">{importErrors[`${index}-className`]}</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(false);
                        setImportData([]);
                        setImportErrors({});
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleImportStudents}
                      disabled={isImporting || Object.keys(importErrors).length > 0}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isImporting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Đang nhập...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Nhập dữ liệu
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}