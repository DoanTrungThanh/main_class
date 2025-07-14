import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { hasPermission } from '../constants/permissions';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  User,
  X,
  Save,
  BookMarked,
  Download,
} from 'lucide-react';
import { Class } from '../types';
import { exportClasses } from '../lib/excelExport';

export default function ClassesManager() {
  const {
    students,
    classes,
    schedules,
    subjects,
    addClass,
    updateClass,
    deleteClass,
    updateStudent,
    updateStudentClass,
    deleteSchedule,
    refreshData
  } = useData();
  const { user } = useAuth();
  const toast = useToastContext();
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isCleaningData, setIsCleaningData] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    teacherId: '',
    studentIds: [] as string[],
    subjectId: '',
  });

  // Kiểm tra quyền dựa trên permissions
  const userPermissions = user?.permissions || [];
  const userRole = user?.role;
  const canViewClasses = hasPermission(userPermissions, 'classes.view', userRole);
  const canCreateClasses = hasPermission(userPermissions, 'classes.create', userRole);
  const canEditClasses = hasPermission(userPermissions, 'classes.edit', userRole);
  const canDeleteClasses = hasPermission(userPermissions, 'classes.delete', userRole);
  const canManageClasses = canEditClasses || canDeleteClasses;

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      teacherId: '',
      studentIds: [],
      subjectId: '',
    });
    setEditingClass(null);
    setStudentSearchTerm('');
  };

  // Hàm làm sạch dữ liệu - loại bỏ học sinh không hoạt động khỏi tất cả các lớp
  const cleanClassData = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn làm sạch dữ liệu lớp học?\n\nViệc này sẽ loại bỏ tất cả học sinh đã nghỉ học khỏi các lớp.')) {
      return;
    }

    setIsCleaningData(true);
    try {
      let updatedCount = 0;

      for (const cls of classes) {
        const activeStudentIds = cls.studentIds.filter(studentId => {
          const student = students.find(s => s.id === studentId);
          return student && student.status === 'active';
        });

        // Nếu có sự thay đổi, cập nhật lớp
        if (activeStudentIds.length !== cls.studentIds.length) {
          await updateClass(cls.id, {
            ...cls,
            studentIds: activeStudentIds
          });
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        toast.success(`Đã làm sạch dữ liệu cho ${updatedCount} lớp học!`);
        await refreshData();
      } else {
        toast.info('Dữ liệu đã sạch, không cần cập nhật!');
      }
    } catch (error) {
      console.error('Error cleaning class data:', error);
      toast.error('Có lỗi xảy ra khi làm sạch dữ liệu!');
    } finally {
      setIsCleaningData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Lọc chỉ lấy học sinh đang hoạt động
      const activeStudentIds = formData.studentIds.filter(studentId => {
        const student = students.find(s => s.id === studentId);
        return student && student.status === 'active';
      });

      if (editingClass) {
        // Nếu đang chỉnh sửa lớp học
        const oldStudentIds = editingClass.studentIds;
        const newStudentIds = activeStudentIds;
        
        // Cập nhật thông tin lớp với danh sách học sinh đã lọc
        await updateClass(editingClass.id, {
          ...formData,
          studentIds: activeStudentIds,
          maxStudents: 100 // Set a default value
        });
        
        // Cập nhật classId cho các học sinh sử dụng updateStudentClass để đồng bộ dữ liệu
        // Xóa classId của học sinh không còn trong lớp
        const removedStudents = oldStudentIds.filter(id => !newStudentIds.includes(id));
        for (const studentId of removedStudents) {
          await updateStudentClass(studentId, '', editingClass.id);
        }

        // Thêm classId cho học sinh mới
        const addedStudents = newStudentIds.filter(id => !oldStudentIds.includes(id));
        for (const studentId of addedStudents) {
          const student = students.find(s => s.id === studentId);
          const oldClassId = student?.classId || '';
          await updateStudentClass(studentId, editingClass.id, oldClassId);
        }
        
        toast.success('Cập nhật lớp học thành công!');
      } else {
        // Nếu đang thêm lớp học mới
        const newClass = {
          ...formData,
          studentIds: activeStudentIds,
          teacherId: user?.id || '',
          maxStudents: 100 // Set a default value
        };

        const createdClass = await addClass(newClass);

        // Cập nhật classId cho các học sinh được chọn sử dụng updateStudentClass
        for (const studentId of activeStudentIds) {
          const student = students.find(s => s.id === studentId);
          const oldClassId = student?.classId || '';
          await updateStudentClass(studentId, createdClass.id, oldClassId);
        }
        
        toast.success('Tạo lớp học thành công!');
      }
      
      // Refresh data to ensure everything is in sync
      await refreshData();
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('Có lỗi xảy ra khi lưu thông tin lớp học!');
    }
  };

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    // Chỉ load học sinh đang hoạt động
    const activeStudentIds = cls.studentIds.filter(studentId => {
      const student = students.find(s => s.id === studentId);
      return student && student.status === 'active';
    });

    setFormData({
      name: cls.name,
      teacherId: cls.teacherId,
      studentIds: activeStudentIds,
      subjectId: cls.subjectId || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const classToDelete = classes.find(c => c.id === id);
    if (!classToDelete) return;

    // Tìm tất cả lịch dạy liên quan đến lớp này
    const relatedSchedules = schedules.filter(schedule => schedule.classId === id);

    // Đếm số học sinh đang hoạt động trong lớp
    const activeStudentsCount = students.filter(s =>
      classToDelete.studentIds.includes(s.id) && s.status === 'active'
    ).length;

    const confirmMessage = relatedSchedules.length > 0
      ? `Bạn có chắc chắn muốn xóa lớp học "${classToDelete.name}" không?\n\n⚠️ CẢNH BÁO: Việc này sẽ xóa:\n• Lớp học\n• ${relatedSchedules.length} lịch dạy liên quan\n• Thông tin lớp của ${activeStudentsCount} học sinh đang học\n\nHành động này không thể hoàn tác!`
      : `Bạn có chắc chắn muốn xóa lớp học "${classToDelete.name}" không?\n\nViệc này sẽ xóa thông tin lớp của ${activeStudentsCount} học sinh đang học.`;
      
    if (window.confirm(confirmMessage)) {
      try {
        // 1. Xóa tất cả lịch dạy liên quan đến lớp này
        for (const schedule of relatedSchedules) {
          await deleteSchedule(schedule.id);
        }
        
        // 2. Xóa classId của tất cả học sinh trong lớp
        for (const studentId of classToDelete.studentIds) {
          await updateStudent(studentId, { classId: '' });
        }
        
        // 3. Xóa lớp học
        await deleteClass(id);
        
        // 4. Refresh data to ensure everything is in sync
        await refreshData();
        
        if (relatedSchedules.length > 0) {
          toast.success(`Đã xóa lớp học "${classToDelete.name}" và ${relatedSchedules.length} lịch dạy liên quan!`);
        } else {
          toast.success(`Đã xóa lớp học "${classToDelete.name}" thành công!`);
        }
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error('Có lỗi xảy ra khi xóa lớp học!');
      }
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Không tìm thấy';
  };

  // Lấy danh sách học sinh có thể chọn
  const getAvailableStudents = () => {
    return students.filter(student => {
      // Chỉ hiển thị học sinh đang học (status: 'active')
      if (student.status !== 'active') {
        return false;
      }

      // Nếu đang chỉnh sửa lớp, cho phép chọn học sinh hiện tại trong lớp (chỉ nếu họ vẫn đang hoạt động)
      if (editingClass && editingClass.studentIds.includes(student.id)) {
        return true;
      }
      // Chỉ hiển thị học sinh chưa có lớp
      return !student.classId || student.classId === '';
    });
  };

  const handleStudentToggle = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));
  };

  const availableStudents = getAvailableStudents();
  const filteredAvailableStudents = availableStudents.filter(student => 
    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.parentName.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  // Thống kê lịch dạy cho mỗi lớp
  const getClassScheduleStats = (classId: string) => {
    const classSchedules = schedules.filter(s => s.classId === classId);
    const today = new Date().toISOString().split('T')[0];
    const upcomingSchedules = classSchedules.filter(s => s.date >= today);
    
    return {
      total: classSchedules.length,
      upcoming: upcomingSchedules.length,
    };
  };

  // Lấy tên môn học
  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return '';
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || '';
  };

  // Lấy màu môn học
  const getSubjectColor = (subjectId?: string) => {
    if (!subjectId) return '#6B7280'; // Default gray
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || '#6B7280';
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportClasses(filteredClasses, students, subjects);
      toast.success('Xuất dữ liệu thành công!');
    } catch (error) {
      console.error('Error exporting classes:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  // Kiểm tra quyền xem lớp học
  if (!canViewClasses) {
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý lớp học</h1>
          <p className="text-gray-600 mt-1">
            Tổng cộng {classes.length} lớp học
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cleanClassData}
            disabled={isCleaningData}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-all flex items-center gap-2"
            title="Loại bỏ học sinh đã nghỉ khỏi tất cả các lớp"
          >
            <Users size={20} />
            {isCleaningData ? 'Đang làm sạch...' : 'Làm sạch dữ liệu'}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <Download size={20} />
            {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
          {canCreateClasses && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Tạo lớp học
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm lớp học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => {
            const scheduleStats = getClassScheduleStats(cls.id);
            const subjectName = getSubjectName(cls.subjectId);
            const subjectColor = getSubjectColor(cls.subjectId);
            
            return (
              <div key={cls.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                  {(canEditClasses || canDeleteClasses) && (
                    <div className="flex items-center gap-2">
                      {canEditClasses && (
                        <button
                          onClick={() => handleEdit(cls)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {canDeleteClasses && (
                        <button
                          onClick={() => handleDelete(cls.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Xóa lớp học và lịch dạy"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {subjectName && (
                    <div 
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white mb-2"
                      style={{ backgroundColor: subjectColor }}
                    >
                      <BookMarked size={12} />
                      {subjectName}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={16} />
                    <span className="text-sm">Giáo viên: Teacher User</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} />
                    <span className="text-sm">
                      {students.filter(s => cls.studentIds.includes(s.id) && s.status === 'active').length} học sinh
                    </span>
                  </div>

                  {/* Thống kê lịch dạy */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Lịch dạy</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center">
                        <p className="font-semibold text-blue-600">{scheduleStats.total}</p>
                        <p className="text-blue-700">Tổng số</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">{scheduleStats.upcoming}</p>
                        <p className="text-green-700">Sắp tới</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Danh sách học sinh:</p>
                    {(() => {
                      const activeStudents = cls.studentIds.filter(studentId => {
                        const student = students.find(s => s.id === studentId);
                        return student && student.status === 'active';
                      });

                      return activeStudents.length > 0 ? (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {activeStudents.map((studentId) => (
                            <div key={studentId} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                              {getStudentName(studentId)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Chưa có học sinh đang học</p>
                      );
                    })()}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Tạo: {new Date(cls.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      {scheduleStats.total > 0 && (
                        <span className="text-xs text-orange-600 font-medium">
                          ⚠️ Có {scheduleStats.total} lịch dạy
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {searchTerm ? 'Không tìm thấy lớp học nào' : 'Chưa có lớp học nào'}
            </div>
          </div>
        )}
      </div>

      {/* Modal thêm/sửa lớp học */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingClass ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
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
                  Tên lớp học *
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
                  Môn học
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn môn học</option>
                  {subjects.filter(s => s.isActive).map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn học sinh ({formData.studentIds.length} học sinh)
                </label>
                
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm học sinh..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {filteredAvailableStudents.length > 0 ? (
                    <div className="space-y-2">
                      {filteredAvailableStudents.map((student) => (
                        <label key={student.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.studentIds.includes(student.id)}
                            onChange={() => handleStudentToggle(student.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(student.birthDate).toLocaleDateString('vi-VN')} - {student.parentName}
                            </p>
                            {student.classId && student.classId !== editingClass?.id && (
                              <p className="text-xs text-orange-600">
                                Đã có lớp: {classes.find(c => c.id === student.classId)?.name}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      {studentSearchTerm ? 'Không tìm thấy học sinh phù hợp' : 'Không có học sinh khả dụng'}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Chỉ hiển thị học sinh đang học (trạng thái hoạt động), chưa có lớp hoặc đang trong lớp này
                </p>
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
                  {editingClass ? 'Cập nhật' : 'Tạo lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}