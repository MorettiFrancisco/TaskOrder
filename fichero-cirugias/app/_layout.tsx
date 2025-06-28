import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { ConfiguracionProvider } from "./context/configuracionContext";
import { Colors } from "@/constants/Colors";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // Mueve useMemo antes del return
  const theme = useMemo(() => {
    if (colorScheme === "dark") {
      return {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: Colors.dark.pink200,
          card: Colors.dark.background,
          border: Colors.dark.border,
          text: Colors.dark.text,
        },
      };
    } else {
      return {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: Colors.light.pink600,
          card: Colors.light.background,
          border: Colors.light.border,
          text: Colors.light.text,
        },
      };
    }
  }, [colorScheme]);

  // Ahora sí, después de todos los hooks:
  if (!loaded) return null;

  const stackElement = (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen
          name="functions/agregarFicha"
          options={{ title: "Agregar Ficha" }}
        />
        <Stack.Screen
          name="functions/modificarFicha"
          options={{ title: "Modificar Ficha" }}
        />
        <Stack.Screen
          name="singleFichaView"
          options={{ title: "Visualizando Ficha" }}
        />
        <Stack.Screen
          name="functions/modificarPago"
          options={{ title: "Modificar Pago" }}
        />
        <Stack.Screen
          name="functions/agregarPago"
          options={{ title: "Agregar Pago" }}
        />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </>
  );

  return (
    <ConfiguracionProvider>
      <ThemeProvider value={theme} children={stackElement} />
    </ConfiguracionProvider>
  );
}
