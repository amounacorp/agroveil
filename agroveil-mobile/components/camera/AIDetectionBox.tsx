import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import type { DetectionBox } from '../../types';

interface Props {
  box: DetectionBox;
  containerWidth: number;
  containerHeight: number;
}

const BOX_COLORS: Record<DetectionBox['type'], { border: string; labelBg: string; labelText: string }> = {
  healthy:  { border: Colors.primary,    labelBg: Colors.secondary,       labelText: Colors.onSecondary },
  sick:     { border: Colors.error,      labelBg: Colors.error,            labelText: Colors.onError },
  inactive: { border: Colors.tertiary,   labelBg: Colors.tertiary,         labelText: Colors.onTertiary },
  dead:     { border: Colors.outline,    labelBg: Colors.surfaceVariant,   labelText: Colors.onSurface },
};

export function AIDetectionBox({ box, containerWidth, containerHeight }: Props) {
  const colors = BOX_COLORS[box.type];

  const x = useSharedValue(box.bbox.x * containerWidth);
  const y = useSharedValue(box.bbox.y * containerHeight);

  useEffect(() => {
    x.value = withSpring(box.bbox.x * containerWidth, { damping: 15, stiffness: 120 });
    y.value = withSpring(box.bbox.y * containerHeight, { damping: 15, stiffness: 120 });
  }, [box.bbox.x, box.bbox.y, containerWidth, containerHeight, x, y]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  const w = box.bbox.width * containerWidth;
  const h = box.bbox.height * containerHeight;

  return (
    <Animated.View
      style={[
        styles.box,
        {
          width: w,
          height: h,
          borderColor: colors.border,
          shadowColor: colors.border,
        },
        animStyle,
      ]}
    >
      <View style={[styles.label, { backgroundColor: colors.labelBg }]}>
        <Text style={[styles.labelText, { color: colors.labelText }]}>{box.label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2,
    borderRadius: 4,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  label: {
    position: 'absolute',
    top: -20,
    left: 0,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  labelText: {
    fontSize: 8,
    fontWeight: '700',
  },
});
