"""
Lecteur de flux RTSP avec reconnexion automatique — Aviora Edge
"""
import cv2
import time
import logging
import threading
from typing import Optional
import numpy as np

logger = logging.getLogger(__name__)


class RTSPCamera:
    """
    Lit un flux RTSP dans un thread dédié.
    Reconnexion automatique si la caméra est déconnectée.
    """

    def __init__(self, camera_id: str, url: str, fps: int = 2):
        self.camera_id    = camera_id
        self.url          = url
        self.target_fps   = fps
        self.frame_interval = 1.0 / fps

        self._cap:    Optional[cv2.VideoCapture] = None
        self._frame:  Optional[np.ndarray] = None
        self._lock    = threading.Lock()
        self._running = False
        self._thread: Optional[threading.Thread] = None

    def start(self) -> None:
        self._running = True
        self._thread  = threading.Thread(target=self._read_loop, daemon=True)
        self._thread.start()
        logger.info(f"[{self.camera_id}] Démarrage flux RTSP : {self.url}")

    def stop(self) -> None:
        self._running = False
        if self._cap:
            self._cap.release()

    def get_frame(self) -> Optional[np.ndarray]:
        with self._lock:
            return self._frame.copy() if self._frame is not None else None

    def _connect(self) -> bool:
        if self._cap:
            self._cap.release()
        self._cap = cv2.VideoCapture(self.url, cv2.CAP_FFMPEG)
        self._cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        ok = self._cap.isOpened()
        if ok:
            logger.info(f"[{self.camera_id}] Connecté")
        else:
            logger.warning(f"[{self.camera_id}] Connexion échouée — retry dans 5s")
        return ok

    def _read_loop(self) -> None:
        while self._running:
            if not self._connect():
                time.sleep(5)
                continue

            last_read = time.time()
            while self._running:
                ret, frame = self._cap.read()
                if not ret:
                    logger.warning(f"[{self.camera_id}] Flux perdu — reconnexion...")
                    break

                now = time.time()
                if now - last_read >= self.frame_interval:
                    with self._lock:
                        self._frame = frame
                    last_read = now
                else:
                    # On lit mais on jette pour vider le buffer
                    pass

            time.sleep(2)
