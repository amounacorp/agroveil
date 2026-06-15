import type { Alert, DetectionBox } from '../../types';
import { Thresholds } from '../../constants/thresholds';

let sickSince: Record<number, number> = {};
let lastAlertAt = 0;

function debounced(): boolean {
  return Date.now() - lastAlertAt < Thresholds.alertDebounceSeconds * 1000;
}

function buildAlert(
  partial: Pick<Alert, 'type' | 'severity' | 'confidence' | 'description' | 'advice' | 'immediateSteps' | 'preventionTip'>
): Alert {
  lastAlertAt = Date.now();
  return {
    id: `alert-${Date.now()}`,
    farmName: 'Bâtiment A',
    cameraName: 'Caméra 01',
    isResolved: false,
    whatsappSent: false,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

export function evaluateDetections(boxes: DetectionBox[]): Alert | null {
  if (debounced()) return null;

  const now = Date.now();

  // MORTALITY: sick/dead box present continuously > immobileSeconds
  for (const box of boxes) {
    if (box.type === 'sick' || box.type === 'dead') {
      const since = sickSince[box.id] ?? now;
      sickSince[box.id] = since;
      if ((now - since) / 1000 >= Thresholds.immobileSeconds) {
        return buildAlert({
          type: 'mortality',
          severity: 'critical',
          confidence: box.confidence,
          description: `Oiseau immobile détecté (${box.label}) depuis ${Math.round((now - since) / 60000)} min`,
          advice: 'Isolez immédiatement l\'oiseau et vérifiez les signes vitaux',
          immediateSteps: [
            'Isolez l\'oiseau concerné',
            'Observez plumes, yeux et fientes',
            'Contactez le vétérinaire si les signes persistent',
          ],
          preventionTip: "Vérifiez la qualité de l'eau et la ventilation du bâtiment",
        });
      }
    } else {
      delete sickSince[box.id];
    }
  }

  // HEAT_STRESS: >40% birds near edges
  const total = boxes.filter((b) => b.type !== 'dead').length;
  const peripheral = boxes.filter((b) => b.bbox.x < 0.1 || b.bbox.x + b.bbox.width > 0.9).length;
  if (total > 0 && peripheral / total >= Thresholds.peripheralGroupPct) {
    return buildAlert({
      type: 'heat_stress',
      severity: 'warning',
      confidence: 0.85,
      description: `${peripheral} oiseaux concentrés en périphérie — risque de stress thermique`,
      advice: 'Activez le système de refroidissement d\'urgence',
      immediateSteps: [
        'Vérifier le système de ventilation',
        "Augmenter la fréquence d'abreuvement",
        'Ouvrir les trappes de ventilation latérales',
      ],
      preventionTip: 'Installer des capteurs de température supplémentaires',
    });
  }

  return null;
}
