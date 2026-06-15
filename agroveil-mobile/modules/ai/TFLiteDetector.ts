import type { DetectionBox } from '../../types';
import { Thresholds } from '../../constants/thresholds';

// Classes that the YOLOv8 model recognises
const CLASSES = ['healthy', 'sick', 'inactive', 'dead', 'feeder', 'drinker', 'group_stress'] as const;
type ModelClass = typeof CLASSES[number];

interface RawDetection {
  x: number; y: number; w: number; h: number;
  confidence: number; classIndex: number;
}

function iou(a: RawDetection, b: RawDetection): number {
  const x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.w * a.h + b.w * b.h - inter;
  return union > 0 ? inter / union : 0;
}

function nms(detections: RawDetection[], iouThreshold = 0.45): RawDetection[] {
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  const kept: RawDetection[] = [];
  for (const det of sorted) {
    if (!kept.some((k) => iou(k, det) > iouThreshold)) {
      kept.push(det);
    }
  }
  return kept;
}

function labelFor(type: ModelClass, confidence: number): string {
  switch (type) {
    case 'healthy':     return `SAIN ${Math.round(confidence * 100)}%`;
    case 'sick':        return `MALADE ${Math.round(confidence * 100)}%`;
    case 'inactive':    return 'INACTIF';
    case 'dead':        return 'MORT';
    case 'group_stress':return 'STRESS';
    default:            return type.toUpperCase();
  }
}

export class TFLiteDetector {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private model: any = null;

  async load(): Promise<void> {
    try {
      const { loadTensorflowModel } = await import('react-native-fast-tflite');
      this.model = await loadTensorflowModel(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../../assets/models/agroveil_yolov8.tflite')
      );
    } catch {
      // Model file is a placeholder during development; silently skip
      this.model = null;
    }
  }

  async detect(frame: Float32Array): Promise<DetectionBox[]> {
    if (!this.model) return [];
    const output = await this.model.run([frame]);
    return this.postProcess(output);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private postProcess(output: any[]): DetectionBox[] {
    const raw = output[0] as Float32Array;
    const numDetections = raw.length / (5 + CLASSES.length);
    const detections: RawDetection[] = [];

    for (let i = 0; i < numDetections; i++) {
      const offset = i * (5 + CLASSES.length);
      const confidence = raw[offset + 4];
      if (confidence < Thresholds.confidenceMin) continue;

      let maxClass = 0;
      let maxScore = 0;
      for (let c = 0; c < CLASSES.length; c++) {
        if (raw[offset + 5 + c] > maxScore) {
          maxScore = raw[offset + 5 + c];
          maxClass = c;
        }
      }

      detections.push({
        x: raw[offset],     y: raw[offset + 1],
        w: raw[offset + 2], h: raw[offset + 3],
        confidence: confidence * maxScore,
        classIndex: maxClass,
      });
    }

    const kept = nms(detections);
    return kept.map((d, idx): DetectionBox => {
      const type = CLASSES[d.classIndex] as DetectionBox['type'];
      return {
        id: idx + 1,
        type: (['healthy', 'sick', 'inactive', 'dead'] as const).includes(type as never)
          ? (type as DetectionBox['type'])
          : 'inactive',
        confidence: d.confidence,
        label: labelFor(CLASSES[d.classIndex], d.confidence),
        bbox: { x: d.x, y: d.y, width: d.w, height: d.h },
      };
    });
  }
}
