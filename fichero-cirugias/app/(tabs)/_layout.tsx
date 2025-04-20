import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Colores personalizados para la tab bar
  const activeColor = colorScheme === 'dark' ? '#ffb6d5' : '#d72660';
  const inactiveColor = colorScheme === 'dark' ? '#aaa' : '#bbb';
  const tabBarBg = colorScheme === 'dark' ? '#23272f' : '#fff';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: tabBarBg,
            borderTopColor: colorScheme === 'dark' ? '#353945' : '#eee',
            opacity: 1,
          },
          default: {
            backgroundColor: tabBarBg,
            borderTopColor: colorScheme === 'dark' ? '#353945' : '#eee',
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuration"
        options={{
          title: 'Configuración',
          tabBarIcon: ({ color }) => (
            <AntDesign name="setting" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
