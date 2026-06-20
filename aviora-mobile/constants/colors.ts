export const Colors = {
  // Backgrounds
  background:                '#131313',
  surface:                   '#131313',
  surfaceContainer:          '#201f1f',
  surfaceContainerLow:       '#1c1b1b',
  surfaceContainerHigh:      '#2a2a2a',
  surfaceContainerHighest:   '#353534',
  surfaceContainerLowest:    '#0e0e0e',
  surfaceBright:             '#393939',
  surfaceVariant:            '#353534',
  surfaceDim:                '#131313',

  // Primary (green)
  primary:              '#8bd88e',
  primaryContainer:     '#1e6b2e',
  primaryFixed:         '#a6f5a8',
  primaryFixedDim:      '#8bd88e',
  onPrimary:            '#003910',
  onPrimaryContainer:   '#9be99d',
  onPrimaryFixed:       '#002107',
  onPrimaryFixedVariant:'#00531b',
  inversePrimary:       '#1f6c2f',

  // Secondary (green accent)
  secondary:            '#73db9a',
  secondaryContainer:   '#00834b',
  secondaryFixed:       '#8ff8b4',
  secondaryFixedDim:    '#73db9a',
  onSecondary:          '#00391d',
  onSecondaryContainer: '#e5ffe9',
  onSecondaryFixed:     '#00210f',
  onSecondaryFixedVariant: '#00522d',

  // Tertiary (amber)
  tertiary:             '#efc200',
  tertiaryContainer:    '#cea700',
  tertiaryFixed:        '#ffe083',
  tertiaryFixedDim:     '#eec200',
  onTertiary:           '#3c2f00',
  onTertiaryContainer:  '#4e3e00',
  onTertiaryFixed:      '#231b00',
  onTertiaryFixedVariant: '#574500',

  // Error (red)
  error:                '#ffb4ab',
  errorContainer:       '#93000a',
  onError:              '#690005',
  onErrorContainer:     '#ffdad6',

  // Text & borders
  onBackground:         '#e5e2e1',
  onSurface:            '#e5e2e1',
  onSurfaceVariant:     '#bfc9bb',
  inverseSurface:       '#e5e2e1',
  inverseOnSurface:     '#313030',
  surfaceTint:          '#8bd88e',
  outline:              '#8a9387',
  outlineVariant:       '#40493e',

  // Semantic (alert severity)
  critical:    '#ffb4ab',
  criticalBg:  '#93000a',
  warning:     '#efc200',
  warningBg:   '#cea700',
  info:        '#8bd88e',
  infoBg:      '#1e6b2e',

  // Status
  online:  '#73db9a',
  offline: '#ffb4ab',
} as const;

export type ColorKey = keyof typeof Colors;
