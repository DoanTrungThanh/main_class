import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { 
  Student, 
  Class, 
  Schedule, 
  Attendance, 
  FinanceRecord, 
  Asset, 
  Classroom, 
  GradePeriod, 
  GradeColumn, 
  Grade,
  Subject
} from '../types';

// Helper function to format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  } catch (error) {
    return dateString;
  }
};

// Helper function to set up common workbook properties
const setupWorkbook = (title: string): ExcelJS.Workbook => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Classroom Management System';
  workbook.lastModifiedBy = 'Classroom Management System';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;
  
  // Add title worksheet
  const titleSheet = workbook.addWorksheet('Thông tin');
  titleSheet.addRow(['BÁO CÁO ' + title.toUpperCase()]);
  titleSheet.addRow(['Ngày xuất: ' + new Date().toLocaleDateString('vi-VN')]);
  titleSheet.addRow(['Thời gian: ' + new Date().toLocaleTimeString('vi-VN')]);
  titleSheet.addRow(['']);
  titleSheet.addRow(['Classroom Management System']);
  
  // Format title
  titleSheet.getCell('A1').font = {
    size: 16,
    bold: true,
    color: { argb: '4472C4' }
  };
  
  titleSheet.getColumn('A').width = 40;
  
  return workbook;
};

// Helper function to apply styles to header row
const styleHeaderRow = (worksheet: ExcelJS.Worksheet, headerRow: ExcelJS.Row): void => {
  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
  });
};

// Export Students
export const exportStudents = async (students: Student[], classes: Class[]): Promise<void> => {
  const workbook = setupWorkbook('Danh sách học sinh');
  
  // Create worksheet
  const worksheet = workbook.addWorksheet('Học sinh');
  
  // Define columns
  worksheet.columns = [
    { header: 'Mã HS', key: 'id', width: 15 },
    { header: 'Tên học sinh', key: 'name', width: 25 },
    { header: 'Giới tính', key: 'gender', width: 10 },
    { header: 'Ngày sinh', key: 'birthDate', width: 15 },
    { header: 'Tên phụ huynh (Ba)', key: 'parentName', width: 25 },
    { header: 'Tên phụ huynh (Mẹ)', key: 'motherName', width: 25 },
    { header: 'SĐT', key: 'parentPhone', width: 15 },
    { header: 'CCCD (Ba)', key: 'parentIdCard', width: 20 },
    { header: 'CCCD (Mẹ)', key: 'parentIdCard2', width: 20 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Lớp', key: 'className', width: 20 },
  ];
  
  // Style header row
  styleHeaderRow(worksheet, worksheet.getRow(1));
  
  // Add data
  students.forEach(student => {
    const classInfo = classes.find(c => c.id === student.classId);
    const className = classInfo ? classInfo.name : 'Chưa phân lớp';
    
    const genderLabel = student.gender === 'male' ? 'Nam' : 
                        student.gender === 'female' ? 'Nữ' : 'Khác';
    
    const statusLabel = student.status === 'active' ? 'Đang học' : 'Nghỉ học';
    
    worksheet.addRow({
      id: student.id,
      name: student.name,
      gender: genderLabel,
      birthDate: formatDate(student.birthDate),
      parentName: student.parentName,
      motherName: student.motherName || '',
      parentPhone: student.parentPhone,
      parentIdCard: student.parentIdCard || '',
      parentIdCard2: student.parentIdCard2 || '',
      status: statusLabel,
      className: className,
    });
  });
  
  // Apply borders to all data cells
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Danh_sach_hoc_sinh_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export Classes
export const exportClasses = async (classes: Class[], students: Student[], subjects: Subject[]): Promise<void> => {
  const workbook = setupWorkbook('Danh sách lớp học');
  
  // Create worksheet
  const worksheet = workbook.addWorksheet('Lớp học');
  
  // Define columns
  worksheet.columns = [
    { header: 'Mã lớp', key: 'id', width: 15 },
    { header: 'Tên lớp', key: 'name', width: 25 },
    { header: 'Môn học', key: 'subjectName', width: 20 },
    { header: 'Mã giáo viên', key: 'teacherId', width: 15 },
    { header: 'Số học sinh', key: 'studentCount', width: 15 },
    { header: 'Ngày tạo', key: 'createdAt', width: 15 },
  ];
  
  // Style header row
  styleHeaderRow(worksheet, worksheet.getRow(1));
  
  // Add data
  classes.forEach(cls => {
    const subject = subjects.find(s => s.id === cls.subjectId);
    
    worksheet.addRow({
      id: cls.id,
      name: cls.name,
      subjectName: subject ? subject.name : '',
      teacherId: cls.teacherId,
      studentCount: students.filter(s => cls.studentIds.includes(s.id) && s.status === 'active').length,
      createdAt: formatDate(cls.createdAt),
    });
  });
  
  // Apply borders to all data cells
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });
  
  // Create a worksheet for each class with its students
  classes.forEach(cls => {
    const classStudents = students.filter(s => cls.studentIds.includes(s.id) && s.status === 'active');
    if (classStudents.length === 0) return;
    
    const classSheet = workbook.addWorksheet(`Lớp ${cls.name}`);
    
    // Define columns for class detail
    classSheet.columns = [
      { header: 'STT', key: 'index', width: 8 },
      { header: 'Mã HS', key: 'id', width: 15 },
      { header: 'Tên học sinh', key: 'name', width: 25 },
      { header: 'Giới tính', key: 'gender', width: 10 },
      { header: 'Ngày sinh', key: 'birthDate', width: 15 },
      { header: 'Tên phụ huynh', key: 'parentName', width: 25 },
      { header: 'SĐT', key: 'parentPhone', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
    ];
    
    // Style header row
    styleHeaderRow(classSheet, classSheet.getRow(1));
    
    // Add data
    classStudents.forEach((student, index) => {
      const genderLabel = student.gender === 'male' ? 'Nam' : 
                          student.gender === 'female' ? 'Nữ' : 'Khác';
      
      const statusLabel = student.status === 'active' ? 'Đang học' : 'Nghỉ học';
      
      classSheet.addRow({
        index: index + 1,
        id: student.id,
        name: student.name,
        gender: genderLabel,
        birthDate: formatDate(student.birthDate),
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        status: statusLabel,
      });
    });
    
    // Apply borders to all data cells
    classSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
    });
  });
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Danh_sach_lop_hoc_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export Schedules
export const exportSchedules = async (
  schedules: Schedule[],
  classes: Class[],
  classrooms: Classroom[],
  users: any[],
  subjects: Subject[],
  startDate?: string,
  endDate?: string
): Promise<void> => {
  const workbook = setupWorkbook('Lịch dạy');
  
  // Filter schedules by date range if provided
  let filteredSchedules = [...schedules];
  if (startDate && endDate) {
    filteredSchedules = schedules.filter(s => s.date >= startDate && s.date <= endDate);
  }
  
  // Sort schedules by date
  filteredSchedules.sort((a, b) => a.date.localeCompare(b.date));
  
  // Create worksheet
  const worksheet = workbook.addWorksheet('Lịch dạy');
  
  // Define columns
  worksheet.columns = [
    { header: 'Ngày', key: 'date', width: 15 },
    { header: 'Thứ', key: 'dayOfWeek', width: 10 },
    { header: 'Ca', key: 'timeSlot', width: 10 },
    { header: 'Giờ bắt đầu', key: 'startTime', width: 12 },
    { header: 'Giờ kết thúc', key: 'endTime', width: 12 },
    { header: 'Lớp', key: 'className', width: 20 },
    { header: 'Môn học', key: 'subjectName', width: 20 },
    { header: 'Giáo viên', key: 'teacherName', width: 20 },
    { header: 'Phòng học', key: 'classroomName', width: 15 },
    { header: 'Trạng thái', key: 'status', width: 15 },
  ];
  
  // Style header row
  styleHeaderRow(worksheet, worksheet.getRow(1));
  
  // Add data
  filteredSchedules.forEach(schedule => {
    const classInfo = classes.find(c => c.id === schedule.classId);
    const classroom = classrooms.find(c => c.id === schedule.classroomId);
    const teacher = users.find(u => u.id === schedule.teacherId);
    
    // Get subject name
    let subjectName = '';
    if (schedule.subjectId) {
      const subject = subjects.find(s => s.id === schedule.subjectId);
      if (subject) subjectName = subject.name;
    } else if (classInfo?.subjectId) {
      const subject = subjects.find(s => s.id === classInfo.subjectId);
      if (subject) subjectName = subject.name;
    }
    
    // Get day of week
    const date = new Date(schedule.date);
    const dayOfWeek = date.toLocaleDateString('vi-VN', { weekday: 'long' });
    
    // Get time slot label
    const timeSlotLabel = schedule.timeSlot === 'morning' ? 'Sáng' :
                          schedule.timeSlot === 'afternoon' ? 'Trưa' : 'Chiều';
    
    // Get status label
    const statusLabel = schedule.status === 'scheduled' ? 'Đã lên lịch' :
                        schedule.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy';
    
    worksheet.addRow({
      date: formatDate(schedule.date),
      dayOfWeek: dayOfWeek,
      timeSlot: timeSlotLabel,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      className: classInfo ? classInfo.name : '',
      subjectName: subjectName,
      teacherName: teacher ? teacher.name : '',
      classroomName: classroom ? classroom.name : '',
      status: statusLabel,
    });
  });
  
  // Apply borders to all data cells
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });
  
  // Create a summary worksheet
  const summarySheet = workbook.addWorksheet('Tổng hợp');
  
  // Define columns for summary
  summarySheet.columns = [
    { header: 'Thông tin', key: 'info', width: 30 },
    { header: 'Giá trị', key: 'value', width: 15 },
  ];
  
  // Style header row
  styleHeaderRow(summarySheet, summarySheet.getRow(1));
  
  // Add summary data
  summarySheet.addRow({ info: 'Tổng số lịch dạy', value: filteredSchedules.length });
  
  // Count by time slot
  const morningCount = filteredSchedules.filter(s => s.timeSlot === 'morning').length;
  const afternoonCount = filteredSchedules.filter(s => s.timeSlot === 'afternoon').length;
  const eveningCount = filteredSchedules.filter(s => s.timeSlot === 'evening').length;
  
  summarySheet.addRow({ info: 'Số buổi sáng', value: morningCount });
  summarySheet.addRow({ info: 'Số buổi trưa', value: afternoonCount });
  summarySheet.addRow({ info: 'Số buổi chiều', value: eveningCount });
  
  // Count by status
  const scheduledCount = filteredSchedules.filter(s => s.status === 'scheduled').length;
  const completedCount = filteredSchedules.filter(s => s.status === 'completed').length;
  const cancelledCount = filteredSchedules.filter(s => s.status === 'cancelled').length;
  
  summarySheet.addRow({ info: 'Đã lên lịch', value: scheduledCount });
  summarySheet.addRow({ info: 'Đã hoàn thành', value: completedCount });
  summarySheet.addRow({ info: 'Đã hủy', value: cancelledCount });
  
  // Apply borders to all data cells
  summarySheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const fileName = startDate && endDate
    ? `Lich_day_tu_${startDate}_den_${endDate}.xlsx`
    : `Lich_day_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  saveAs(blob, fileName);
};

// Export Attendance
export const exportAttendance = async (
  attendance: Attendance[],
  schedules: Schedule[],
  classes: Class[],
  students: Student[],
  startDate?: string,
  endDate?: string
): Promise<void> => {
  const workbook = setupWorkbook('Điểm danh');
  
  // Filter attendance by date range if provided
  let filteredAttendance = [...attendance];
  if (startDate && endDate) {
    filteredAttendance = attendance.filter(a => {
      const schedule = schedules.find(s => s.id === a.scheduleId);
      return schedule && schedule.date >= startDate && schedule.date <= endDate;
    });
  }
  
  // Create worksheet
  const worksheet = workbook.addWorksheet('Điểm danh');
  
  // Define columns
  worksheet.columns = [
    { header: 'Ngày', key: 'date', width: 15 },
    { header: 'Lớp', key: 'className', width: 20 },
    { header: 'Học sinh', key: 'studentName', width: 25 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Thời gian điểm danh', key: 'checkedAt', width: 20 },
  ];
  
  // Style header row
  styleHeaderRow(worksheet, worksheet.getRow(1));
  
  // Add data
  filteredAttendance.forEach(att => {
    const schedule = schedules.find(s => s.id === att.scheduleId);
    const classInfo = schedule ? classes.find(c => c.id === schedule.classId) : null;
    const student = students.find(s => s.id === att.studentId);
    
    // Get status label
    const statusLabel = att.status === 'present' ? 'Có mặt' :
                        att.status === 'late' ? 'Đi muộn' : 'Vắng mặt';
    
    worksheet.addRow({
      date: schedule ? formatDate(schedule.date) : '',
      className: classInfo ? classInfo.name : '',
      studentName: student ? student.name : '',
      status: statusLabel,
      checkedAt: att.checkedAt ? new Date(att.checkedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '',
    });
  });
  
  // Apply borders to all data cells
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });
  
  // Create a summary worksheet
  const summarySheet = workbook.addWorksheet('Tổng hợp');
  
  // Define columns for summary
  summarySheet.columns = [
    { header: 'Thông tin', key: 'info', width: 30 },
    { header: 'Giá trị', key: 'value', width: 15 },
  ];
  
  // Style header row
  styleHeaderRow(summarySheet, summarySheet.getRow(1));
  
  // Add summary data
  summarySheet.addRow({ info: 'Tổng số điểm danh', value: filteredAttendance.length });
  
  // Count by status
  const presentCount = filteredAttendance.filter(a => a.status === 'present').length;
  const lateCount = filteredAttendance.filter(a => a.status === 'late').length;
  const absentCount = filteredAttendance.filter(a => a.status === 'absent').length;
  
  summarySheet.addRow({ info: 'Số lượt có mặt', value: presentCount });
  summarySheet.addRow({ info: 'Số lượt đi muộn', value: lateCount });
  summarySheet.addRow({ info: 'Số lượt vắng mặt', value: absentCount });
  
  // Calculate attendance rate
  const attendanceRate = filteredAttendance.length > 0
    ? Math.round(((presentCount + lateCount) / filteredAttendance.length) * 100)
    : 0;
  
  summarySheet.addRow({ info: 'Tỷ lệ có mặt', value: `${attendanceRate}%` });
  
  // Apply borders to all data cells
  summarySheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const fileName = startDate && endDate
    ? `Diem_danh_tu_${startDate}_den_${endDate}.xlsx`
    : `Diem_danh_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  saveAs(blob, fileName);
};

// Export Grades
export const exportGrades = async (
  grades: Grade[],
  gradeColumns: GradeColumn[],
  students: Student[],
  classes: Class[],
  subjects: Subject[],
  classId?: string
): Promise<void> => {
  const workbook = setupWorkbook('Bảng điểm');
  
  // Filter grades by class if provided
  let filteredGradeColumns = [...gradeColumns];
  if (classId) {
    filteredGradeColumns = gradeColumns.filter(gc => gc.classId === classId);
  }
  
  // Get unique class IDs from grade columns
  const classIds = [...new Set(filteredGradeColumns.map(gc => gc.classId))];
  
  // For each class, create a separate worksheet
  classIds.forEach(cId => {
    const classInfo = classes.find(c => c.id === cId);
    if (!classInfo) return;
    
    const classGradeColumns = filteredGradeColumns.filter(gc => gc.classId === cId);
    const classStudents = students.filter(s => classInfo.studentIds.includes(s.id) && s.status === 'active');
    
    // Skip if no students or grade columns
    if (classStudents.length === 0 || classGradeColumns.length === 0) return;
    
    // Create worksheet
    const worksheet = workbook.addWorksheet(`Lớp ${classInfo.name}`);
    
    // Get subject name
    let subjectName = '';
    if (classInfo.subjectId) {
      const subject = subjects.find(s => s.id === classInfo.subjectId);
      if (subject) subjectName = subject.name;
    }
    
    // Add class info
    worksheet.addRow([`BẢNG ĐIỂM LỚP: ${classInfo.name}`]);
    if (subjectName) {
      worksheet.addRow([`MÔN HỌC: ${subjectName}`]);
    }
    worksheet.addRow([`SỐ HỌC SINH: ${classStudents.length}`]);
    worksheet.addRow(['']);
    
    // Format class info
    worksheet.getCell('A1').font = {
      size: 14,
      bold: true,
      color: { argb: '4472C4' }
    };
    
    if (subjectName) {
      worksheet.getCell('A2').font = {
        size: 12,
        bold: true
      };
      worksheet.getCell('A3').font = {
        size: 12
      };
    } else {
      worksheet.getCell('A2').font = {
        size: 12
      };
    }
    
    // Define dynamic columns based on grade columns
    const columns: any[] = [
      { header: 'STT', key: 'index', width: 8 },
      { header: 'Mã HS', key: 'id', width: 15 },
      { header: 'Tên học sinh', key: 'name', width: 25 },
    ];
    
    // Add grade columns
    classGradeColumns.forEach((gc, index) => {
      columns.push({
        header: `${gc.name}\n(${gc.maxScore}đ x${gc.weight})`,
        key: `grade_${index}`,
        width: 15
      });
    });
    
    // Add average column
    columns.push({
      header: 'Trung bình',
      key: 'average',
      width: 15
    });
    
    // Set columns
    worksheet.columns = columns;
    
    // Get the header row (accounting for the class info rows)
    const headerRowIndex = subjectName ? 5 : 4;
    const headerRow = worksheet.getRow(headerRowIndex);
    
    // Style header row
    styleHeaderRow(worksheet, headerRow);
    
    // Add student data
    classStudents.forEach((student, index) => {
      const rowData: any = {
        index: index + 1,
        id: student.id,
        name: student.name,
      };
      
      // Add grades for each column
      let totalWeightedScore = 0;
      let totalWeight = 0;
      
      classGradeColumns.forEach((gc, gcIndex) => {
        const studentGrade = grades.find(g => g.gradeColumnId === gc.id && g.studentId === student.id);
        const score = studentGrade?.score !== undefined ? studentGrade.score : '';
        
        rowData[`grade_${gcIndex}`] = score;
        
        // Calculate weighted score for average
        if (score !== '') {
          totalWeightedScore += (score / gc.maxScore) * gc.weight;
          totalWeight += gc.weight;
        }
      });
      
      // Calculate average (scaled to 10)
      const average = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 10 : '';
      rowData.average = average !== '' ? average.toFixed(1) : '';
      
      worksheet.addRow(rowData);
    });
    
    // Apply borders and center alignment to all data cells
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > headerRowIndex) { // Skip header and info rows
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          
          // Center numeric cells
          if (typeof cell.value === 'number' || !isNaN(Number(cell.value))) {
            cell.alignment = {
              horizontal: 'center'
            };
          }
        });
      }
    });
  });
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const fileName = classId
    ? `Bang_diem_lop_${classes.find(c => c.id === classId)?.name || classId}_${new Date().toISOString().split('T')[0]}.xlsx`
    : `Bang_diem_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  saveAs(blob, fileName);
};

// Export Finances
export const exportFinances = async (
  finances: FinanceRecord[],
  startDate?: string,
  endDate?: string
): Promise<void> => {
  const workbook = setupWorkbook('Báo cáo tài chính');
  
  // Filter finances by date range if provided
  let filteredFinances = [...finances];
  if (startDate && endDate) {
    filteredFinances = finances.filter(f => f.date >= startDate && f.date <= endDate);
  }
  
  // Sort finances by date
  filteredFinances.sort((a, b) => a.date.localeCompare(b.date));
  
  // Create worksheet
  const worksheet = workbook.addWorksheet('Tài chính');
  
  // Define columns
  worksheet.columns = [
    { header: 'Ngày', key: 'date', width: 15 },
    { header: 'Loại', key: 'type', width: 10 },
    { header: 'Danh mục', key: 'category', width: 20 },
    { header: 'Mô tả', key: 'description', width: 40 },
    { header: 'Số tiền (VNĐ)', key: 'amount', width: 20 },
  ];
  
  // Style header row
  styleHeaderRow(worksheet, worksheet.getRow(1));
  
  // Add data
  filteredFinances.forEach(finance => {
    const typeLabel = finance.type === 'income' ? 'Thu' : 'Chi';
    
    const row = worksheet.addRow({
      date: formatDate(finance.date),
      type: typeLabel,
      category: finance.category,
      description: finance.description,
      amount: finance.amount,
    });
    
    // Style amount cell based on type
    const amountCell = row.getCell('amount');
    amountCell.numFmt = '#,##0';
    amountCell.font = {
      color: { argb: finance.type === 'income' ? '008000' : 'FF0000' }
    };
  });
  
  // Apply borders to all data cells
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });
  
  // Create a summary worksheet
  const summarySheet = workbook.addWorksheet('Tổng hợp');
  
  // Define columns for summary
  summarySheet.columns = [
    { header: 'Thông tin', key: 'info', width: 30 },
    { header: 'Giá trị (VNĐ)', key: 'value', width: 20 },
  ];
  
  // Style header row
  styleHeaderRow(summarySheet, summarySheet.getRow(1));
  
  // Calculate totals
  const totalIncome = filteredFinances
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);
  
  const totalExpense = filteredFinances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);
  
  const balance = totalIncome - totalExpense;
  
  // Add summary data
  summarySheet.addRow({ info: 'Tổng thu', value: totalIncome });
  summarySheet.addRow({ info: 'Tổng chi', value: totalExpense });
  summarySheet.addRow({ info: 'Số dư', value: balance });
  
  // Style summary cells
  summarySheet.getCell('B2').numFmt = '#,##0';
  summarySheet.getCell('B2').font = { color: { argb: '008000' } };
  
  summarySheet.getCell('B3').numFmt = '#,##0';
  summarySheet.getCell('B3').font = { color: { argb: 'FF0000' } };
  
  summarySheet.getCell('B4').numFmt = '#,##0';
  summarySheet.getCell('B4').font = {
    color: { argb: balance >= 0 ? '008000' : 'FF0000' },
    bold: true
  };
  
  // Apply borders to all data cells
  summarySheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const fileName = startDate && endDate
    ? `Bao_cao_tai_chinh_tu_${startDate}_den_${endDate}.xlsx`
    : `Bao_cao_tai_chinh_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  saveAs(blob, fileName);
};

// Export Assets
export const exportAssets = async (assets: Asset[]): Promise<void> => {
  const workbook = setupWorkbook('Danh sách tài sản');
  
  // Create worksheet
  const worksheet = workbook.addWorksheet('Tài sản');
  
  // Define columns
  worksheet.columns = [
    { header: 'Mã tài sản', key: 'id', width: 15 },
    { header: 'Tên tài sản', key: 'name', width: 30 },
    { header: 'Danh mục', key: 'category', width: 20 },
    { header: 'Số lượng', key: 'quantity', width: 10 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Giao cho', key: 'assignedTo', width: 20 },
    { header: 'Ngày nhận', key: 'receivedDate', width: 15 },
    { header: 'Mô tả', key: 'description', width: 40 },
  ];
  
  // Style header row
  styleHeaderRow(worksheet, worksheet.getRow(1));
  
  // Add data
  assets.forEach(asset => {
    // Get status label
    const statusLabel = asset.status === 'available' ? 'Có sẵn' :
                        asset.status === 'distributed' ? 'Đã phân phối' : 'Bảo trì';
    
    worksheet.addRow({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      quantity: asset.quantity,
      status: statusLabel,
      assignedTo: asset.assignedTo || '',
      receivedDate: formatDate(asset.receivedDate),
      description: asset.description || '',
    });
  });
  
  // Apply borders to all data cells
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });
  
  // Create a summary worksheet
  const summarySheet = workbook.addWorksheet('Tổng hợp');
  
  // Define columns for summary
  summarySheet.columns = [
    { header: 'Thông tin', key: 'info', width: 30 },
    { header: 'Giá trị', key: 'value', width: 15 },
  ];
  
  // Style header row
  styleHeaderRow(summarySheet, summarySheet.getRow(1));
  
  // Calculate totals
  const totalAssets = assets.length;
  const totalQuantity = assets.reduce((sum, a) => sum + a.quantity, 0);
  
  // Count by status
  const availableCount = assets.filter(a => a.status === 'available').length;
  const distributedCount = assets.filter(a => a.status === 'distributed').length;
  const maintenanceCount = assets.filter(a => a.status === 'maintenance').length;
  
  // Add summary data
  summarySheet.addRow({ info: 'Tổng số tài sản', value: totalAssets });
  summarySheet.addRow({ info: 'Tổng số lượng', value: totalQuantity });
  summarySheet.addRow({ info: 'Có sẵn', value: availableCount });
  summarySheet.addRow({ info: 'Đã phân phối', value: distributedCount });
  summarySheet.addRow({ info: 'Bảo trì', value: maintenanceCount });
  
  // Apply borders to all data cells
  summarySheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Danh_sach_tai_san_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export Classrooms
export const exportClassrooms = async (classrooms: Classroom[]): Promise<void> => {
  const workbook = setupWorkbook('Danh sách phòng học');
  
  // Create worksheet
  const worksheet = workbook.addWorksheet('Phòng học');
  
  // Define columns
  worksheet.columns = [
    { header: 'Mã phòng', key: 'id', width: 15 },
    { header: 'Tên phòng', key: 'name', width: 25 },
    { header: 'Sức chứa', key: 'capacity', width: 10 },
    { header: 'Vị trí', key: 'location', width: 20 },
    { header: 'Thiết bị', key: 'equipment', width: 40 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Mô tả', key: 'description', width: 40 },
  ];
  
  // Style header row
  styleHeaderRow(worksheet, worksheet.getRow(1));
  
  // Add data
  classrooms.forEach(classroom => {
    // Get status label
    const statusLabel = classroom.status === 'available' ? 'Có sẵn' :
                        classroom.status === 'occupied' ? 'Đang sử dụng' : 'Bảo trì';
    
    worksheet.addRow({
      id: classroom.id,
      name: classroom.name,
      capacity: classroom.capacity,
      location: classroom.location,
      equipment: classroom.equipment.join(', '),
      status: statusLabel,
      description: classroom.description || '',
    });
  });
  
  // Apply borders to all data cells
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Danh_sach_phong_hoc_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export Subjects
export const exportSubjects = async (subjects: Subject[]): Promise<void> => {
  const workbook = setupWorkbook('Danh sách môn học');
  
  // Create worksheet
  const worksheet = workbook.addWorksheet('Môn học');
  
  // Define columns
  worksheet.columns = [
    { header: 'Mã môn học', key: 'id', width: 15 },
    { header: 'Tên môn học', key: 'name', width: 25 },
    { header: 'Mã', key: 'code', width: 10 },
    { header: 'Màu sắc', key: 'color', width: 15 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Mô tả', key: 'description', width: 40 },
    { header: 'Ngày tạo', key: 'createdAt', width: 15 },
  ];
  
  // Style header row
  styleHeaderRow(worksheet, worksheet.getRow(1));
  
  // Add data
  subjects.forEach(subject => {
    // Get status label
    const statusLabel = subject.isActive ? 'Hoạt động' : 'Tạm dừng';
    
    worksheet.addRow({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      color: subject.color,
      status: statusLabel,
      description: subject.description || '',
      createdAt: formatDate(subject.createdAt),
    });
  });
  
  // Apply borders to all data cells
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Danh_sach_mon_hoc_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export Users
export const exportUsers = async (users: any[]): Promise<void> => {
  const workbook = setupWorkbook('Danh sách người dùng');
  
  // Create worksheet
  const worksheet = workbook.addWorksheet('Người dùng');
  
  // Define columns
  worksheet.columns = [
    { header: 'Mã người dùng', key: 'id', width: 15 },
    { header: 'Tên', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Vai trò', key: 'role', width: 15 },
    { header: 'Giới tính', key: 'gender', width: 10 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Đăng nhập cuối', key: 'lastLogin', width: 20 },
    { header: 'Ngày tạo', key: 'createdAt', width: 15 },
  ];
  
  // Style header row
  styleHeaderRow(worksheet, worksheet.getRow(1));
  
  // Add data
  users.forEach(user => {
    // Get role label
    const roleLabel = user.role === 'admin' ? 'Quản trị viên' :
                     user.role === 'manager' ? 'Quản sinh' : 'Giáo viên';
    
    // Get status label
    const statusLabel = user.isActive ? 'Hoạt động' : 'Bị khóa';
    
    // Get gender label
    const genderLabel = user.gender === 'male' ? 'Nam' :
                       user.gender === 'female' ? 'Nữ' : 'Khác';
    
    worksheet.addRow({
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleLabel,
      gender: genderLabel,
      status: statusLabel,
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : '',
      createdAt: formatDate(user.createdAt),
    });
  });
  
  // Apply borders to all data cells
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Danh_sach_nguoi_dung_${new Date().toISOString().split('T')[0]}.xlsx`);
};