export interface Farmer {
  id: string;
  phone: string;
  full_name: string;
  country: string;
  city: string;
  whatsapp_number: string;
  is_active: boolean;
  created_at: string;
  subscription?: Subscription;
  farms_count?: number;
  cameras_count?: number;
  last_alert_at?: string;
}

export interface Subscription {
  id: string;
  farmer_id: string;
  plan: 'free' | 'eleveur' | 'pro' | 'cooperative';
  status: 'active' | 'expired' | 'suspended' | 'trial';
  max_cameras: number;
  price_fcfa: number;
  started_at: string;
  expires_at: string;
}

export interface Alert {
  id: string;
  camera_id: string;
  farm_id: string;
  farmer_id: string;
  farmer_name: string;
  farm_name: string;
  alert_type:
    | 'mortality'
    | 'heat_stress'
    | 'inactivity'
    | 'cannibalism'
    | 'feeder_empty'
    | 'abnormal_movement';
  severity: 'critical' | 'warning' | 'info';
  confidence: number;
  description: string;
  snapshot_url: string;
  is_resolved: boolean;
  resolved_at?: string;
  whatsapp_sent: boolean;
  sms_sent: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_farmers: number;
  farmers_growth: number;
  active_alerts: number;
  critical_alerts: number;
  mrr_fcfa: number;
  mrr_growth: number;
  ai_accuracy: number;
  farmers_online: number;
}

export interface Payment {
  id: string;
  farmer_id: string;
  amount_fcfa: number;
  method: 'mtn_momo' | 'orange_money' | 'airtel_money' | 'virement';
  status: 'pending' | 'completed' | 'failed';
  paid_at: string;
  created_at: string;
}

export interface FarmerGrowthPoint {
  month: string;
  count: number;
}

export interface AlertWeekData {
  week: string;
  mortality: number;
  heat_stress: number;
  inactivity: number;
  cannibalism: number;
}

export interface PlanDistribution {
  plan: string;
  count: number;
  color: string;
}

export interface AIModelMetric {
  type: string;
  accuracy: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}
