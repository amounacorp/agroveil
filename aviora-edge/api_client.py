"""
Client API Aviora — envoie les détections et alertes au backend — Aviora Edge
"""
import logging
import requests
from datetime import datetime

logger = logging.getLogger(__name__)


class AviоraApiClient:
    def __init__(self, base_url: str, api_key: str, farm_id: str):
        self.base_url = base_url.rstrip('/')
        self.farm_id  = farm_id
        self.session  = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type':  'application/json',
        })

    def send_detections(self, camera_id: str, detections: list[dict]) -> bool:
        """Envoie les détections d'une frame au backend."""
        if not detections:
            return True
        payload = {
            'farm_id':    self.farm_id,
            'camera_id':  camera_id,
            'timestamp':  datetime.utcnow().isoformat() + 'Z',
            'detections': detections,
        }
        try:
            r = self.session.post(f'{self.base_url}/api/detections', json=payload, timeout=5)
            r.raise_for_status()
            return True
        except Exception as e:
            logger.warning(f"send_detections failed: {e}")
            return False

    def send_alert(self, camera_id: str, alert_type: str, severity: str,
                   confidence: float, description: str) -> bool:
        """Envoie une alerte au backend."""
        payload = {
            'farm_id':     self.farm_id,
            'camera_id':   camera_id,
            'type':        alert_type,
            'severity':    severity,
            'confidence':  confidence,
            'description': description,
            'timestamp':   datetime.utcnow().isoformat() + 'Z',
        }
        try:
            r = self.session.post(f'{self.base_url}/api/alerts', json=payload, timeout=5)
            r.raise_for_status()
            logger.info(f"[{camera_id}] Alerte envoyée: {alert_type} ({severity})")
            return True
        except Exception as e:
            logger.warning(f"send_alert failed: {e}")
            return False
