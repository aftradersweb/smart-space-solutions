
export interface StorageType {
  id: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  price_per_sqm_month: number;
  min_area?: number;
  min_duration_months?: number;
  icon_name?: string;
  billing_unit?: 'sqm' | 'sqft' | 'cbm' | 'box' | 'shelf' | 'pallet' | 'unit';
  unit_name_en?: string;
  unit_name_ar?: string;
  slug?: string;
  measurement_config?: Record<string, unknown>;
  use_cases?: string[];
  pricing_factors?: string[];
}

export interface Profile {
  id: string;
  full_name: string;
  company_name?: string;
  email: string;
  phone: string;
  user_type: 'individual' | 'company' | 'admin';
  role?: 'admin' | 'user';
  nationality?: string;
  gender?: string;
  id_number?: string;
  owner_name?: string;
  commercial_reg?: string;
  created_at: string;
}

export interface Order {
  id: string;
  created_at: string;
  status: 'under_review' | 'approved' | 'active' | 'completed' | 'rejected' | 'available' | 'almost_full' | 'full' | 'stored' | 'in_transit' | 'paid' | 'pending';
  area: number;
  duration_months: number;
  total_price: number;
  notes?: string;
  measurement_data?: Record<string, unknown>;
  storage_type_id: string;
  user_id: string;
  product_name?: string;
  product_type?: string;
  quantity?: number;
  weight?: string;
  pickup_address?: string;
  delivery_address?: string;
  product_images?: string[];
  profiles?: {
    full_name: string;
    company_name: string;
    user_type: string;
  } | null;
  storage_types?: {
    name_en: string;
    name_ar: string;
    billing_unit?: string;
    unit_name_en?: string;
    unit_name_ar?: string;
  } | null;
  extras?: string[];
}

export interface StorageSpace {
  id: string;
  name_en: string;
  name_ar: string;
  storage_type_id: string;
  capacity: number;
  used_capacity: number;
  capacity_units?: number;
  used_units?: number;
  status: string;
  is_active: boolean;
}

export interface Configuration {
  key: string;
  value: unknown;
}

export interface Invoice {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface ProductType {
  id: string;
  name_en: string;
  name_ar: string;
  is_active: boolean;
  created_at?: string;
}

export interface Service {
  id: string;
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
  price: number;
  icon_name?: string;
  is_active: boolean;
  created_at?: string;
}

export interface FAQ {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  category?: string;
  is_active: boolean;
  created_at?: string;
}

export interface ContentPage {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  content_en: string;
  content_ar: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
