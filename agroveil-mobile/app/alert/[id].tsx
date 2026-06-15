import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Colors } from '../../constants/colors';
import { SeverityBadge } from '../../components/alerts/SeverityBadge';
import { GreenButton } from '../../components/ui/GreenButton';
import { useAlertById, useResolveAlert } from '../../hooks/useAlerts';
import { useWhatsApp } from '../../hooks/useWhatsApp';

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: alert, isLoading } = useAlertById(id ?? '');
  const resolve = useResolveAlert();
  const { sendAlert, isSending } = useWhatsApp();

  if (isLoading || !alert) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(alert.createdAt), { locale: fr, addSuffix: true });
  const fullTime = format(new Date(alert.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <SeverityBadge severity={alert.severity} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.alertType}>{alert.type.replace(/_/g, ' ').toUpperCase()}</Text>
          <Text style={styles.desc}>{alert.description}</Text>
          <Text style={styles.meta}>{alert.cameraName} · {alert.farmName} · {timeAgo}</Text>
          <Text style={styles.metaSub}>{fullTime}</Text>
        </View>

        {/* Confidence */}
        <View style={styles.confidenceCard}>
          <Text style={styles.confidenceLabel}>Confiance IA</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.round(alert.confidence * 100)}%` }]} />
          </View>
          <Text style={styles.confidenceValue}>{Math.round(alert.confidence * 100)}%</Text>
        </View>

        {/* Advice */}
        <View style={styles.adviceCard}>
          <Text style={styles.adviceIcon}>💡</Text>
          <Text style={styles.adviceTitle}>Conseil de l'IA</Text>
          <Text style={styles.adviceText}>{alert.advice}</Text>
        </View>

        {/* Immediate steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Étapes immédiates</Text>
          {alert.immediateSteps.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Prevention tip */}
        <View style={styles.preventionCard}>
          <Text style={styles.preventionTitle}>🛡️ Conseil de prévention</Text>
          <Text style={styles.preventionText}>{alert.preventionTip}</Text>
        </View>

        {/* Resolution status */}
        {alert.isResolved && alert.resolvedAt && (
          <View style={styles.resolvedBanner}>
            <Text style={styles.resolvedText}>
              ✅ Résolu {formatDistanceToNow(new Date(alert.resolvedAt), { locale: fr, addSuffix: true })}
            </Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky footer */}
      {!alert.isResolved && (
        <View style={styles.footer}>
          <GreenButton
            label="Marquer résolu"
            style={styles.footerBtn}
            onPress={() => resolve.mutate(alert.id)}
            loading={resolve.isPending}
          />
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() => sendAlert({ alert })}
            activeOpacity={0.8}
          >
            <Text style={styles.whatsappText}>
              {isSending ? 'Envoi...' : '📱 WhatsApp'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: Colors.background },
  loading:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText:     { color: Colors.onSurfaceVariant, fontSize: 16 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: Colors.surfaceContainer },
  backBtn:         { paddingVertical: 4 },
  backText:        { color: Colors.primary, fontSize: 14, fontWeight: '500' },
  scroll:          { flex: 1 },
  content:         { padding: 16, gap: 14 },
  titleBlock:      { gap: 4 },
  alertType:       { fontSize: 12, fontWeight: '700', color: Colors.onSurfaceVariant, letterSpacing: 1 },
  desc:            { fontSize: 20, fontWeight: '700', color: Colors.onSurface, lineHeight: 28 },
  meta:            { fontSize: 12, color: Colors.onSurfaceVariant },
  metaSub:         { fontSize: 11, color: Colors.outline },
  confidenceCard:  { backgroundColor: Colors.surfaceContainer, borderRadius: 12, padding: 14, gap: 8, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  confidenceLabel: { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500', flex: 1 },
  progressBg:      { flex: 1, height: 6, backgroundColor: Colors.surfaceVariant, borderRadius: 3, overflow: 'hidden', minWidth: 60 },
  progressFill:    { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  confidenceValue: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  adviceCard:      { backgroundColor: Colors.primaryContainer + '30', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.primaryContainer, gap: 6 },
  adviceIcon:      { fontSize: 20 },
  adviceTitle:     { fontSize: 14, fontWeight: '700', color: Colors.primary },
  adviceText:      { fontSize: 13, color: Colors.onSurface, lineHeight: 20 },
  stepsCard:       { backgroundColor: Colors.surfaceContainer, borderRadius: 12, padding: 16, gap: 12 },
  stepsTitle:      { fontSize: 14, fontWeight: '700', color: Colors.onSurface },
  step:            { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum:         { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNumText:     { fontSize: 12, fontWeight: '700', color: Colors.onPrimaryContainer },
  stepText:        { fontSize: 13, color: Colors.onSurface, flex: 1, lineHeight: 20 },
  preventionCard:  { backgroundColor: '#1a2e1a', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.primaryContainer + '80', gap: 6 },
  preventionTitle: { fontSize: 13, fontWeight: '700', color: Colors.secondary },
  preventionText:  { fontSize: 13, color: Colors.onSurface, lineHeight: 20 },
  resolvedBanner:  { backgroundColor: Colors.primaryContainer, borderRadius: 12, padding: 12, alignItems: 'center' },
  resolvedText:    { fontSize: 13, fontWeight: '600', color: Colors.onPrimaryContainer },
  footer:          { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, backgroundColor: Colors.surfaceContainer, flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: Colors.outlineVariant + '40' },
  footerBtn:       { flex: 1 },
  whatsappBtn:     { backgroundColor: '#25D366', borderRadius: 24, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  whatsappText:    { color: '#000', fontWeight: '700', fontSize: 13 },
});
