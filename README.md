# Aviora — Plateforme de Surveillance Intelligente des Volailles

Aviora est une solution complète de surveillance de fermes avicoles par intelligence artificielle.
Elle détecte en temps réel les oiseaux malades, les mangeoires vides et les comportements anormaux.

---

## Architecture du projet

```
aviora/
├── aviora-mobile/      Application smartphone (éleveur individuel)
├── aviora-admin/       Console d'administration web
├── aviora-portail/     Portail fermier web
└── aviora-edge/        Service IA pour caméras fixes (grandes fermes)
```

---

## Déploiement sur Raspberry Pi (grandes fermes)

> Ce guide concerne `aviora-edge` — le service à installer sur un mini serveur
> placé dans le bâtiment d'élevage pour analyser des caméras IP suspendues.

### Matériel requis

| Composant | Recommandation | Prix estimé |
|---|---|---|
| Serveur edge | Raspberry Pi 5 (8 GB) | ~90 € |
| Alimentation | Officielle 27W USB-C | ~15 € |
| Stockage | Carte SD 64 GB Class 10 | ~15 € |
| Caméras IP | N'importe quelle caméra RTSP (TP-Link, Reolink…) | ~30–80 €/unité |

Un Raspberry Pi 5 peut analyser **3 à 4 caméras simultanément** à 2 fps.
Pour plus de caméras, utiliser un Intel NUC ou un Jetson Nano.

---

### Étape 1 — Préparer le Raspberry Pi

Installer **Raspberry Pi OS Lite 64-bit** (sans interface graphique) via
[Raspberry Pi Imager](https://www.raspberrypi.com/software/).

Activer SSH pendant l'installation (bouton « Options avancées »).

Depuis votre PC, se connecter :

```bash
ssh pi@192.168.1.50
```

*(Remplacer `192.168.1.50` par l'adresse IP réelle du Pi sur votre réseau)*

---

### Étape 2 — Copier les fichiers Aviora Edge

Depuis votre PC Windows, dans un terminal PowerShell :

```powershell
scp -r C:\Users\Soddy\projets\aviora\aviora-edge\ pi@192.168.1.50:~/aviora-edge/
```

---

### Étape 3 — Copier le modèle entraîné

```powershell
scp "G:\Mon Drive\Aviora\YOLOv8\aviora_yolov8.tflite" pi@192.168.1.50:~/aviora-edge/models/aviora_yolov8.pt
```

---

### Étape 4 — Lancer l'installation automatique

Sur le Raspberry Pi (via SSH) :

```bash
cd ~/aviora-edge
chmod +x install.sh
./install.sh
```

Ce script installe automatiquement Python, OpenCV, les dépendances et crée
l'environnement virtuel. Durée : environ 10–15 minutes.

---

### Étape 5 — Configurer les caméras

Éditer le fichier de configuration :

```bash
nano ~/aviora-edge/config.yaml
```

Renseigner :

```yaml
api:
  base_url: "https://api.aviora.com"
  api_key:  "VOTRE_CLE_API"        # obtenue depuis aviora-admin

farm:
  id:   "ferme-001"
  name: "Bâtiment A"

cameras:
  - id:   "cam-01"
    name: "Zone Nord"
    url:  "rtsp://admin:motdepasse@192.168.1.101/stream"
    fps:  2

  - id:   "cam-02"
    name: "Zone Sud"
    url:  "rtsp://admin:motdepasse@192.168.1.102/stream"
    fps:  2
```

> **Trouver l'URL RTSP de votre caméra :** consultez le manuel de votre caméra
> ou cherchez `"[marque caméra] RTSP URL"` sur Google.
> Format courant : `rtsp://admin:password@192.168.1.X/stream`

---

### Étape 6 — Démarrer le service

```bash
# Installer le service systemd (démarrage automatique)
sudo cp ~/aviora-edge/aviora-edge.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable aviora-edge
sudo systemctl start aviora-edge
```

Le service démarre maintenant **automatiquement à chaque redémarrage** du Pi.

---

### Vérifier que tout fonctionne

```bash
# Voir les logs en direct
sudo journalctl -u aviora-edge -f
```

Vous devriez voir :

```
10:23:01 [INFO] Aviora Edge démarré — ferme : Bâtiment A
10:23:01 [INFO] Modèle : models/aviora_yolov8.pt
10:23:01 [INFO] Caméras : 2
10:23:02 [INFO] [cam-01] Connecté
10:23:02 [INFO] [cam-02] Connecté
10:23:03 [INFO] Tous les workers démarrés. Ctrl+C pour arrêter.
```

---

### Commandes utiles

```bash
# Arrêter le service
sudo systemctl stop aviora-edge

# Redémarrer le service
sudo systemctl restart aviora-edge

# Voir le statut
sudo systemctl status aviora-edge

# Voir les 100 dernières lignes de logs
sudo journalctl -u aviora-edge -n 100
```

---

### Résolution de problèmes

| Problème | Solution |
|---|---|
| `Connexion échouée` sur une caméra | Vérifier l'URL RTSP et le mot de passe dans `config.yaml` |
| `Model not found` | Vérifier que le fichier `.pt` est dans `~/aviora-edge/models/` |
| Détections peu précises | Ajuster `confidence` dans `config.yaml` (défaut : 0.45) |
| Trop d'alertes | Augmenter `debounce_seconds` dans `config.yaml` (défaut : 300) |
| Le service ne démarre pas | `sudo journalctl -u aviora-edge -n 50` pour voir l'erreur |

---

## Application mobile (éleveur individuel)

L'application `aviora-mobile` utilise la caméra du smartphone directement.
Elle est destinée aux petits élevages ou aux visites terrain.

Voir [aviora-mobile/README.md](aviora-mobile/) pour les instructions de build.

---

## Classes détectées par le modèle IA

| Classe | Couleur | Description |
|---|---|---|
| `healthy` | 🟢 Vert | Oiseau en bonne santé |
| `sick` | 🔴 Rouge | Oiseau malade ou en détresse |
| `feeder` | 🟠 Orange | Mangeoire détectée |
| `drinker` | 🔵 Bleu | Abreuvoir détecté |

---

## Alertes automatiques

| Alerte | Déclencheur |
|---|---|
| Mortalité | Oiseau malade visible en continu > 30 secondes |
| Mangeoire vide | Mangeoire visible mais aucun oiseau sain depuis > 10 min |
| Stress thermique | > 40% des oiseaux regroupés en périphérie |
| Mouvement anormal | Agitation collective inhabituelle > 8 secondes |

---

*Aviora — Intelligence artificielle au service de l'élevage avicole*
