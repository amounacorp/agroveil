#!/bin/bash
# Aviora Edge — Script d'installation automatique
# Compatible : Raspberry Pi OS, Ubuntu 22.04, Jetson (JetPack 5+)
#
# Usage :
#   chmod +x install.sh
#   ./install.sh

set -e

INSTALL_DIR="/home/pi/aviora-edge"
MODEL_URL=""  # laisser vide si copie manuelle

echo "=== Aviora Edge — Installation ==="

# Dépendances système
sudo apt-get update -q
sudo apt-get install -y python3-pip python3-venv libopencv-dev ffmpeg

# Dossier d'installation
sudo mkdir -p "$INSTALL_DIR/models"
sudo chown -R pi:pi "$INSTALL_DIR"
cp -r ./* "$INSTALL_DIR/"

# Environnement Python isolé
cd "$INSTALL_DIR"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "=== Installation terminée ==="
echo ""
echo "Étapes suivantes :"
echo "  1. Copier le modèle : cp aviora_yolov8.pt $INSTALL_DIR/models/"
echo "  2. Éditer la config : nano $INSTALL_DIR/config.yaml"
echo "  3. Installer le service :"
echo "       sudo cp aviora-edge.service /etc/systemd/system/"
echo "       sudo systemctl enable aviora-edge"
echo "       sudo systemctl start aviora-edge"
echo "  4. Vérifier les logs :"
echo "       sudo journalctl -u aviora-edge -f"
