export interface Farmer {
  id: string;
  phone: string;
  full_name: string;
  first_name: string;
  country: string;
  city: string;
  whatsapp_number: string;
  language: 'fr';
  created_at: string;
}

export interface Farm {
  id: string;
  farmer_id: string;
  name: string;
  flock_type: 'broiler' | 'layer' | 'mixed';
  current_count: number;
  total_capacity: number;
  location_city: string;
  is_active: boolean;
}

export interface FarmStats {
  total_birds: number;
  healthy_count: number;
  monitored_count: number;
  alerts_today: number;
  health_score: number;
  health_label: 'Excellent' | 'Bon' | 'Attention' | 'Critique';
  mortality_rate: number;
  stress_rate: number;
  activity_rate: number;
  last_sync_at: string;
}

export interface Camera {
  id: string;
  farm_id: string;
  name: string;
  zone: string;
  status: 'online' | 'offline' | 'error';
  last_seen_at: string;
  snapshot_url?: string;
}

export type AlertType =
  | 'mortality'
  | 'heat_stress'
  | 'inactivity'
  | 'cannibalism'
  | 'feeder_empty'
  | 'abnormal_movement';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  farm_id: string;
  camera_id: string;
  camera_name: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  confidence: number;
  description: string;
  advice: string;
  immediate_steps: string[];
  prevention_tip: string;
  snapshot_url: string;
  is_resolved: boolean;
  resolved_at?: string;
  whatsapp_sent: boolean;
  created_at: string;
}

export interface WeeklyActivity {
  day: string;
  healthy: number;
  monitored: number;
}

export interface MonthlyReport {
  id: string;
  farm_id: string;
  month: string;
  month_label: string;
  mortality_rate: number;
  alert_count: number;
  health_score_avg: number;
  avg_bird_count: number;
  trend: 'up' | 'stable' | 'down';
  pdf_url?: string;
  generated_at: string;
}

export interface Subscription {
  id: string;
  plan: 'free' | 'eleveur' | 'pro';
  status: 'active' | 'expired' | 'suspended' | 'trial';
  max_cameras: number;
  price_fcfa: number;
  expires_at: string;
  features: string[];
}

export interface Payment {
  id: string;
  amount_fcfa: number;
  method: 'mtn_momo' | 'orange_money' | 'airtel_money';
  status: 'completed' | 'pending' | 'failed';
  paid_at: string;
  receipt_url?: string;
}

export interface AuthState {
  farmer: Farmer | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface SeverityColors {
  text: string;
  bg: string;
  border: string;
}
