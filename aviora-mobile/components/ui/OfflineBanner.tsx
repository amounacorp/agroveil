import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useAlertStore } from '../../store/alertStore';

export function OfflineBanner() {
  const { isOnline, offlineQueue } = useAlertStore();
  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        📡 Hors-ligne — {offlineQueue.length} alerte{offlineQueue.length !== 1 ? 's' : ''} en attente de synchronisation
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.errorContainer,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: Colors.onErrorContainer,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
