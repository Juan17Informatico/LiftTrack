import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { darkColors, radius } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface BrandLogoProps {
  variant?: 'icon' | 'title';
  size?: number;
  trimVerticalSpace?: boolean;
}

// Visible artwork in logo-titulo-no-bg.png fits within rows 200–1100
// of its 1254px square canvas, including a small safety margin.
const TITLE_CANVAS_SIZE = 1254;
const TITLE_TOP_INSET = 200;
const TITLE_CONTENT_HEIGHT = 900;

export function BrandLogo({
  variant = 'icon',
  size = variant === 'title' ? 220 : 64,
  trimVerticalSpace = false,
}: BrandLogoProps) {
  const { dark } = useTheme();
  const trimTitle = variant === 'title' && trimVerticalSpace;
  const [availableWidth, setAvailableWidth] = useState(size);
  const imageSize = Math.min(size, availableWidth);
  const frameHeight = trimTitle
    ? (imageSize * TITLE_CONTENT_HEIGHT) / TITLE_CANVAS_SIZE
    : imageSize;

  return (
    <View
      onLayout={({ nativeEvent }) => setAvailableWidth(nativeEvent.layout.width)}
      style={[
        styles.frame,
        variant === 'title' && !dark && styles.logoBackdrop,
        { width: size, height: frameHeight },
      ]}
    >
      <Image
        accessibilityLabel="LiftTrack"
        accessible
        resizeMode="contain"
        source={
          variant === 'title'
            ? require('../../assets/logo-titulo-no-bg.png')
            : require('../../assets/logo-no-bg.png')
        }
        style={[
          styles.logo,
          {
            width: imageSize,
            height: imageSize,
            top: trimTitle ? (-imageSize * TITLE_TOP_INSET) / TITLE_CANVAS_SIZE : 0,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoBackdrop: {
    // The supplied title artwork has white lettering.
    backgroundColor: darkColors.background,
    borderRadius: radius.md,
  },
  frame: {
    alignSelf: 'center',
    maxWidth: '100%',
    flexShrink: 0,
    overflow: 'hidden',
  },
  logo: {
    position: 'absolute',
    left: 0,
  },
});
