import { supabase } from './supabase';

export interface PublicPageSettings {
  centerName: string;
  centerSlogan: string;
  centerDescription: string;
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    workingHours: string;
  };
  gallery: {
    title: string;
    description: string;
    image: string;
  }[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const DEFAULT_SETTINGS: PublicPageSettings = {
  centerName: 'Trung tâm học tập ABC',
  centerSlogan: 'Nơi khởi nguồn tri thức',
  centerDescription: 'Chúng tôi cam kết mang đến chất lượng giáo dục tốt nhất, giúp học viên phát triển toàn diện và đạt được mục tiêu học tập.',
  contactInfo: {
    address: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
    phone: '0123 456 789',
    email: 'info@trungtamabc.edu.vn',
    workingHours: 'Thứ 2 - Chủ nhật: 7:00 - 21:00',
  },
  gallery: [
    {
      title: 'Phòng học hiện đại',
      description: 'Không gian học tập thoải mái với trang thiết bị hiện đại',
      image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop'
    },
    {
      title: 'Thư viện đầy đủ',
      description: 'Kho tàng sách vở phong phú phục vụ học tập và nghiên cứu',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
    },
    {
      title: 'Phòng thí nghiệm',
      description: 'Trang thiết bị thí nghiệm đầy đủ cho các môn khoa học',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop'
    },
  ],
  colors: {
    primary: '#2563eb',
    secondary: '#7c3aed',
    accent: '#059669',
  },
};

const SETTINGS_ID = 'main-settings'; // Fixed ID for singleton settings

export const publicPageSettingsService = {
  // Get settings from Supabase
  async getSettings(): Promise<PublicPageSettings> {
    try {
      const { data, error } = await supabase
        .from('public_page_settings')
        .select('*')
        .eq('id', SETTINGS_ID)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, return default settings
          return DEFAULT_SETTINGS;
        }
        throw error;
      }

      if (!data) {
        return DEFAULT_SETTINGS;
      }

      // Transform database format to app format
      return {
        centerName: data.center_name,
        centerSlogan: data.center_slogan,
        centerDescription: data.center_description,
        contactInfo: data.contact_info,
        gallery: data.gallery,
        colors: data.colors,
      };
    } catch (error) {
      console.error('Error fetching public page settings:', error);
      // Fallback to localStorage if Supabase fails
      const savedSettings = localStorage.getItem('publicPageSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            gallery: parsed.gallery || DEFAULT_SETTINGS.gallery,
            contactInfo: { ...DEFAULT_SETTINGS.contactInfo, ...parsed.contactInfo },
            colors: { ...DEFAULT_SETTINGS.colors, ...parsed.colors },
          };
        } catch (parseError) {
          console.error('Error parsing localStorage settings:', parseError);
        }
      }
      return DEFAULT_SETTINGS;
    }
  },

  // Save settings to Supabase
  async saveSettings(settings: PublicPageSettings): Promise<void> {
    // Always save to localStorage first as backup
    localStorage.setItem('publicPageSettings', JSON.stringify(settings));

    try {
      // Transform app format to database format
      const dbData = {
        id: SETTINGS_ID,
        center_name: settings.centerName,
        center_slogan: settings.centerSlogan,
        center_description: settings.centerDescription,
        contact_info: settings.contactInfo,
        gallery: settings.gallery,
        colors: settings.colors,
        updated_at: new Date().toISOString(),
      };

      // Try to save to Supabase without authentication check for now
      const { error } = await supabase
        .from('public_page_settings')
        .upsert(dbData, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase save failed, using localStorage only:', error.message);
        // Don't throw error, just log it since we already saved to localStorage
        return;
      }

      console.log('Settings saved to Supabase successfully');
    } catch (error) {
      console.warn('Error saving to Supabase, using localStorage only:', error);
      // Don't throw error since localStorage save succeeded
    }
  },

  // Reset to default settings
  async resetSettings(): Promise<void> {
    // Always remove from localStorage first
    localStorage.removeItem('publicPageSettings');

    try {
      // Try to reset in Supabase without authentication check for now
      const { error } = await supabase
        .from('public_page_settings')
        .delete()
        .eq('id', SETTINGS_ID);

      if (error) {
        console.warn('Supabase reset failed, using localStorage only:', error.message);
        // Don't throw error since localStorage was already cleared
        return;
      }

      console.log('Settings reset in Supabase successfully');
    } catch (error) {
      console.warn('Error resetting in Supabase, using localStorage only:', error);
      // Don't throw error since localStorage reset succeeded
    }
  },
};
