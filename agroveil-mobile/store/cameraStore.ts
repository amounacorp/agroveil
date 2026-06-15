import { create } from 'zustand';
import type { CameraStatus, DetectionBox } from '../types';

interface CameraState {
  cameras: CameraStatus[];
  activeCameraId: string | null;
  isRecording: boolean;
  detectionBoxes: DetectionBox[];
  fps: number;
  isAIActive: boolean;
  confidenceAvg: number;
  setCameras: (cameras: CameraStatus[]) => void;
  setActiveCamera: (id: string) => void;
  setDetectionBoxes: (boxes: DetectionBox[]) => void;
  setFps: (fps: number) => void;
  setAIActive: (active: boolean) => void;
  setConfidenceAvg: (confidence: number) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  cameras: [],
  activeCameraId: null,
  isRecording: false,
  detectionBoxes: [],
  fps: 0,
  isAIActive: false,
  confidenceAvg: 0,

  setCameras: (cameras) => set({ cameras }),
  setActiveCamera: (id) => set({ activeCameraId: id }),
  setDetectionBoxes: (detectionBoxes) => set({ detectionBoxes }),
  setFps: (fps) => set({ fps }),
  setAIActive: (isAIActive) => set({ isAIActive }),
  setConfidenceAvg: (confidenceAvg) => set({ confidenceAvg }),
}));
