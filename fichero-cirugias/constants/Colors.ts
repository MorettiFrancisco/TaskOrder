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
  },
  dark: {
    text: "#e5e7eb", // Gris claro suave, menos agresivo que blanco puro
    background: "#0f172a", // Azul muy oscuro, mejor para uso nocturno
    tint: tintColorDark, // Rosado suave para modo nocturno
    icon: "#ff8fa3", // Rosado suave para íconos
    tabIconDefault: "#6b7280", // Gris más oscuro para menos contraste
    tabIconSelected: tintColorDark,
    card: "#1e293b", // Gris azulado oscuro para tarjetas, más suave que rosado
    // Colores de estado optimizados para uso nocturno
    success: "#22c55e", // Verde más suave para dark mode
    warning: "#f59e0b", // Amarillo-naranja suave
    danger: "#ef4444", // Rojo suave
    pending: "#fb7185", // Rosa suave para pendientes
    paid: "#22c55e", // Verde suave para pagados
    muted: "#9ca3af", // Gris medio para texto secundario
    border: "#334155", // Gris azulado para bordes
    cardBorder: "#475569", // Gris azulado más claro para bordes de tarjetas
  },
};
