"""
Moteur de détection YOLOv8 — Aviora Edge
"""
from ultralytics import YOLO
import numpy as np


CLASSES = ['healthy', 'sick', 'feeder', 'drinker']


class AviораDetector:
    def __init__(self, model_path: str, imgsz: int = 640, conf: float = 0.45, iou: float = 0.45):
        self.model  = YOLO(model_path)
        self.imgsz  = imgsz
        self.conf   = conf
        self.iou    = iou

    def detect(self, frame: np.ndarray) -> list[dict]:
        """
        Analyse une frame BGR (OpenCV) et retourne la liste des détections.
        Chaque détection : { class, label, confidence, bbox: {x,y,w,h} } (normalisé 0-1)
        """
        results = self.model(
            frame,
            imgsz=self.imgsz,
            conf=self.conf,
            iou=self.iou,
            verbose=False,
        )[0]

        detections = []
        h, w = frame.shape[:2]

        for box in results.boxes:
            cls_id     = int(box.cls[0])
            confidence = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                'class':      CLASSES[cls_id] if cls_id < len(CLASSES) else 'unknown',
                'label':      self._label(cls_id, confidence),
                'confidence': round(confidence, 3),
                'bbox': {
                    'x':      round(x1 / w, 4),
                    'y':      round(y1 / h, 4),
                    'width':  round((x2 - x1) / w, 4),
                    'height': round((y2 - y1) / h, 4),
                },
            })

        return detections

    def _label(self, cls_id: int, confidence: float) -> str:
        labels = {
            0: f"SAIN {round(confidence * 100)}%",
            1: f"MALADE {round(confidence * 100)}%",
            2: "MANGEOIRE",
            3: "ABREUVOIR",
        }
        return labels.get(cls_id, "INCONNU")
