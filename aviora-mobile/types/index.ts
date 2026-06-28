export interface User {
  id: string;
  phone?: string;
  email?: string;
  full_name: string;
  first_name: string;
  country: string;
  language: string;
  city?: string;
  whatsapp_number?: string;
  photo_url?: string;
  created_at: string;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertType =
  | 'mortality'
  | 'heat_stress'
  | 'inactivity'
  | 'feeder_empty'
  | 'abnormal_movement'
  | 'cannibalism'
  | 'disease'
  | 'other';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  confidence: number;
  description: string;
  advice: string;
  immediateSteps: string[];
  preventionTip: string;
  farmName: string;
  cameraName: string;
  isResolved: boolean;
  whatsappSent: boolean;
  createdAt: string;
  resolvedAt?: string;
  snapshotUri?: string;
}

export interface FarmStats {
  totalBirds: number;
  healthyCount: number;
  sickCount: number;
  inactiveCount: number;
  alertsToday: number;
  healthScore: number;
  healthLabel: string;
  mortalityRate: number;
  stressRate: number;
  activityRate: number;
  lastSyncAt: string;
}

export interface WeeklyActivity {
  day: string;
  healthy: number;
  sick: number;
  inactive: number;
}

export type CameraStatusValue = 'active' | 'inactive' | 'error';

export interface CameraStatus {
  id: string;
  name: string;
  status: CameraStatusValue;
  isRecording: boolean;
  fps: number;
  resolution: string;
  streamUrl?: string;
  lastSeenAt?: string;
}

export interface DetectionBox {
  id: number;
  type: 'healthy' | 'sick' | 'feeder' | 'drinker';
  confidence: number;
  label: string;
  bbox: { x: number; y: number; width: number; height: number };
}

export interface Report {
  id: string;
  title: string;
  period: string;
  createdAt: string;
  fileUrl?: string;
}

export type ReportTrend = 'up' | 'stable' | 'down';

export interface MonthlyReport {
  id: string;
  month: string;
  year: number;
  month_label: string;
  title: string;
  avg_bird_count: number;
  alert_count: number;
  health_score_avg: number;
  mortality_rate: number;
  trend: ReportTrend;
  createdAt: string;
  pdf_url?: string;
}
