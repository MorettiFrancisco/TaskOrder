import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { useConfiguracion } from "../context/configuracionContext";
import { Colors } from "../../constants/Colors";
import { FontsSize } from "../../constants/FontsSize";
import { useColorScheme } from "react-native";

export default function ConfigurationScreen() {
  const { fontSize, setFontSize, exportarFichas, importarFichas } =
    useConfiguracion();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const backgroundColor = theme.background;
  const topInset =
    Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
      />
      <View
        style={[styles.header, { backgroundColor, paddingTop: topInset + 12 }]}
      >
        <Text
          style={[
            styles.headerText,
            {
              color: Colors.light.tint, // Siempre rosado fuerte para el título
              fontSize: FontsSize[fontSize] + 8,
              letterSpacing: 1.5,
            },
          ]}
        >
          ⚙️ Configuración
        </Text>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.optionContainer}>
          <Text
            style={[
              styles.label,
              { color: Colors.light.tint, fontSize: FontsSize[fontSize] },
            ]}
          >
            Tamaño de letra:
          </Text>
          <View style={styles.sizeList}>
            {(["pequeño", "mediano", "grande"] as const).map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => setFontSize(size)}
                style={[
                  styles.sizeOption,
                  fontSize === size && {
                    backgroundColor: Colors.light.tint,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: Colors.light.tint,
                  },
                ]}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.option,
                    {
                      color: fontSize === size ? theme.background : theme.tint,
                      fontWeight: fontSize === size ? "bold" : "normal",
                      fontSize: FontsSize[size],
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                    },
                  ]}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={exportarFichas}
            style={[styles.button, { backgroundColor: theme.tint }]}
            activeOpacity={0.85}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
              ⬆️ Exportar Fichas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={importarFichas}
            style={[styles.button, { backgroundColor: theme.success }]}
            activeOpacity={0.85}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
              ⬇️ Importar Fichas
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text
            style={{
              color: theme.icon,
              fontSize: 13,
              opacity: 0.7,
              textAlign: "center",
            }}
          >
            TaskOrder v2.0 • Hecho con ❤️
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray200,
    marginBottom: 10,
  },
  headerText: {
    fontWeight: "bold",
    fontFamily:
      Platform.OS === "ios" ? "Arial Rounded MT Bold" : "sans-serif-medium",
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  optionContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "bold",
    opacity: 0.95,
    textAlign: "center",
  },
  sizeList: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginTop: 4,
  },
  sizeOption: {
    marginHorizontal: 4,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: "transparent",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  option: {
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: Colors.light.black,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
});
