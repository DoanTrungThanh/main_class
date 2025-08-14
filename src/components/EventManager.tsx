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
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  X,
  Save,
  Download,
  FileSpreadsheet,
  UserPlus,
  UserMinus,
  Star,
  Building,
  UserCheck,
  Settings
} from 'lucide-react';
import { Event, BigEvent, EventVolunteer, EventGroup, EventSponsor } from '../types';
import * as XLSX from 'xlsx';

export default function EventManager() {
  const {
    events,
    bigEvents,
    students,
    addEvent,
    updateEvent,
    deleteEvent,
    addBigEvent,
    updateBigEvent,
    deleteBigEvent
  } = useData();
  const { user } = useAuth();
  const toast = useToastContext();

  // Event type selection
  const [eventType, setEventType] = useState<'student' | 'big'>('student');

  // Student events
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Big events
  const [showBigEventModal, setShowBigEventModal] = useState(false);
  const [editingBigEvent, setEditingBigEvent] = useState<BigEvent | null>(null);
  const [selectedBigEvent, setSelectedBigEvent] = useState<BigEvent | null>(null);

  // Big event management modals
  const [showVolunteersModal, setShowVolunteersModal] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [showSponsorsModal, setShowSponsorsModal] = useState(false);
  const [showReusableSponsorsModal, setShowReusableSponsorsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    maxParticipants: 50,
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
    participantIds: [] as string[],
  });

  const [studentSearchTerm, setStudentSearchTerm] = useState('');


  const [bigEventFormData, setBigEventFormData] = useState({
    name: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  });

  // Kiểm tra quyền dựa trên permissions thay vì role
  const userPermissions = user?.permissions || [];
  const userRole = user?.role;
  const canViewEvents = hasPermission(userPermissions, 'events.view', userRole);
  const canCreateEvents = hasPermission(userPermissions, 'events.create', userRole);
  const canEditEvents = hasPermission(userPermissions, 'events.edit', userRole);
  const canDeleteEvents = hasPermission(userPermissions, 'events.delete', userRole);
  const canManageEvents = canEditEvents || canDeleteEvents;

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      location: '',
      maxParticipants: 50,
      status: 'upcoming',
      participantIds: [],
    });
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const eventData = {
        ...formData,
        organizerId: user?.id || '',
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        toast.success('Cập nhật sự kiện thành công!');
      } else {
        await addEvent(eventData);
        toast.success('Tạo sự kiện thành công!');
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Có lỗi xảy ra khi lưu sự kiện!');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || '',
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || '',
      maxParticipants: event.maxParticipants || 50,
      status: event.status,
      participantIds: event.participantIds,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      try {
        console.log('Attempting to delete event with ID:', id);
        await deleteEvent(id);
        toast.success('Xóa sự kiện thành công!');
      } catch (error: any) {
        console.error('Error deleting event:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        toast.error(`Có lỗi xảy ra khi xóa sự kiện: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Sắp diễn ra';
      case 'ongoing': return 'Đang diễn ra';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const handleParticipantToggle = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(studentId)
        ? prev.participantIds.filter(id => id !== studentId)
        : [...prev.participantIds, studentId]
    }));
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Không tìm thấy';
  };

  const showParticipants = (event: Event) => {
    setSelectedEvent(event);
    setShowParticipantsModal(true);
  };

  const exportParticipants = (event: Event) => {
    const participantData = event.participantIds.map(studentId => {
      const student = students.find(s => s.id === studentId);
      return {
        'Tên học sinh': student?.name || '',
        'Ngày sinh': student ? new Date(student.birthDate).toLocaleDateString('vi-VN') : '',
        'Giới tính': student?.gender === 'male' ? 'Nam' : student?.gender === 'female' ? 'Nữ' : 'Khác',
        'Phụ huynh': student?.parentName || '',
        'Số điện thoại': student?.parentPhone || '',
        'Trạng thái': 'Đã đăng ký',
      };
    });

    const ws = XLSX.utils.json_to_sheet(participantData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách tham dự');

    const fileName = `Danh_sach_tham_du_${event.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast.success('Xuất danh sách thành công!');
  };

  // Lấy danh sách học sinh có thể tham gia (chỉ học sinh đang học)
  const getAvailableStudents = () => {
    return students.filter(student => student.status === 'active');
  };

  const availableStudents = getAvailableStudents();
  const filteredAvailableStudents = availableStudents.filter(s =>
    s.name.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  // Kiểm tra quyền xem sự kiện
  if (!canViewEvents) {
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sự kiện</h1>
          <p className="text-gray-600 mt-1">
            Tạo và quản lý các sự kiện, hoạt động của trường
          </p>
        </div>
        {canCreateEvents && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Tạo sự kiện học sinh
            </button>
            <button
              onClick={() => setShowBigEventModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              <Star size={20} />
              Tạo sự kiện lớn
            </button>
          </div>
        )}
      </div>

      {/* Event Type Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setEventType('student')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                eventType === 'student'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={16} />
                Sự kiện học sinh
              </div>
            </button>
            <button
              onClick={() => setEventType('big')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                eventType === 'big'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star size={16} />
                Sự kiện lớn
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {eventType === 'student' ? (
            // Student Events Content
            <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
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
            <option value="upcoming">Sắp diễn ra</option>
            <option value="ongoing">Đang diễn ra</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{event.name}</h3>
                {(canEditEvents || canDeleteEvents) && (
                  <div className="flex items-center gap-2">
                    {canEditEvents && (
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {canDeleteEvents && (
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {event.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span className="text-sm">
                    {new Date(event.eventDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span className="text-sm">{event.startTime} - {event.endTime}</span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span className="text-sm">{event.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={16} />
                  <span className="text-sm">
                    {event.participantIds.length}
                    {event.maxParticipants && ` / ${event.maxParticipants}`} người tham gia
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {getStatusLabel(event.status)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showParticipants(event)}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    title="Xem danh sách tham dự"
                  >
                    <User size={14} />
                    Danh sách
                  </button>

                  <button
                    onClick={() => exportParticipants(event)}
                    className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                    title="Tải danh sách tham dự"
                  >
                    <Download size={14} />
                    Tải
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Không tìm thấy sự kiện nào'
                : 'Chưa có sự kiện nào'}
            </p>
          </div>
        )}
            </div>
          ) : (
            // Big Events Content
            <div className="space-y-6">
              {/* Search and Filter for Big Events */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sự kiện lớn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="ongoing">Đang diễn ra</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              {/* Big Events List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bigEvents.length > 0 ? (
                  bigEvents
                    .filter(event => {
                      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                           (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                           (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
                      const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
                      return matchesSearch && matchesStatus;
                    })
                    .map((event) => (
                      <div key={event.id} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                              <Star size={24} className="text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(event.eventDate).toLocaleDateString('vi-VN')} • {event.startTime} - {event.endTime}
                              </p>
                            </div>
                          </div>
                          {canManageEvents && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingBigEvent(event);
                                  setBigEventFormData({
                                    name: event.name,
                                    description: event.description || '',
                                    eventDate: event.eventDate,
                                    startTime: event.startTime,
                                    endTime: event.endTime,
                                    location: event.location || '',
                                    status: event.status,
                                  });
                                  setShowBigEventModal(true);
                                }}
                                className="text-purple-600 hover:text-purple-700 p-1"
                                title="Chỉnh sửa"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
                                    try {
                                      await deleteBigEvent(event.id);
                                      toast.success('Xóa sự kiện thành công!');
                                    } catch (error) {
                                      toast.error('Có lỗi xảy ra khi xóa sự kiện!');
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 p-1"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-gray-700 mb-4 text-sm">{event.description}</p>
                        )}

                        {event.location && (
                          <div className="flex items-center gap-2 mb-4">
                            <MapPin size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-600">{event.location}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-purple-700">
                              {event.eventVolunteers?.length || 0}
                            </div>
                            <div className="text-xs text-purple-600">Tình nguyện viên</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-purple-700">
                              {event.eventGroups?.length || 0}
                            </div>
                            <div className="text-xs text-purple-600">Ban tổ chức</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-purple-700">
                              {event.sponsors?.length || 0}
                            </div>
                            <div className="text-xs text-purple-600">Mạnh thường quân</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {getStatusLabel(event.status)}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedBigEvent(event);
                                setShowVolunteersModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                              title="Quản lý tình nguyện viên"
                            >
                              <UserCheck size={14} />
                              TNV
                            </button>

                            <button
                              onClick={() => {
                                setSelectedBigEvent(event);
                                setShowGroupsModal(true);
                              }}
                              className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                              title="Quản lý ban tổ chức"
                            >
                              <Users size={14} />
                              Ban
                            </button>

                            <button
                              onClick={() => {
                                setSelectedBigEvent(event);
                                setShowSponsorsModal(true);
                              }}
                              className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
                              title="Quản lý mạnh thường quân"
                            >
                              <Building size={14} />
                              MTC
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <Star className="mx-auto mb-4 text-purple-300" size={64} />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có sự kiện lớn nào</h3>
                    <p className="text-gray-600 mb-6">
                      Tạo sự kiện lớn đầu tiên để bắt đầu quản lý tình nguyện viên và mạnh thường quân
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal tạo/sửa sự kiện học sinh */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sự kiện *
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
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="ongoing">Đang diễn ra</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết về sự kiện..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày tổ chức *
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ bắt đầu *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ kết thúc *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa điểm
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Địa điểm tổ chức sự kiện"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng tối đa
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    placeholder="Số lượng người tham gia tối đa"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn học sinh tham gia ({formData.participantIds.length} học sinh)
                </label>

                <div className="border border-gray-300 rounded-lg">
                  <div className="p-2 border-b bg-gray-50 sticky top-0 z-10">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        placeholder="Tìm nhanh theo tên học sinh..."
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div className="p-2 max-h-56 overflow-y-auto">
                    {filteredAvailableStudents.length > 0 ? (
                      <div className="space-y-1.5">
                        {filteredAvailableStudents.map((student) => (
                          <label key={student.id} className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.participantIds.includes(student.id)}
                              onChange={() => handleParticipantToggle(student.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 leading-5">{student.name}</p>
                              <p className="text-xs text-gray-600">
                                {new Date(student.birthDate).toLocaleDateString('vi-VN')} • {student.parentName}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4 text-sm">
                        {studentSearchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Không có học sinh khả dụng'}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Chỉ hiển thị học sinh đang học
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
                  {editingEvent ? 'Cập nhật' : 'Tạo sự kiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal danh sách tham dự */}
      {showParticipantsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Danh sách tham dự: {selectedEvent.name}
              </h2>
              <button
                onClick={() => {
                  setShowParticipantsModal(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Tổng số: {selectedEvent.participantIds.length} người tham gia
                </p>
                <button
                  onClick={() => exportParticipants(selectedEvent)}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  <FileSpreadsheet size={16} />
                  Xuất Excel
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {selectedEvent.participantIds.length > 0 ? (
                selectedEvent.participantIds.map((studentId, index) => {
                  const student = students.find(s => s.id === studentId);
                  if (!student) return null;

                  return (
                    <div key={studentId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(student.birthDate).toLocaleDateString('vi-VN')} - {student.parentName}
                        </p>
                        <p className="text-sm text-gray-600">{student.parentPhone}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Đã đăng ký
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-gray-500">Chưa có học sinh nào tham gia</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo sự kiện lớn */}
      {showBigEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="text-purple-600" size={24} />
                {editingBigEvent ? 'Chỉnh sửa sự kiện lớn' : 'Tạo sự kiện lớn mới'}
              </h2>
              <button
                onClick={() => {
                  setShowBigEventModal(false);
                  setEditingBigEvent(null);
                  setBigEventFormData({
                    name: '',
                    description: '',
                    eventDate: '',
                    startTime: '',
                    endTime: '',
                    location: '',
                    status: 'upcoming',
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const eventData = {
                  ...bigEventFormData,
                  organizerId: user?.id || '',
                };

                if (editingBigEvent) {
                  await updateBigEvent(editingBigEvent.id, eventData);
                  toast.success('Cập nhật sự kiện lớn thành công!');
                } else {
                  await addBigEvent(eventData);
                  toast.success('Tạo sự kiện lớn thành công!');
                }

                setShowBigEventModal(false);
                setBigEventFormData({
                  name: '',
                  description: '',
                  eventDate: '',
                  startTime: '',
                  endTime: '',
                  location: '',
                  status: 'upcoming',
                });
                setEditingBigEvent(null);
              } catch (error) {
                console.error('Error saving big event:', error);
                toast.error('Có lỗi xảy ra khi lưu sự kiện lớn!');
              }
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sự kiện *
                  </label>
                  <input
                    type="text"
                    value={bigEventFormData.name}
                    onChange={(e) => setBigEventFormData({ ...bigEventFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={bigEventFormData.status}
                    onChange={(e) => setBigEventFormData({ ...bigEventFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="ongoing">Đang diễn ra</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={bigEventFormData.description}
                  onChange={(e) => setBigEventFormData({ ...bigEventFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết về sự kiện..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày tổ chức *
                  </label>
                  <input
                    type="date"
                    value={bigEventFormData.eventDate}
                    onChange={(e) => setBigEventFormData({ ...bigEventFormData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ bắt đầu *
                  </label>
                  <input
                    type="time"
                    value={bigEventFormData.startTime}
                    onChange={(e) => setBigEventFormData({ ...bigEventFormData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ kết thúc *
                  </label>
                  <input
                    type="time"
                    value={bigEventFormData.endTime}
                    onChange={(e) => setBigEventFormData({ ...bigEventFormData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={bigEventFormData.location}
                  onChange={(e) => setBigEventFormData({ ...bigEventFormData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Địa điểm tổ chức sự kiện..."
                />
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-medium text-purple-900 mb-2">Các chức năng sẽ có sau khi tạo:</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Quản lý danh sách tình nguyện viên riêng cho sự kiện</li>
                  <li>• Tạo các ban tổ chức và phân công nhiệm vụ</li>
                  <li>• Quản lý danh sách mạnh thường quân và nhà tài trợ</li>
                  <li>• Tích hợp với tài khoản người dùng hiện có</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBigEventModal(false);
                    setEditingBigEvent(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingBigEvent ? 'Cập nhật' : 'Tạo sự kiện lớn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal quản lý tình nguyện viên */}
      {showVolunteersModal && selectedBigEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserCheck className="text-blue-600" size={24} />
                Quản lý tình nguyện viên: {selectedBigEvent.name}
              </h2>
              <button
                onClick={() => {
                  setShowVolunteersModal(false);
                  setSelectedBigEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center py-12">
              <UserCheck className="mx-auto mb-4 text-blue-300" size={64} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quản lý tình nguyện viên</h3>
              <p className="text-gray-600 mb-4">
                Tính năng đang được phát triển...
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 max-w-md mx-auto">
                <h4 className="font-medium text-blue-900 mb-2">Các tính năng sẽ có:</h4>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Thêm tình nguyện viên mới cho sự kiện</li>
                  <li>• Liên kết với tài khoản người dùng hiện có</li>
                  <li>• Phân công vai trò và nhiệm vụ</li>
                  <li>• Xuất danh sách tình nguyện viên</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal quản lý ban tổ chức */}
      {showGroupsModal && selectedBigEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-green-600" size={24} />
                Quản lý ban tổ chức: {selectedBigEvent.name}
              </h2>
              <button
                onClick={() => {
                  setShowGroupsModal(false);
                  setSelectedBigEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center py-12">
              <Users className="mx-auto mb-4 text-green-300" size={64} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quản lý ban tổ chức</h3>
              <p className="text-gray-600 mb-4">
                Tính năng đang được phát triển...
              </p>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 max-w-md mx-auto">
                <h4 className="font-medium text-green-900 mb-2">Các tính năng sẽ có:</h4>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• Tạo các ban/nhóm công việc</li>
                  <li>• Phân công tình nguyện viên vào ban</li>
                  <li>• Chỉ định trưởng ban</li>
                  <li>• Quản lý nhiệm vụ từng ban</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal quản lý mạnh thường quân */}
      {showSponsorsModal && selectedBigEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Building className="text-purple-600" size={24} />
                Quản lý mạnh thường quân: {selectedBigEvent.name}
              </h2>
              <button
                onClick={() => {
                  setShowSponsorsModal(false);
                  setSelectedBigEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center py-12">
              <Building className="mx-auto mb-4 text-purple-300" size={64} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quản lý mạnh thường quân</h3>
              <p className="text-gray-600 mb-4">
                Tính năng đang được phát triển...
              </p>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 max-w-md mx-auto">
                <h4 className="font-medium text-purple-900 mb-2">Các tính năng sẽ có:</h4>
                <ul className="text-sm text-purple-700 space-y-1 text-left">
                  <li>• Thêm mạnh thường quân cho sự kiện</li>
                  <li>• Sử dụng danh sách mạnh thường quân chung</li>
                  <li>• Quản lý thông tin liên hệ</li>
                  <li>• Theo dõi mức độ tài trợ</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowReusableSponsorsModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
              >
                <Building size={16} />
                Xem danh sách mạnh thường quân chung
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal danh sách mạnh thường quân chung */}
      {showReusableSponsorsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Building className="text-orange-600" size={24} />
                Danh sách mạnh thường quân chung
              </h2>
              <button
                onClick={() => setShowReusableSponsorsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center py-12">
              <Building className="mx-auto mb-4 text-orange-300" size={64} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Danh sách mạnh thường quân chung</h3>
              <p className="text-gray-600 mb-4">
                Tính năng đang được phát triển...
              </p>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 max-w-md mx-auto">
                <h4 className="font-medium text-orange-900 mb-2">Các tính năng sẽ có:</h4>
                <ul className="text-sm text-orange-700 space-y-1 text-left">
                  <li>• Danh sách mạnh thường quân có thể tái sử dụng</li>
                  <li>• Thêm/sửa/xóa mạnh thường quân chung</li>
                  <li>• Sao chép vào sự kiện cụ thể</li>
                  <li>• Lịch sử tài trợ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
