import React, { useState } from 'react';
import { Image, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import type { DetectionBox } from '../../types';
import { DetectionOverlay } from './DetectionOverlay';

// Fallback placeholder image for development (no physical camera)
const PLACEHOLDER_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBvz6wpSN-u4T2D77Q3Mh-LbQszZYPNtNnGHIB348gh_K6bbYwoPSSq1erJJKhAG1BgBJhWZEqooiBaBs9raRPpSwp5PYrhRoIMOrYZUFoulk2AxDxODF3BJWNk_t_xEiC_AX2zBRhcHkBA6mz6oDjnEJy2KKQSbpLXCWj9LLvDaZciSRDiap5VtntAnpSFddac6k52xBfN8L6Natdx0C6poWYIJweYbNEt6_3l2DmdVIkrvaqiPAP_3HjEObR8b4KloCAY1G_YdXU';

interface Props {
  boxes: DetectionBox[];
  isAIActive?: boolean;
  fps?: number;
  cameraName?: string;
}

export function LiveCameraView({ boxes, isAIActive = true, fps = 30, cameraName = 'Caméra 01' }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const healthyCount = boxes.filter((b) => b.type === 'healthy').length;
  const sickCount    = boxes.filter((b) => b.type === 'sick').length;
  const alertCount   = boxes.filter((b) => b.type === 'dead').length;

  function onLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      {/* Feed placeholder image */}
      <Image
        source={{ uri: PLACEHOLDER_URI }}
        style={styles.feed}
        resizeMode="cover"
      />

      {/* AI detection boxes */}
      {size.width > 0 && (
        <DetectionOverlay boxes={boxes} width={size.width} height={size.height} />
      )}

      {/* Top HUD */}
      <View style={styles.topHud}>
        <View style={styles.hudInfo}>
          <Text style={styles.hudMono}>ZONE: SECTEUR_A</Text>
          <Text style={styles.hudMono}>FPS: {fps.toFixed(1)}</Text>
          <Text style={styles.hudMono}>CAM: {cameraName.replace('é', 'e')}_FHD</Text>
        </View>
        {sickCount > 0 && (
          <View style={styles.alertPill}>
            <Text style={styles.alertPillText}>ALERTE: COMPORTEMENT ANORMAL DÉTECTÉ</Text>
          </View>
        )}
      </View>

      {/* Gradient overlay (bottom) */}
      <View style={styles.bottomOverlay} pointerEvents="none" />

      {/* Bottom HUD */}
      <View style={styles.bottomHud}>
        <View style={styles.liveRow}>
          <View style={styles.liveIndicator} />
          <Text style={styles.liveText}>EN DIRECT</Text>
          <Text style={styles.hudMono}> · {fps} FPS</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={[styles.statChip, { color: Colors.secondary }]}>
            {healthyCount} SAINS
          </Text>
          <Text style={[styles.statChip, { color: Colors.error }]}>
            {sickCount} MALADES
          </Text>
          {alertCount > 0 && (
            <Text style={[styles.statChip, { color: Colors.tertiary }]}>
              {alertCount} ALERTES
            </Text>
          )}
        </View>
      </View>

      {/* AI status pill row */}
      {isAIActive && (
        <View style={styles.aiRow}>
          <View style={[styles.pill, { backgroundColor: Colors.primaryContainer }]}>
            <View style={styles.dotGreen} />
            <Text style={[styles.pillText, { color: Colors.onPrimaryContainer }]}>IA Active</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: Colors.surfaceContainerHigh }]}>
            <Text style={[styles.pillText, { color: Colors.onSurfaceVariant }]}>YOLOv8 Nano</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: Colors.tertiaryContainer }]}>
            <Text style={[styles.pillText, { color: Colors.onTertiaryContainer }]}>{fps} FPS</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: Colors.primaryContainer }]}>
            <Text style={[styles.pillText, { color: Colors.onPrimaryContainer }]}>Confiance 94%</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', aspectRatio: 16 / 9 },
  feed:          { width: '100%', height: '100%', position: 'absolute' },
  topHud:        { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  hudInfo:       { backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 8 },
  hudMono:       { color: Colors.primary, fontSize: 10, fontFamily: 'monospace' },
  alertPill:     { backgroundColor: 'rgba(147,0,10,0.8)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  alertPillText: { color: Colors.onErrorContainer, fontSize: 10, fontWeight: '700' },
  bottomOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', backgroundColor: 'transparent' },
  bottomHud:     { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  liveRow:       { flexDirection: 'row', alignItems: 'center' },
  liveIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.error, marginRight: 4 },
  liveText:      { color: '#fff', fontSize: 10, fontWeight: '700' },
  statsRow:      { flexDirection: 'row', gap: 8 },
  statChip:      { fontSize: 10, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  aiRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 10 },
  pill:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pillText:      { fontSize: 11, fontWeight: '600' },
  dotGreen:      { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.secondary },
});
