import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useConfiguracion } from "./context/configuracionContext";
import { Colors } from "../constants/Colors";
import { FontsSize } from "../constants/FontsSize";
import Ficha from "../models/ficha";
import { cargarFichas, eliminarFichaPorId } from "../utils/fichasStorage";
import { useColorScheme } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFocusEffect } from "@react-navigation/native";

export default function SingleFichaView() {
  const { id } = useLocalSearchParams();
  const { fontSize } = useConfiguracion();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const [ficha, setFicha] = React.useState<Ficha | null>(null);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      const fetchFicha = async () => {
        const fichas = await cargarFichas();
        const found = fichas.find((f) => f.id === Number(id));
        setFicha(found || null);
      };
      fetchFicha();
    }, [id])
  );

  const handleEditar = () => {
    if (!ficha) return;
    router.push({
      pathname: "/functions/modificarFicha",
      params: { id: ficha.id },
    });
  };

  const handleEliminar = () => {
    if (!ficha) return;
    Alert.alert(
      "Eliminar ficha",
      `¿Seguro que deseas eliminar la ficha de "${ficha.nombre_tecnica}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await eliminarFichaPorId(ficha.id);
            router.replace("/"); // <-- Ir al Home
          },
        },
      ]
    );
  };

  // Paleta de colores según tema
  const editBg = theme.tint; // rosado fuerte
  const editText = theme.background; // fondo claro/oscuro
  const deleteBg = theme.card; // rosado muy claro, igual en ambos temas
  const deleteText = theme.tint; // rosado fuerte

  if (!ficha) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, fontSize: FontsSize[fontSize] }}>
          Ficha no encontrada.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              { color: theme.text, fontSize: FontsSize[fontSize] + 6, flex: 1 },
            ]}
            numberOfLines={2}
          >
            {ficha.nombre_tecnica}
          </Text>
          <View style={styles.iconButtonRow}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleEditar}
              activeOpacity={0.7}
              accessibilityLabel="Editar ficha"
            >
              <AntDesign name="edit" size={22} color={theme.tint} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleEliminar}
              activeOpacity={0.7}
              accessibilityLabel="Eliminar ficha"
            >
              <AntDesign name="delete" size={22} color={theme.tint} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.infoGroup}>
          <Text
            style={[
              styles.label,
              { color: theme.tint, fontSize: FontsSize[fontSize] },
            ]}
          >
            Doctor:
          </Text>
          <Text
            style={[
              styles.value,
              { color: theme.text, fontSize: FontsSize[fontSize] },
            ]}
          >
            {ficha.doctor}
          </Text>
        </View>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text, fontSize: FontsSize[fontSize] + 2 },
          ]}
        >
          Descripción / Técnica Quirúrgica
        </Text>
        <Text
          style={[
            styles.description,
            { color: theme.text, fontSize: FontsSize[fontSize] },
          ]}
        >
          {ficha.descripcion}
        </Text>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text, fontSize: FontsSize[fontSize] + 2 },
          ]}
        >
          Materiales
        </Text>
        <Text
          style={[
            styles.description,
            { color: theme.text, fontSize: FontsSize[fontSize] },
          ]}
        >
          {ficha.materiales || "No especificados"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.light.black,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  iconButton: {
    padding: 6,
    borderRadius: 16,
    marginLeft: 2,
  },
  title: {
    fontWeight: "bold",
    textAlign: "left",
  },
  infoGroup: {
    flexDirection: "row",
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    marginRight: 6,
  },
  value: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    textAlign: "justify",
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
    elevation: 2,
    shadowColor: Colors.light.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: Colors.light.green600,
  },
  deleteButton: {
    backgroundColor: Colors.light.pink600,
  },
  actionText: {
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
