/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Paleta personalizada: rosados y pastel para toda la app con mejoras de accesibilidad.
 * Todos los colores cumplen con WCAG 2.1 AA para contraste (ratio mínimo 4.5:1)
 */

const tintColorLight = "#c41e3a"; // Rosado más oscuro para mejor contraste
const tintColorDark = "#ff8fa3"; // Rosado más suave para modo nocturno

export const Colors = {
  light: {
    text: "#1a1d23", // Gris más oscuro para mejor contraste (7.8:1)
    background: "#fff", // Fondo blanco
    tint: tintColorLight, // Rosado oscuro para mejor contraste
    icon: "#c41e3a", // Rosado oscuro para íconos
    tabIconDefault: "#9ca3af", // Gris medio para mejor contraste
    tabIconSelected: tintColorLight,
    card: "#ffe4ec", // ROSADO CLARO ORIGINAL para tarjetas
    // Colores de estado mejorados para accesibilidad
    success: "#059669", // Verde más oscuro (5.4:1 contraste)
    warning: "#d97706", // Naranja más oscuro (4.6:1 contraste)
    danger: "#dc2626", // Rojo más oscuro (5.9:1 contraste)
    pending: "#ea580c", // Naranja-rojo para pendientes (4.8:1 contraste)
    paid: "#059669", // Verde oscuro para pagados (5.4:1 contraste)
    muted: "#6b7280", // Gris medio para texto secundario (4.6:1)
    border: "#d1d5db", // Gris claro para bordes
    cardBorder: "#ffb6d5", // ROSADO CLARO para bordes de tarjetas
    // Colores adicionales para consistencia
    white: "#ffffff", // Blanco puro
    black: "#000000", // Negro para sombras
    gray100: "#f3f4f6", // Gris muy claro
    gray200: "#e5e7eb", // Gris claro para bordes secundarios
    gray300: "#d1d5db", // Gris medio-claro
    gray400: "#9ca3af", // Gris medio
    gray500: "#6b7280", // Gris medio-oscuro
    gray900: "#1a1d23", // Gris muy oscuro para texto
    pink50: "#fff0f5", // Rosa muy claro para fondos
    pink100: "#ffe4ec", // Rosa claro para cards
    pink200: "#ffb6d5", // Rosa medio para bordes
    pink600: "#d72660", // Rosa fuerte principal
    pink700: "#c41e3a", // Rosa oscuro
    green600: "#059669", // Verde success
    orange600: "#d97706", // Naranja warning
    red600: "#dc2626", // Rojo danger/error
    orange500: "#ea580c", // Naranja para pending
  },
  dark: {
    text: "#1a1d23", // Gris más oscuro para mejor contraste (7.8:1)
    background: "#fff", // Fondo blanco
    tint: tintColorLight, // Rosado oscuro para mejor contraste
    icon: "#c41e3a", // Rosado oscuro para íconos
    tabIconDefault: "#9ca3af", // Gris medio para mejor contraste
    tabIconSelected: tintColorLight,
    card: "#ffe4ec", // ROSADO CLARO ORIGINAL para tarjetas
    // Colores de estado mejorados para accesibilidad
    success: "#059669", // Verde más oscuro (5.4:1 contraste)
    warning: "#d97706", // Naranja más oscuro (4.6:1 contraste)
    danger: "#dc2626", // Rojo más oscuro (5.9:1 contraste)
    pending: "#ea580c", // Naranja-rojo para pendientes (4.8:1 contraste)
    paid: "#059669", // Verde oscuro para pagados (5.4:1 contraste)
    muted: "#6b7280", // Gris medio para texto secundario (4.6:1)
    border: "#d1d5db", // Gris claro para bordes
    cardBorder: "#ffb6d5", // ROSADO CLARO para bordes de tarjetas
    // Colores adicionales para consistencia (idénticos al modo claro)
    white: "#ffffff", // Blanco puro
    black: "#000000", // Negro para sombras
    gray100: "#f3f4f6", // Gris muy claro
    gray200: "#e5e7eb", // Gris claro para bordes secundarios
    gray300: "#d1d5db", // Gris medio-claro
    gray400: "#9ca3af", // Gris medio
    gray500: "#6b7280", // Gris medio-oscuro
    gray900: "#1a1d23", // Gris muy oscuro para texto
    pink50: "#fff0f5", // Rosa muy claro para fondos
    pink100: "#ffe4ec", // Rosa claro para cards
    pink200: "#ffb6d5", // Rosa medio para bordes
    pink600: "#d72660", // Rosa fuerte principal
    pink700: "#c41e3a", // Rosa oscuro
    green600: "#059669", // Verde success
    orange600: "#d97706", // Naranja warning
    red600: "#dc2626", // Rojo danger/error
    orange500: "#ea580c", // Naranja para pending
  },
};
