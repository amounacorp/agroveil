import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  status: 'online' | 'offline' | 'syncing';
  size?: number;
}

export function StatusDot({ status, size = 8 }: Props) {
  const color =
    status === 'online'  ? Colors.online  :
    status === 'syncing' ? Colors.warning  :
                           Colors.offline;
  return (
    <View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]} />
  );
}

const styles = StyleSheet.create({
  dot: {},
});
