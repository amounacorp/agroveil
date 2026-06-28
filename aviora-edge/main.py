"""
Aviora Edge — Service de surveillance IA pour caméras fixes
===========================================================
Installe sur : Raspberry Pi 5 / Jetson Nano / Mini PC Linux

Usage :
    python main.py                        # config.yaml par défaut
    python main.py --config /etc/aviora/config.yaml

Ce service :
  1. Se connecte aux flux RTSP de toutes les caméras configurées
  2. Analyse chaque frame avec YOLOv8n
  3. Envoie les détections + alertes à l'API Aviora en temps réel
"""

import argparse
import logging
import time
import threading
from typing import Optional

import yaml

from camera    import RTSPCamera
from detector  import AviоraDetector
from api_client import AviоraApiClient

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S',
)
logger = logging.getLogger(__name__)


# ── Logique d'alerte par caméra ──────────────────────────────────────────────

class CameraAlertState:
    """Maintient l'état temporel pour déclencher les alertes par caméra."""

    def __init__(self, cfg: dict):
        self.mortality_seconds    = cfg['alerts']['mortality_seconds']
        self.feeder_empty_minutes = cfg['alerts']['feeder_empty_minutes']
        self.debounce_seconds     = cfg['alerts']['debounce_seconds']

        self._sick_since:   dict[int, float] = {}
        self._feeder_since: Optional[float]  = None
        self._last_alert:   float            = 0.0

    def _debounced(self) -> bool:
        return (time.time() - self._last_alert) < self.debounce_seconds

    def evaluate(self, detections: list[dict]) -> Optional[dict]:
        if self._debounced():
            return None

        now = time.time()

        # MORTALITÉ : oiseau malade visible en continu > mortality_seconds
        sick_ids = [i for i, d in enumerate(detections) if d['class'] == 'sick']
        for sid in sick_ids:
            since = self._sick_since.setdefault(sid, now)
            if (now - since) >= self.mortality_seconds:
                self._last_alert = now
                return {
                    'type':        'mortality',
                    'severity':    'critical',
                    'confidence':  detections[sid]['confidence'],
                    'description': f"Oiseau malade détecté depuis {int((now-since)//60)} min",
                }
        self._sick_since = {k: v for k, v in self._sick_since.items() if k in sick_ids}

        # MANGEOIRE VIDE : mangeoire visible mais aucun oiseau sain
        has_feeder  = any(d['class'] == 'feeder'  for d in detections)
        has_healthy = any(d['class'] == 'healthy' for d in detections)
        if has_feeder and not has_healthy:
            if self._feeder_since is None:
                self._feeder_since = now
            elif (now - self._feeder_since) / 60 >= self.feeder_empty_minutes:
                self._feeder_since = None
                self._last_alert = now
                return {
                    'type':        'feeder_empty',
                    'severity':    'warning',
                    'confidence':  0.78,
                    'description': f"Mangeoire visible mais aucun oiseau ne s'alimente depuis {self.feeder_empty_minutes} min",
                }
        else:
            self._feeder_since = None

        return None


# ── Worker par caméra ─────────────────────────────────────────────────────────

def camera_worker(cam_cfg: dict, detector: AviоraDetector,
                  api: AviоraApiClient, alert_cfg: dict) -> None:
    camera = RTSPCamera(cam_cfg['id'], cam_cfg['url'], cam_cfg.get('fps', 2))
    camera.start()

    alert_state = CameraAlertState(alert_cfg)
    logger.info(f"[{cam_cfg['id']}] Worker démarré — {cam_cfg['name']}")

    while True:
        frame = camera.get_frame()
        if frame is None:
            time.sleep(0.5)
            continue

        detections = detector.detect(frame)

        # Envoyer détections au backend
        api.send_detections(cam_cfg['id'], detections)

        # Évaluer les alertes
        alert = alert_state.evaluate(detections)
        if alert:
            api.send_alert(
                camera_id   = cam_cfg['id'],
                alert_type  = alert['type'],
                severity    = alert['severity'],
                confidence  = alert['confidence'],
                description = alert['description'],
            )

        time.sleep(1.0 / cam_cfg.get('fps', 2))


# ── Point d'entrée ────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description='Aviora Edge — Service IA')
    parser.add_argument('--config', default='config.yaml')
    args = parser.parse_args()

    with open(args.config) as f:
        cfg = yaml.safe_load(f)

    logger.info(f"Aviora Edge démarré — ferme : {cfg['farm']['name']}")
    logger.info(f"Modèle : {cfg['model']['path']}")
    logger.info(f"Caméras : {len(cfg['cameras'])}")

    detector = AviоraDetector(
        model_path = cfg['model']['path'],
        imgsz      = cfg['model']['imgsz'],
        conf       = cfg['model']['confidence'],
        iou        = cfg['model']['iou'],
    )

    api = AviоraApiClient(
        base_url = cfg['api']['base_url'],
        api_key  = cfg['api']['api_key'],
        farm_id  = cfg['farm']['id'],
    )

    # Un thread par caméra
    threads = []
    for cam_cfg in cfg['cameras']:
        t = threading.Thread(
            target=camera_worker,
            args=(cam_cfg, detector, api, cfg),
            daemon=True,
            name=f"cam-{cam_cfg['id']}",
        )
        t.start()
        threads.append(t)

    logger.info("Tous les workers démarrés. Ctrl+C pour arrêter.")
    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        logger.info("Arrêt demandé.")


if __name__ == '__main__':
    main()
