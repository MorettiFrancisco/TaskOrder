import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ConfiguracionProvider } from './context/configuracionContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // Mueve useMemo antes del return
  const theme = useMemo(() => {
    if (colorScheme === 'dark') {
      return {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary:   '#ffb6d5',
          card:      '#23272f',
          border:    '#353945',
          text:      '#fff',
        }
      };
    } else {
      return {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary:   '#d72660',
          card:      '#fff',
          border:    '#eee',
          text:      '#000',
        }
      };
    }
  }, [colorScheme]);

  // Ahora sí, después de todos los hooks:
  if (!loaded) return null;

  return (
    <ConfiguracionProvider>
      <ThemeProvider value={theme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen
            name="functions/agregarFicha"
            options={{ title: 'Agregar Ficha' }}
          />
          <Stack.Screen
            name="functions/modificarFicha"
            options={{ title: 'Modificar Ficha' }}
          />
          <Stack.Screen
            name="singleFichaView"
            options={{ title: 'Visualizando Ficha' }}
          />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </ConfiguracionProvider>
  );
}
