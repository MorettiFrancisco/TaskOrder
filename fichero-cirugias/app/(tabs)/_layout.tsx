import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "../../constants/Colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  // Colores personalizados para la tab bar usando el nuevo tema
  const activeColor = theme.tint;
  const inactiveColor = theme.tabIconDefault;
  const tabBarBg = theme.background;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: tabBarBg,
            borderTopColor: theme.border,
            opacity: 1,
          },
          default: {
            backgroundColor: tabBarBg,
            borderTopColor: theme.border,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: "Pagos",
          tabBarIcon: ({ color }: { color: string }) => (
            <AntDesign name="creditcard" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuration"
        options={{
          title: "Configuración",
          tabBarIcon: ({ color }: { color: string }) => (
            <AntDesign name="setting" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
