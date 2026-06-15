import { useEffect, useRef, useState } from 'react';
import { MOCK_MODE } from '../../constants/api';
import { MOCK_BOXES } from '../../mocks';
import type { DetectionBox } from '../../types';
import { TFLiteDetector } from './TFLiteDetector';
import { evaluateDetections } from './AlertTrigger';
import { useAlertStore } from '../../store/alertStore';
import { AlertQueue } from '../../services/offline/AlertQueue';

export function useAIDetection() {
  const [boxes, setBoxes] = useState<DetectionBox[]>(MOCK_MODE ? MOCK_BOXES : []);
  const [isModelReady, setIsModelReady] = useState(false);
  const detectorRef = useRef(new TFLiteDetector());
  const addAlert = useAlertStore((s) => s.addAlert);
  const isOnline = useAlertStore((s) => s.isOnline);

  useEffect(() => {
    if (MOCK_MODE) {
      setIsModelReady(true);
      // Simulate live box drift in mock mode
      const interval = setInterval(() => {
        setBoxes((prev) =>
          prev.map((box) => ({
            ...box,
            bbox: {
              ...box.bbox,
              x: Math.max(0, Math.min(0.85, box.bbox.x + (Math.random() - 0.5) * 0.02)),
              y: Math.max(0, Math.min(0.85, box.bbox.y + (Math.random() - 0.5) * 0.02)),
            },
          }))
        );
      }, 1000);
      return () => clearInterval(interval);
    }

    detectorRef.current.load().then(() => setIsModelReady(true));
  }, []);

  // Alert evaluation on box changes
  useEffect(() => {
    if (!isModelReady) return;
    const alert = evaluateDetections(boxes);
    if (alert) {
      addAlert(alert);
      if (!isOnline) AlertQueue.enqueue(alert);
    }
  }, [boxes, isModelReady, addAlert, isOnline]);

  return { boxes, isModelReady };
}
