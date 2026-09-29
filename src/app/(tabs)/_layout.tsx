import { Tabs } from 'expo-router';
import { BookOpen, Clock3, Dumbbell, History, Home, User } from 'lucide-react-native';
import type { ColorValue } from 'react-native';
import type { ReactNode } from 'react';

import { colors } from '@/constants/theme';

export default function TabLayout() {
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
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: icon(Home, 'Inicio') }} />
      <Tabs.Screen
        name="routines"
        options={{ title: 'Rutinas', tabBarIcon: icon(Dumbbell, 'Rutinas') }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'Historial', tabBarIcon: icon(History, 'Historial') }}
      />
      <Tabs.Screen name="exercises" options={{ title: 'Ejercicios', tabBarIcon: icon(BookOpen, 'Ejercicios') }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: icon(User, 'Perfil') }} />
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
