-- Database setup script for Class Inventory Management System
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create inventory_categories table
CREATE TABLE IF NOT EXISTS inventory_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_inventory table
CREATE TABLE IF NOT EXISTS class_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_categories_name ON inventory_categories(name);
CREATE INDEX IF NOT EXISTS idx_class_inventory_category_id ON class_inventory(category_id);
CREATE INDEX IF NOT EXISTS idx_class_inventory_title ON class_inventory(title);

-- Insert sample categories
INSERT INTO inventory_categories (name, description, color, created_by) VALUES
('Văn phòng phẩm', 'Bút, giấy, tẩy, thước kẻ và các dụng cụ học tập cơ bản', '#3B82F6', NULL),
('Đồ chơi giáo dục', 'Đồ chơi hỗ trợ học tập và phát triển tư duy', '#10B981', NULL),
('Thiết bị điện tử', 'Máy tính, máy chiếu, loa và các thiết bị công nghệ', '#8B5CF6', NULL),
('Sách và tài liệu', 'Sách giáo khoa, sách tham khảo và tài liệu học tập', '#F59E0B', NULL),
('Đồ dùng thể thao', 'Bóng đá, bóng rổ, dụng cụ thể dục thể thao', '#EF4444', NULL),
('Vật liệu thí nghiệm', 'Dụng cụ và hóa chất cho các thí nghiệm khoa học', '#EC4899', NULL),
('Đồ dùng y tế', 'Thuốc, băng gạc, dụng cụ y tế cơ bản', '#06B6D4', NULL),
('Đồ nội thất', 'Bàn, ghế, tủ và các đồ nội thất lớp học', '#84CC16', NULL)
ON CONFLICT (name) DO NOTHING;

-- Insert sample inventory items (only if they don't exist)
DO $$
BEGIN
  -- Insert Bút chì 2B
  IF NOT EXISTS (SELECT 1 FROM class_inventory WHERE title = 'Bút chì 2B') THEN
    INSERT INTO class_inventory (title, quantity, category_id, description, created_by)
    SELECT 'Bút chì 2B', 50, c.id, 'Bút chì 2B chất lượng cao cho học sinh', NULL
    FROM inventory_categories c WHERE c.name = 'Văn phòng phẩm';
  END IF;

  -- Insert Tẩy trắng
  IF NOT EXISTS (SELECT 1 FROM class_inventory WHERE title = 'Tẩy trắng') THEN
    INSERT INTO class_inventory (title, quantity, category_id, description, created_by)
    SELECT 'Tẩy trắng', 30, c.id, 'Tẩy trắng không độc hại', NULL
    FROM inventory_categories c WHERE c.name = 'Văn phòng phẩm';
  END IF;

  -- Insert Vở ô li
  IF NOT EXISTS (SELECT 1 FROM class_inventory WHERE title = 'Vở ô li 200 trang') THEN
    INSERT INTO class_inventory (title, quantity, category_id, description, created_by)
    SELECT 'Vở ô li 200 trang', 25, c.id, 'Vở ô li 200 trang chất lượng tốt', NULL
    FROM inventory_categories c WHERE c.name = 'Văn phòng phẩm';
  END IF;

  -- Insert Bộ xếp hình gỗ
  IF NOT EXISTS (SELECT 1 FROM class_inventory WHERE title = 'Bộ xếp hình gỗ') THEN
    INSERT INTO class_inventory (title, quantity, category_id, description, created_by)
    SELECT 'Bộ xếp hình gỗ', 15, c.id, 'Bộ xếp hình gỗ phát triển tư duy logic', NULL
    FROM inventory_categories c WHERE c.name = 'Đồ chơi giáo dục';
  END IF;

  -- Insert Máy chiếu mini
  IF NOT EXISTS (SELECT 1 FROM class_inventory WHERE title = 'Máy chiếu mini') THEN
    INSERT INTO class_inventory (title, quantity, category_id, description, created_by)
    SELECT 'Máy chiếu mini', 2, c.id, 'Máy chiếu mini cho lớp học', NULL
    FROM inventory_categories c WHERE c.name = 'Thiết bị điện tử';
  END IF;
END $$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_inventory_categories_updated_at 
    BEFORE UPDATE ON inventory_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_inventory_updated_at 
    BEFORE UPDATE ON class_inventory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_inventory ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory_categories
CREATE POLICY "Allow read access to inventory_categories" ON inventory_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to inventory_categories" ON inventory_categories
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to inventory_categories" ON inventory_categories
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete access to inventory_categories" ON inventory_categories
    FOR DELETE USING (true);

-- Create policies for class_inventory
CREATE POLICY "Allow read access to class_inventory" ON class_inventory
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to class_inventory" ON class_inventory
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to class_inventory" ON class_inventory
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete access to class_inventory" ON class_inventory
    FOR DELETE USING (true);

-- Grant permissions (adjust as needed based on your auth setup)
GRANT ALL ON inventory_categories TO authenticated;
GRANT ALL ON class_inventory TO authenticated;
GRANT ALL ON inventory_categories TO anon;
GRANT ALL ON class_inventory TO anon;

-- Create views for easier querying
CREATE OR REPLACE VIEW inventory_with_categories AS
SELECT 
    i.id,
    i.title,
    i.quantity,
    i.description as item_description,
    i.created_at,
    i.updated_at,
    c.id as category_id,
    c.name as category_name,
    c.description as category_description,
    c.color as category_color
FROM class_inventory i
LEFT JOIN inventory_categories c ON i.category_id = c.id
ORDER BY i.created_at DESC;

-- Grant access to the view
GRANT SELECT ON inventory_with_categories TO authenticated;
GRANT SELECT ON inventory_with_categories TO anon;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Tables created: inventory_categories, class_inventory';
    RAISE NOTICE 'Sample data inserted';
    RAISE NOTICE 'Triggers and policies configured';
END $$;
