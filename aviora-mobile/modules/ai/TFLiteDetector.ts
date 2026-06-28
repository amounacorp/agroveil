import type { DetectionBox } from '../../types';
import { Thresholds } from '../../constants/thresholds';

// Classes matching aviora-mvp-merged dataset (4 classes, same order as data.yaml)
const CLASSES = ['healthy', 'sick', 'feeder', 'drinker'] as const;
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
    case 'healthy': return `SAIN ${Math.round(confidence * 100)}%`;
    case 'sick':    return `MALADE ${Math.round(confidence * 100)}%`;
    case 'feeder':  return 'MANGEOIRE';
    case 'drinker': return 'ABREUVOIR';
  }
}

export class TFLiteDetector {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private model: any = null;

  /**
   * Returns true if a real trained model was loaded, false if falling back to simulation.
   * Model spec (Ultralytics YOLOv8n float32 TFLite):
   *   input  : [1, 640, 640, 3] float32, values in [0, 1]
   *   output : [1, 8, 8400]  →  8 = 4 bbox coords + 4 class scores
   *            layout (transposed): [cx×8400, cy×8400, w×8400, h×8400, cls0×8400 …]
   *            coordinates are in pixel space (0–640), no separate objectness score.
   */
  async load(): Promise<boolean> {
    try {
      const { loadTensorflowModel } = await import('react-native-fast-tflite');
      this.model = await loadTensorflowModel(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../../assets/models/agroveil_yolov8.tflite')
      );
      // Validate the model has the expected input tensor
      if (!this.model?.inputs?.length) {
        console.warn('[Aviora AI] Model file is a placeholder (no inputs). Simulation mode active.');
        this.model = null;
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[Aviora AI] Model load failed — simulation mode active.', err);
      this.model = null;
      return false;
    }
  }

  isLoaded(): boolean {
    return this.model !== null;
  }

  async detect(frame: Float32Array): Promise<DetectionBox[]> {
    if (!this.model) return [];
    const output = await this.model.run([frame]);
    return this.postProcess(output);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private postProcess(output: any[]): DetectionBox[] {
    const raw = output[0] as Float32Array;

    // YOLOv8n TFLite: output shape [1, nc+4, 8400] flattened
    // row k = raw[k * NUM_ANCHORS .. (k+1) * NUM_ANCHORS - 1]
    // rows 0-3 = cx, cy, w, h  (pixel space 0–640)
    // rows 4..4+nc-1 = class scores (no objectness in YOLOv8)
    const NUM_ANCHORS = 8400;
    const IMGSZ = 640;
    const expectedLen = (4 + CLASSES.length) * NUM_ANCHORS;

    if (raw.length !== expectedLen) {
      console.warn(`[Aviora AI] Output length ${raw.length} ≠ expected ${expectedLen} — skipping frame`);
      return [];
    }

    const detections: RawDetection[] = [];

    for (let i = 0; i < NUM_ANCHORS; i++) {
      // Pick best class
      let maxClass = 0;
      let maxScore = 0;
      for (let c = 0; c < CLASSES.length; c++) {
        const score = raw[(4 + c) * NUM_ANCHORS + i];
        if (score > maxScore) { maxScore = score; maxClass = c; }
      }
      if (maxScore < Thresholds.confidenceMin) continue;

      // Convert center-format pixels → top-left normalized [0-1]
      const cx = raw[0 * NUM_ANCHORS + i] / IMGSZ;
      const cy = raw[1 * NUM_ANCHORS + i] / IMGSZ;
      const w  = raw[2 * NUM_ANCHORS + i] / IMGSZ;
      const h  = raw[3 * NUM_ANCHORS + i] / IMGSZ;

      detections.push({ x: cx - w / 2, y: cy - h / 2, w, h, confidence: maxScore, classIndex: maxClass });
    }

    const kept = nms(detections);
    return kept.map((d, idx): DetectionBox => ({
      id: idx + 1,
      type: CLASSES[d.classIndex],
      confidence: d.confidence,
      label: labelFor(CLASSES[d.classIndex], d.confidence),
      bbox: { x: d.x, y: d.y, width: d.w, height: d.h },
    }));
  }
}
