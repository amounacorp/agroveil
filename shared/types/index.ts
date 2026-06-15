// Shared types across agroveil-mobile, agroveil-admin, agroveil-portail

export interface DetectionBox {
  id: number;
  type: 'healthy' | 'sick' | 'inactive' | 'dead';
  confidence: number;
  label: string;
  bbox: { x: number; y: number; width: number; height: number };
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

export interface Subscription {
  id: string;
  farmId: string;
  plan: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  camerasAllowed: number;
  birdsAllowed: number;
  expiresAt: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  method: 'mobile_money' | 'card' | 'bank';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

export interface Farm {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  country: string;
  region: string;
  camerasCount: number;
  birdsCount: number;
  createdAt: string;
}
