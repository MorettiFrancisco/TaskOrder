import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  BackHandler,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  agregarFicha,
  existeFichaPorTecnica,
  obtenerFichaPorTecnica,
} from "../../utils/fichasStorage";
import Ficha from "../../models/ficha";
import { useColorScheme } from "react-native";

export default function AgregarFichaScreen() {
  const [nombreTecnica, setNombreTecnica] = useState("");
  const [doctor, setDoctor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [materiales, setMateriales] = useState("");
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  const backgroundColor = colorScheme === "dark" ? "#23272f" : "#fff";
  const textColor = colorScheme === "dark" ? "#fff" : "#23272f";
  const inputBg = colorScheme === "dark" ? "#2a2e37" : "#f9f9f9";
  const borderColor = colorScheme === "dark" ? "#555" : "#ccc";
  const buttonBg = "#d72660";
  const buttonText = "#fff";

  // Flags para manejar alertas y navegación
  const alertVisible = useRef(false);
  const confirmedExit = useRef(false);

  /**
   * Muestra alerta de confirmación si hay datos ingresados.
   * Retorna true si bloquea la navegación (alerta en pantalla), false si permite continuar.
   */
  const confirmExit = useCallback(
    (onConfirm?: () => void) => {
      if (alertVisible.current) {
        return true; // Ya mostrando alerta, bloquea navegación
      }
      if (confirmedExit.current) {
        return false; // Confirmación previa, permite navegación
      }
      if (nombreTecnica || doctor || descripcion || materiales) {
        alertVisible.current = true;
        Alert.alert(
          "Cancelar",
          "¿Seguro que deseas cancelar? Se perderán los datos ingresados.",
          [
            {
              text: "No",
              style: "cancel",
              onPress: () => {
                alertVisible.current = false;
              },
            },
            {
              text: "Sí",
              style: "destructive",
              onPress: () => {
                alertVisible.current = false;
                confirmedExit.current = true;
                if (onConfirm) {
                  onConfirm();
                } else {
                  router.replace("/");
                }
              },
            },
          ],
          { cancelable: false }
        );
        return true;
      }
      return false; // Sin datos, no bloquea
    },
    [nombreTecnica, doctor, descripcion, materiales, router]
  );

  // Manejo de botón físico y flecha de back
  useFocusEffect(
    useCallback(() => {
      alertVisible.current = false;
      confirmedExit.current = false;

      const onBackPress = () => {
        // Si retorna true, bloquea el back y muestra alerta
        if (
          confirmExit(() => {
            confirmedExit.current = true;
            router.replace("/");
          })
        ) {
          return true;
        }
        return false; // Permite back si no hay datos
      };

      const backHandlerSubscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        const hasUnsavedChanges =
          nombreTecnica || doctor || descripcion || materiales;

        if (
          !hasUnsavedChanges ||
          confirmedExit.current ||
          alertVisible.current
        ) {
          return; // Permite la navegación
        }

        // Mostrar la confirmación
        alertVisible.current = true;
        Alert.alert(
          "Cancelar",
          "¿Seguro que deseas cancelar? Se perderán los datos ingresados.",
          [
            {
              text: "No",
              style: "cancel",
              onPress: () => {
                alertVisible.current = false;
              },
            },
            {
              text: "Sí",
              style: "destructive",
              onPress: () => {
                alertVisible.current = false;
                confirmedExit.current = true;
                navigation.dispatch(e.data.action);
              },
            },
          ],
          { cancelable: false }
        );
      });

      return () => {
        backHandlerSubscription.remove();
        unsubscribe();
        alertVisible.current = false;
        confirmedExit.current = false;
      };
    }, [confirmExit, navigation, router])
  );

  // Manejo de guardar ficha
  const handleGuardar = async () => {
    if (
      !nombreTecnica.trim() ||
      !doctor.trim() ||
      !descripcion.trim() ||
      !materiales.trim()
    ) {
      Alert.alert(
        "Error",
        "Los campos Técnica, Doctor, Descripción y Materiales son obligatorios."
      );
      return;
    }

    if (await existeFichaPorTecnica(nombreTecnica)) {
      const fichaExistente = await obtenerFichaPorTecnica(nombreTecnica);
      const doctorExistente = fichaExistente
        ? fichaExistente.doctor
        : "Desconocido";
      Alert.alert(
        "Ficha existente",
        `Ya existe una ficha con ese nombre de técnica.\nDoctor: ${doctorExistente}\n¿Desea agregar igualmente?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Agregar",
            style: "default",
            onPress: async () => {
              const nuevaFicha = new Ficha(
                Date.now(),
                nombreTecnica.trim(),
                doctor.trim(),
                descripcion.trim(),
                materiales.trim()
              );
              await agregarFicha(nuevaFicha);
              Alert.alert("Éxito", "Ficha agregada correctamente.", [
                {
                  text: "OK",
                  onPress: () => {
                    confirmedExit.current = true;
                    router.back();
                  },
                },
              ]);
            },
          },
        ]
      );
      return;
    }

    const nuevaFicha = new Ficha(
      Date.now(),
      nombreTecnica.trim(),
      doctor.trim(),
      descripcion.trim(),
      materiales.trim()
    );
    await agregarFicha(nuevaFicha);
    Alert.alert("Éxito", "Ficha agregada correctamente.", [
      {
        text: "OK",
        onPress: () => {
          confirmedExit.current = true;
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
      <View
        style={[
          styles.form,
          {
            backgroundColor: colorScheme === "dark" ? "#292d36" : "#fff",
            borderColor,
          },
        ]}
      >
        <Text style={[styles.title, { color: textColor }]}>Agregar Ficha</Text>
        <Text style={[styles.label, { color: textColor }]}>
          Nombre de la Técnica
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: inputBg, color: textColor, borderColor },
          ]}
          value={nombreTecnica}
          onChangeText={setNombreTecnica}
          placeholder="Ej: Colecistectomía"
          placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#888"}
          autoCapitalize="sentences"
        />
        <Text style={[styles.label, { color: textColor }]}>Doctor</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: inputBg, color: textColor, borderColor },
          ]}
          value={doctor}
          onChangeText={setDoctor}
          placeholder="Ej: Dr. Pérez"
          placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#888"}
          autoCapitalize="words"
        />
        <Text style={[styles.label, { color: textColor }]}>
          Descripción / Técnica Quirúrgica
        </Text>
        <TextInput
          style={[
            styles.textArea,
            { backgroundColor: inputBg, color: textColor, borderColor },
          ]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describa la técnica quirúrgica en detalle..."
          placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#888"}
          multiline
          textAlignVertical="top"
        />
        <Text style={[styles.label, { color: textColor }]}>Materiales</Text>
        <TextInput
          style={[
            styles.textArea,
            { backgroundColor: inputBg, color: textColor, borderColor },
          ]}
          value={materiales}
          onChangeText={setMateriales}
          placeholder="Liste los materiales necesarios para la cirugía..."
          placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#888"}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonBg }]}
          onPress={handleGuardar}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, { color: buttonText }]}>
            Guardar Ficha
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  form: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 4,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
  },
  button: {
    marginTop: 18,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 24,
    elevation: 2,
    shadowColor: "#d72660",
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
