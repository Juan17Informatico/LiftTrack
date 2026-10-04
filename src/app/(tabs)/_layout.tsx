import { useTranslation } from '@/i18n';
import { Tabs } from 'expo-router';
import { BookOpen, Clock3, Dumbbell, History, Home, User } from 'lucide-react-native';
import type { ColorValue } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('Inicio'), tabBarIcon: icon(Home, t('Inicio')) }}
      />
      <Tabs.Screen
        name="routines"
        options={{ title: t('Rutinas'), tabBarIcon: icon(Dumbbell, t('Rutinas')) }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: t('Historial'), tabBarIcon: icon(History, t('Historial')) }}
      />
      <Tabs.Screen
        name="exercises"
        options={{ title: t('Ejercicios'), tabBarIcon: icon(BookOpen, t('Ejercicios')) }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('Perfil'), tabBarIcon: icon(User, t('Perfil')) }}
      />
    </Tabs>
  );
}

interface TabIconProps {
  focused: boolean;
  color: ColorValue;
  size: number;
}

function icon(Icon: typeof Clock3, name: string): (props: TabIconProps) => ReactNode {
  function TabIcon({ color, size }: TabIconProps) {
    return <Icon color={String(color)} size={size} />;
  }

  TabIcon.displayName = `${name}TabIcon`;
  return TabIcon;
}
