import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { DetectionBox } from '../../types';
import { AIDetectionBox } from './AIDetectionBox';

interface Props {
  boxes: DetectionBox[];
  width: number;
  height: number;
}

export function DetectionOverlay({ boxes, width, height }: Props) {
  return (
    <View style={[styles.overlay, { width, height }]} pointerEvents="none">
      {boxes.map((box) => (
        <AIDetectionBox
          key={box.id}
          box={box}
          containerWidth={width}
          containerHeight={height}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
