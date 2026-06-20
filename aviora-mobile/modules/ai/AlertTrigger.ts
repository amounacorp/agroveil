import type { Alert, DetectionBox } from '../../types';
import { Thresholds } from '../../constants/thresholds';

let sickSince:    Record<number, number> = {};
let inactiveSince: number | null = null;
let cannibSince:   number | null = null;
let feederSince:   number | null = null;
let prevPositions: Record<number, { x: number; y: number }> = {};
let highMotionSince: number | null = null;
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

  // INACTIVITY: 2+ inactive birds sustained for inactivityMinutes
  const inactiveCount = boxes.filter((b) => b.type === 'inactive').length;
  if (inactiveCount >= 2) {
    if (inactiveSince === null) inactiveSince = now;
    const inactiveMin = (now - inactiveSince) / 60000;
    if (inactiveMin >= Thresholds.inactivityMinutes) {
      inactiveSince = null;
      return buildAlert({
        type: 'inactivity',
        severity: 'warning',
        confidence: 0.80,
        description: `${inactiveCount} oiseaux inactifs depuis ${Math.round(inactiveMin)} min — comportement anormal`,
        advice: "Des oiseaux immobiles groupés peuvent signaler une maladie ou un stress de confinement.",
        immediateSteps: [
          'Localisez les oiseaux inactifs et examinez leur posture',
          'Vérifiez l\'accès à l\'eau et à la nourriture',
          'Isolez les sujets présentant des symptômes visibles',
        ],
        preventionTip: 'Contrôlez quotidiennement l\'activité générale du troupeau tôt le matin.',
      });
    }
  } else {
    inactiveSince = null;
  }

  // CANNIBALISM: 3+ sick/dead boxes spatially clustered (std-dev of x < 0.15)
  const sickDead = boxes.filter((b) => b.type === 'sick' || b.type === 'dead');
  if (sickDead.length >= 3) {
    const xs = sickDead.map((b) => b.bbox.x);
    const meanX = xs.reduce((a, v) => a + v, 0) / xs.length;
    const stdX = Math.sqrt(xs.reduce((a, v) => a + (v - meanX) ** 2, 0) / xs.length);
    if (stdX < 0.15) {
      if (cannibSince === null) cannibSince = now;
      if ((now - cannibSince) / 1000 >= 30) {
        cannibSince = null;
        return buildAlert({
          type: 'cannibalism',
          severity: 'critical',
          confidence: 0.78,
          description: `${sickDead.length} oiseaux blessés/morts regroupés — possible cannibalisme`,
          advice: 'Le cannibalisme est souvent provoqué par le surpeuplement, le stress ou un manque de protéines.',
          immediateSteps: [
            'Retirez immédiatement les oiseaux blessés',
            'Vérifiez la densité du troupeau dans la zone',
            'Appliquez un spray anti-picage sur les blessures visibles',
          ],
          preventionTip: 'Réduisez l\'intensité lumineuse et vérifiez l\'apport en acides aminés.',
        });
      }
    } else {
      cannibSince = null;
    }
  } else {
    cannibSince = null;
  }

  // FEEDER_EMPTY: no healthy birds detected but total > threshold (birds seeking food)
  const totalBirds = boxes.filter((b) => b.type !== 'dead').length;
  const healthyCount = boxes.filter((b) => b.type === 'healthy').length;
  if (totalBirds >= 5 && healthyCount === 0) {
    if (feederSince === null) feederSince = now;
    if ((now - feederSince) / 60000 >= Thresholds.feederEmptyMinutes) {
      feederSince = null;
      return buildAlert({
        type: 'feeder_empty',
        severity: 'info',
        confidence: 0.72,
        description: `Aucun comportement alimentaire détecté depuis ${Thresholds.feederEmptyMinutes} min`,
        advice: 'Les oiseaux sans accès à la nourriture développent rapidement des comportements agressifs.',
        immediateSteps: [
          'Vérifiez le niveau des mangeoires dans toutes les zones',
          'Contrôlez le mécanisme de distribution automatique si applicable',
          'Remplissez les mangeoires vides immédiatement',
        ],
        preventionTip: 'Planifiez deux ravitaillements par jour (matin et après-midi).',
      });
    }
  } else {
    feederSince = null;
  }

  // ABNORMAL_MOVEMENT: average displacement across frames exceeds threshold
  const currPositions: Record<number, { x: number; y: number }> = {};
  for (const b of boxes) currPositions[b.id] = { x: b.bbox.x, y: b.bbox.y };

  const matched = boxes.filter((b) => prevPositions[b.id]);
  if (matched.length >= 3) {
    const avgDisp = matched.reduce((sum, b) => {
      const prev = prevPositions[b.id];
      const dx = b.bbox.x - prev.x;
      const dy = b.bbox.y - prev.y;
      return sum + Math.sqrt(dx * dx + dy * dy);
    }, 0) / matched.length;

    if (avgDisp > 0.05) {
      if (highMotionSince === null) highMotionSince = now;
      if ((now - highMotionSince) / 1000 >= 8) {
        highMotionSince = null;
        prevPositions = currPositions;
        return buildAlert({
          type: 'abnormal_movement',
          severity: 'warning',
          confidence: 0.75,
          description: 'Agitation anormale détectée — mouvement inhabituellement élevé sur tout le troupeau',
          advice: "Une panique soudaine peut signaler la présence d'un prédateur ou une dégradation de la qualité de l'air.",
          immediateSteps: [
            'Vérifiez l\'absence de prédateurs aux abords du bâtiment',
            'Contrôlez la ventilation et la qualité de l\'air',
            'Observez si l\'agitation se calme dans les 10 prochaines minutes',
          ],
          preventionTip: 'Sécurisez le périmètre avec un grillage adapté et vérifiez les filets de protection.',
        });
      }
    } else {
      highMotionSince = null;
    }
  }
  prevPositions = currPositions;

  return null;
}
