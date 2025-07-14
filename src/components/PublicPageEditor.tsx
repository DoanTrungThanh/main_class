import React, { useState, useEffect } from 'react';
import { useToastContext } from '../context/ToastContext';
import { publicPageSettingsService, PublicPageSettings } from '../lib/publicPageSettingsService';
import {
  Save,
  Eye,
  Edit3,
  Image,
  Type,
  Palette,
  Settings,
  RefreshCw,
} from 'lucide-react';



export default function PublicPageEditor() {
  const toast = useToastContext();
  const [settings, setSettings] = useState<PublicPageSettings | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);



  // Load settings from Supabase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const loadedSettings = await publicPageSettingsService.getSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Có lỗi xảy ra khi tải cài đặt!');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      await publicPageSettingsService.saveSettings(settings);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('publicPageSettingsChanged'));
      toast.success('Đã lưu cài đặt trang chủ!');
    } catch (error) {
      console.error('Error saving settings:', error);
      // Since we modified the service to not throw errors, this should rarely happen
      toast.error('Có lỗi xảy ra khi lưu cài đặt!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsSaving(true);
      await publicPageSettingsService.resetSettings();
      const defaultSettings = await publicPageSettingsService.getSettings();
      setSettings(defaultSettings);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('publicPageSettingsChanged'));
      toast.success('Đã khôi phục cài đặt mặc định!');
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Có lỗi xảy ra khi khôi phục cài đặt!');
    } finally {
      setIsSaving(false);
    }
  };

  const updateGalleryItem = (index: number, field: 'title' | 'description' | 'image', value: string) => {
    if (!settings) return;
    const newGallery = [...settings.gallery];
    newGallery[index][field] = value;
    setSettings({ ...settings, gallery: newGallery });
  };

  // Show loading state
  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải cài đặt...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa trang chủ</h1>
            <p className="text-gray-600">Tùy chỉnh nội dung hiển thị trên trang chủ công khai</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <Eye size={16} />
              {isPreview ? 'Chỉnh sửa' : 'Xem trước'}
            </button>
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <RefreshCw size={16} />
              )}
              Khôi phục
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={16} />
              )}
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      {!isPreview ? (
        <>
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'general', label: 'Thông tin chung', icon: Type },
                  { id: 'gallery', label: 'Hình ảnh', icon: Image },
                  { id: 'contact', label: 'Liên hệ', icon: Settings },
                  { id: 'colors', label: 'Màu sắc', icon: Palette },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên trung tâm
                    </label>
                    <input
                      type="text"
                      value={settings.centerName}
                      onChange={(e) => setSettings({ ...settings, centerName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slogan
                    </label>
                    <input
                      type="text"
                      value={settings.centerSlogan}
                      onChange={(e) => setSettings({ ...settings, centerSlogan: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả trung tâm
                    </label>
                    <textarea
                      value={settings.centerDescription}
                      onChange={(e) => setSettings({ ...settings, centerDescription: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Gallery Tab */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Quản lý hình ảnh trung tâm</h3>
                    <p className="text-gray-600 mb-6">Chỉnh sửa hình ảnh hiển thị trên trang chủ</p>
                  </div>

                  {settings.gallery && settings.gallery.length > 0 ? (
                    settings.gallery.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-4">Hình ảnh {index + 1}</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tiêu đề
                            </label>
                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => updateGalleryItem(index, 'title', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mô tả
                            </label>
                            <textarea
                              value={item.description || ''}
                              onChange={(e) => updateGalleryItem(index, 'description', e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL hình ảnh
                            </label>
                            <input
                              type="url"
                              value={item.image || ''}
                              onChange={(e) => updateGalleryItem(index, 'image', e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {item.image && (
                              <div className="mt-2">
                                <img
                                  src={item.image}
                                  alt={item.title || 'Gallery image'}
                                  className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.currentTarget.src = `https://via.placeholder.com/128x96/e5e7eb/6b7280?text=Error`;
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Không có hình ảnh nào. Nhấn "Khôi phục" để tạo dữ liệu mặc định.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={settings.contactInfo.address}
                      onChange={(e) => setSettings({
                        ...settings,
                        contactInfo: { ...settings.contactInfo, address: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={settings.contactInfo.phone}
                      onChange={(e) => setSettings({
                        ...settings,
                        contactInfo: { ...settings.contactInfo, phone: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.contactInfo.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        contactInfo: { ...settings.contactInfo, email: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ làm việc
                    </label>
                    <input
                      type="text"
                      value={settings.contactInfo.workingHours}
                      onChange={(e) => setSettings({
                        ...settings,
                        contactInfo: { ...settings.contactInfo, workingHours: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Colors Tab */}
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Màu chính
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.colors.primary}
                        onChange={(e) => setSettings({
                          ...settings,
                          colors: { ...settings.colors, primary: e.target.value }
                        })}
                        className="w-12 h-12 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={settings.colors.primary}
                        onChange={(e) => setSettings({
                          ...settings,
                          colors: { ...settings.colors, primary: e.target.value }
                        })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Màu phụ
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.colors.secondary}
                        onChange={(e) => setSettings({
                          ...settings,
                          colors: { ...settings.colors, secondary: e.target.value }
                        })}
                        className="w-12 h-12 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={settings.colors.secondary}
                        onChange={(e) => setSettings({
                          ...settings,
                          colors: { ...settings.colors, secondary: e.target.value }
                        })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Màu nhấn
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.colors.accent}
                        onChange={(e) => setSettings({
                          ...settings,
                          colors: { ...settings.colors, accent: e.target.value }
                        })}
                        className="w-12 h-12 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={settings.colors.accent}
                        onChange={(e) => setSettings({
                          ...settings,
                          colors: { ...settings.colors, accent: e.target.value }
                        })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xem trước trang chủ</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Preview Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: settings.colors.primary }}>
                    <div className="w-6 h-6 bg-white rounded"></div>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">{settings.centerName}</h1>
                    <p className="text-xs text-gray-600">{settings.centerSlogan}</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                  Đăng nhập
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-6 bg-gray-50">
              {/* Stats Section */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Thống kê trung tâm</h2>
                <p className="text-gray-600 text-sm">{settings.centerDescription}</p>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Tổng số lớp học', value: '5', color: 'blue' },
                  { label: 'Tổng học viên', value: '59', color: 'green' },
                  { label: 'Học viên đang học', value: '46', color: 'purple' },
                  { label: 'Giờ học mỗi tuần', value: '125', color: 'orange' }
                ].map((stat, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg text-center">
                    <div className={`text-lg font-bold text-${stat.color}-600`}>{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Gallery Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Hình ảnh trung tâm
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {settings.gallery.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden">
                      <div className="h-20 bg-gray-200">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/200x80/e5e7eb/6b7280?text=${encodeURIComponent(item.title)}`;
                          }}
                        />
                      </div>
                      <div className="p-2">
                        <h4 className="font-medium text-gray-900 text-xs mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Section */}
              <div className="bg-white p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                  Liên hệ với chúng tôi
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-900">Địa chỉ</div>
                    <div className="text-gray-600">{settings.contactInfo.address}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Điện thoại</div>
                    <div className="text-gray-600">{settings.contactInfo.phone}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-gray-600">{settings.contactInfo.email}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Giờ làm việc</div>
                    <div className="text-gray-600">{settings.contactInfo.workingHours}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
