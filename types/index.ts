export interface Company {
  id: string
  name: string
  fmd_budget_per_year: number
  employee_count: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: 'admin' | 'employee'
  super_admin: boolean
  company_id: string | null
  account_type: 'b2c' | 'b2b2c'
  created_at: string
}

export interface CompanyConfig {
  company_id: string
  key: string
  value: string
  description: string | null
  updated_at: string
}

export interface AppConfig {
  key: string
  value: string
  description: string | null
  updated_at: string
}

export interface CompanyStats {
  company_id: string
  company_name: string
  user_count: number
  total_trips: number
  total_km: number
  total_co2: number
  total_points: number
}

export interface Reward {
  id: string
  partner_name: string
  point_cost: number
  description: string | null
  stock_quantity: number
  image_url: string | null
  is_active: boolean
  priority: number
  min_points_required: number
  created_at: string
}
