import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { useConfiguracion } from "../context/configuracionContext";
import { Colors } from "../../constants/Colors";
import { FontsSize } from "../../constants/FontsSize";
import { cargarFichas } from "../../utils/fichasStorage";
import Ficha from "../../models/ficha";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { fontSize } = useConfiguracion();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const backgroundColor = theme.background;
  const suggestionsBg = theme.card;
  const suggestionItemBorder = theme.cardBorder;

  const fontMain = FontsSize[fontSize];
  const fontBig = fontMain + 2;
  const fontSmall = fontMain - 2;

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        const data = await cargarFichas();
        setFichas(data);
      };
      fetchData();
    }, [])
  );

  const filteredFichas = fichas.filter(
    (item) =>
      item.nombre_tecnica.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFicha = ({ item }: { item: Ficha }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          shadowColor: theme.tint,
          borderColor: theme.border,
        },
      ]}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/singleFichaView",
          params: { id: item.id },
        })
      }
    >
      <Text
        style={[styles.technique, { color: theme.tint, fontSize: fontBig }]}
      >
        {item.nombre_tecnica}
      </Text>
      <Text style={[styles.doctor, { color: theme.text, fontSize: fontMain }]}>
        Doctor: {item.doctor}
      </Text>
      <Text
        style={[styles.description, { color: theme.text, fontSize: fontSmall }]}
        numberOfLines={2}
      >
        {item.descripcion}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <View
        style={[
          styles.safeContainer,
          {
            backgroundColor,
            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          },
        ]}
      >
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={backgroundColor}
        />
        <View style={[styles.header, { backgroundColor }]}>
          <Text style={[styles.appTitle, { color: theme.tint }]}>
            Fichero Cirugías
          </Text>
        </View>

        <View style={styles.container}>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    color: theme.text,
                    borderColor: theme.tint,
                    backgroundColor: theme.card,
                    fontSize: fontMain,
                  },
                ]}
                placeholder="Buscar por técnica o doctor..."
                placeholderTextColor={theme.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
            </View>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: theme.tint, marginLeft: 8 },
              ]}
              onPress={() => router.push("/functions/agregarFicha")}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  color: theme.background,
                  fontSize: 28,
                  fontWeight: "bold",
                }}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>

          {searchQuery.length > 0 && (
            <View
              style={[
                styles.suggestionsContainer,
                { backgroundColor: suggestionsBg },
              ]}
            >
              {[
                ...fichas
                  .flatMap((f) => [f.nombre_tecnica, f.doctor])
                  .filter((item) =>
                    item.toLowerCase().startsWith(searchQuery.toLowerCase())
                  )
                  .filter((item, idx, arr) => arr.indexOf(item) === idx)
                  .slice(0, 5),
              ].map((suggestion, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSearchQuery(suggestion)}
                  style={[
                    styles.suggestionItem,
                    { borderBottomColor: suggestionItemBorder },
                  ]}
                >
                  <Text style={{ color: theme.text }}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <FlatList
            data={filteredFichas}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text
                style={{
                  color: theme.icon,
                  textAlign: "center",
                  marginTop: 40,
                }}
              >
                No hay fichas para mostrar.
              </Text>
            }
            renderItem={renderFicha}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray200,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 1,
    fontFamily:
      Platform.OS === "ios" ? "Arial Rounded MT Bold" : "sans-serif-medium",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  searchBox: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 1,
  },
  searchInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    borderWidth: 1,
  },
  technique: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  doctor: {
    marginBottom: 2,
  },
  description: {
    marginTop: 4,
    lineHeight: 18,
  },
  suggestionsContainer: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    borderRadius: 8,
    zIndex: 10,
    elevation: 4,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 150,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
  },
});
