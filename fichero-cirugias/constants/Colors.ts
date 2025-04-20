/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Paleta personalizada: rosados y pastel para toda la app.
 */

const tintColorLight = '#d72660'; // Rosado fuerte
const tintColorDark = '#ffb6d5';  // Rosado pastel claro

export const Colors = {
  light: {
    text: '#23272f',           // Gris oscuro para buena lectura
    background: '#fff',        // Fondo blanco
    tint: tintColorLight,      // Rosado fuerte
    icon: '#d72660',           // Rosado fuerte para íconos
    tabIconDefault: '#ffb6d5', // Rosado pastel claro
    tabIconSelected: tintColorLight,
    card: '#ffe4ec',           // Rosado pastel para tarjetas
  },
  dark: {
    text: '#fff',              // Texto blanco
    background: '#23272f',     // Gris oscuro azulado
    tint: tintColorDark,       // Rosado pastel claro
    icon: '#ffb6d5',           // Rosado pastel claro para íconos
    tabIconDefault: '#ffb6d5',
    tabIconSelected: tintColorDark,
    card: '#2a2e37',           // Gris azulado para tarjetas en dark
  },
};
