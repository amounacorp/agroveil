import { useCallback, useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { MOCK_MODE } from '../../constants/api';
import { MOCK_BOXES } from '../../mocks';
import type { DetectionBox } from '../../types';
import { TFLiteDetector } from './TFLiteDetector';
import { evaluateDetections } from './AlertTrigger';
import { useAlertStore } from '../../store/alertStore';
import { AlertQueue } from '../../services/offline/AlertQueue';
import { alertsApi } from '../../services/api/alerts';

export function useAIDetection() {
  const [boxes, setBoxes] = useState<DetectionBox[]>(MOCK_MODE ? MOCK_BOXES : []);
  const [isModelReady, setIsModelReady] = useState(false);
  const detectorRef = useRef(new TFLiteDetector());
  const addAlert  = useAlertStore((s) => s.addAlert);
  const setOnline = useAlertStore((s) => s.setOnline);
  const isOnline  = useAlertStore((s) => s.isOnline);

  // Track real network state
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
    return unsub;
  }, [setOnline]);

  // Simulates box drift for demo/placeholder-model mode
  const startSimulation = useCallback((): ReturnType<typeof setInterval> => {
    setBoxes(MOCK_BOXES);
    return setInterval(() => {
      setBoxes((prev: DetectionBox[]) =>
        prev.map((box: DetectionBox) => ({
          ...box,
          bbox: {
            ...box.bbox,
            x: Math.max(0, Math.min(0.85, box.bbox.x + (Math.random() - 0.5) * 0.02)),
            y: Math.max(0, Math.min(0.85, box.bbox.y + (Math.random() - 0.5) * 0.02)),
          },
        }))
      );
    }, 1000);
  }, []);

  useEffect(() => {
    if (MOCK_MODE) {
      setIsModelReady(true);
      const interval = startSimulation();
      return () => clearInterval(interval);
    }

    let simInterval: ReturnType<typeof setInterval> | null = null;
    detectorRef.current.load().then((hasRealModel) => {
      setIsModelReady(true);
      if (!hasRealModel) {
        simInterval = startSimulation();
      }
    });
    return () => { if (simInterval) clearInterval(simInterval); };
  }, [startSimulation]);

  // Evaluate detections and sync alert to server
  useEffect(() => {
    if (!isModelReady) return;
    const alert = evaluateDetections(boxes);
    if (!alert) return;

    addAlert(alert);

    if (isOnline) {
      alertsApi.create({
        type:        alert.type,
        severity:    alert.severity,
        confidence:  alert.confidence,
        description: alert.description,
        farm_name:   alert.farmName,
      }).catch(() => {
        AlertQueue.enqueue(alert);
      });
    } else {
      AlertQueue.enqueue(alert);
    }
  }, [boxes, isModelReady, addAlert, isOnline]);

  return { boxes, isModelReady };
}
