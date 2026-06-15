export interface DetectionBox {
  id: number;
  type: 'healthy' | 'sick' | 'inactive' | 'dead';
  confidence: number;
  label: string;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FarmStats {
  totalBirds: number;
  healthyCount: number;
  sickCount: number;
  inactiveCount: number;
  alertsToday: number;
  healthScore: number;
  healthLabel: 'Excellent' | 'Bon' | 'Attention' | 'Critique';
  mortalityRate: number;
  stressRate: number;
  activityRate: number;
  lastSyncAt: string;
}

export interface Alert {
  id: string;
  type: 'mortality' | 'heat_stress' | 'inactivity' | 'cannibalism' | 'feeder_empty' | 'abnormal_movement';
  severity: 'critical' | 'warning' | 'info';
  confidence: number;
  description: string;
  advice: string;
  immediateSteps: string[];
  preventionTip: string;
  snapshotUri?: string;
  farmName: string;
  cameraName: string;
  isResolved: boolean;
  whatsappSent: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface WeeklyActivity {
  day: string;
  healthy: number;
  sick: number;
  inactive: number;
}

export interface CameraStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  isRecording: boolean;
  fps: number;
  resolution: string;
}

export interface AIDetectionResult {
  boxes: DetectionBox[];
  frameTimestamp: number;
  processingTimeMs: number;
  totalDetected: number;
  healthySummary: {
    healthy: number;
    sick: number;
    inactive: number;
    dead: number;
  };
}

export interface User {
  id: string;
  phone: string;
  full_name: string;
  first_name: string;
  email?: string;
  country: string;
  city?: string;
  whatsapp_number?: string;
  photo_url?: string;
  language: 'fr';
  created_at: string;
}

export type AlertSeverity = Alert['severity'];
export type AlertType = Alert['type'];
