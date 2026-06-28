import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { DetectionBox } from '../../types';
import { Colors } from '../../constants/colors';

interface Props {
  boxes: DetectionBox[];
  isAIActive: boolean;
  fps?: number;
  cameraName?: string;
}

const BOX_COLORS: Record<DetectionBox['type'], string> = {
  healthy: '#4CAF50',
  sick:    '#F44336',
  feeder:  '#FF9800',
  drinker: '#2196F3',
};

export function LiveCameraView({ boxes, isAIActive, fps = 30, cameraName = 'Caméra' }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const { width } = Dimensions.get('window');
  const viewHeight = Math.round(width * 0.65);

  if (!permission) {
    return (
      <View style={[styles.placeholder, { height: viewHeight }]}>
        <Text style={styles.placeholderText}>Initialisation caméra…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.placeholder, { height: viewHeight }]}>
        <Text style={styles.placeholderIcon}>📷</Text>
        <Text style={styles.placeholderTitle}>Accès caméra requis</Text>
        <Text style={styles.placeholderText}>
          Aviora utilise la caméra pour la surveillance IA en temps réel.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.8}>
          <Text style={styles.permBtnText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: viewHeight }]}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" active={true} />

      {/* Detection boxes overlay using absolute pixel coords from normalised bbox */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {boxes.map((box) => {
          const left    = box.bbox.x * width;
          const top     = box.bbox.y * viewHeight;
          const bWidth  = box.bbox.width  * width;
          const bHeight = box.bbox.height * viewHeight;
          const color   = BOX_COLORS[box.type] ?? Colors.onSurface;
          return (
            <View key={box.id} style={[styles.box, { left, top, width: bWidth, height: bHeight, borderColor: color }]}>
              <View style={[styles.labelBg, { backgroundColor: color }]}>
                <Text style={styles.labelText}>{box.label}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Top status bar */}
      <View style={styles.statusBar}>
        <View style={[styles.dot, { backgroundColor: isAIActive ? '#4CAF50' : '#FF9800' }]} />
        <Text style={styles.statusText}>
          {isAIActive ? `IA ACTIVE — ${fps} FPS` : 'SIMULATION IA'}
        </Text>
        <View style={styles.livePill}>
          <Text style={styles.liveText}>● EN DIRECT</Text>
        </View>
      </View>

      {/* Bottom camera name tag */}
      <View style={styles.nameTag}>
        <Text style={styles.nameText}>{cameraName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    backgroundColor: '#000',
  },
  placeholder: {
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '50',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  placeholderIcon:  { fontSize: 36 },
  placeholderTitle: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  placeholderText:  { fontSize: 13, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  permBtn: {
    marginTop: 4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  permBtnText: { color: Colors.onPrimary, fontSize: 14, fontWeight: '700' },

  box: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
  },
  labelBg: {
    position: 'absolute',
    top: -18,
    left: 0,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  labelText: { fontSize: 9, color: '#fff', fontWeight: '700' },

  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  dot:        { width: 7, height: 7, borderRadius: 4 },
  statusText: { flex: 1, fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  livePill: {
    backgroundColor: '#A32D2D',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveText: { fontSize: 9, color: '#fff', fontWeight: '800' },

  nameTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopRightRadius: 8,
  },
  nameText: { fontSize: 11, color: '#fff', fontWeight: '600' },
});
