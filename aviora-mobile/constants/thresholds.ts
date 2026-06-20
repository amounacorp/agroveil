export const Thresholds = {
  // AI detection
  confidenceMin:         Number(process.env.EXPO_PUBLIC_AI_CONFIDENCE_THRESHOLD ?? 0.75),
  detectionIntervalFrames: Number(process.env.EXPO_PUBLIC_DETECTION_INTERVAL_FRAMES ?? 30),
  alertDebounceSeconds:  Number(process.env.EXPO_PUBLIC_ALERT_DEBOUNCE_SECONDS ?? 300),

  // Health
  mortalityAlertPct:     2.0,   // trigger alert when mortality > 2%
  heatStressTemp:        34,    // °C
  heatStressDurationMin: 15,    // minutes above threshold
  inactivityMinutes:     10,
  feederEmptyMinutes:    30,
  immobileSeconds:       120,   // 2 min before sick alert
  peripheralGroupPct:    0.40,  // 40% birds at edges = heat stress
  lowBatteryPct:         20,    // reduce frequency below this
} as const;
