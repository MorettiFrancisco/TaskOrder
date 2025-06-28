import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { cargarFichas } from "../../utils/fichasStorage";
import { agregarPago, cargarPagos } from "../../utils/paymentsStorage";
import { formatCurrencyInput, parseCurrency } from "./formatCurrency";
import Ficha from "../../models/ficha";
import Payment from "../../models/payment";
import { useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";
import { FontsSize } from "../../constants/FontsSize";
import { useConfiguracion } from "../context/configuracionContext";

export default function AgregarPagoScreen() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fichaModalVisible, setFichaModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Payment form fields
  const [doctor, setDoctor] = useState("");
  const [paymentSource, setPaymentSource] = useState<"clinic" | "patient">(
    "patient"
  );
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid">(
    "pending"
  );
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const router = useRouter();
  const colorScheme = useColorScheme();
  const { fontSize } = useConfiguracion();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const fichasData = await cargarFichas();
          const pagosData = await cargarPagos();
          setFichas(fichasData);
          setPagos(pagosData);
        } catch (error) {
          Alert.alert("Error", "No se pudieron cargar los datos");
        }
      };
      fetchData();
    }, [])
  );

  const resetForm = useCallback(() => {
    setDoctor("");
    setPaymentSource("patient");
    setPaymentStatus("pending");
    setAmount("");
    setNotes("");
    setSelectedFicha(null);
  }, []);

  const handleAmountChange = useCallback((text: string) => {
    const formatted = formatCurrencyInput(text);
    setAmount(formatted);
  }, []);

  const handleSelectFicha = useCallback((ficha: Ficha) => {
    setSelectedFicha(ficha);
    setFichaModalVisible(false);
    setModalVisible(true);
  }, []);

  const handleSavePayment = useCallback(async () => {
    if (!selectedFicha) {
      Alert.alert("Error", "Debe seleccionar una cirugía");
      return;
    }

    if (!doctor.trim()) {
      Alert.alert(
        "Error",
        "Debe ingresar el nombre del doctor que realizó la cirugía"
      );
      return;
    }

    if (
      paymentSource === "patient" &&
      (!amount.trim() ||
        isNaN(parseCurrency(amount)) ||
        parseCurrency(amount) <= 0)
    ) {
      Alert.alert(
        "Error",
        "Debe ingresar un monto válido para pagos de paciente"
      );
      return;
    }

    try {
      const paymentAmount =
        paymentSource === "patient" ? parseCurrency(amount) : undefined;
      const currentDate = new Date();

      const newPayment = new Payment(
        Date.now(),
        selectedFicha.id,
        doctor.trim(),
        paymentSource,
        paymentStatus,
        paymentAmount,
        paymentStatus === "paid" ? currentDate : undefined,
        notes.trim() || undefined
      );

      await agregarPago(newPayment);
      setPagos((prev) => [...prev, newPayment]);
      Alert.alert("Éxito", "Pago agregado correctamente");

      setModalVisible(false);
      resetForm();

      router.push("/(tabs)/payment");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el pago");
    }
  }, [
    selectedFicha,
    doctor,
    paymentSource,
    amount,
    paymentStatus,
    notes,
    resetForm,
    router,
  ]);

  const filteredFichas = useMemo(() => {
    if (!searchQuery.trim()) {
      return fichas;
    }
    return fichas.filter((ficha) =>
      ficha.nombre_tecnica.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [fichas, searchQuery]);

  const commonTextStyle = { color: theme.text, fontSize: FontsSize[fontSize] };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Search Box */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: theme.text,
                borderColor: theme.tint,
                backgroundColor: theme.background,
                fontSize: FontsSize[fontSize],
              },
            ]}
            placeholder="Buscar por técnica quirúrgica..."
            placeholderTextColor={theme.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Técnicas Quirúrgicas Disponibles */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.tint, fontSize: FontsSize[fontSize] + 2 },
            ]}
          >
            🏥 Técnicas Quirúrgicas Disponibles ({filteredFichas.length})
          </Text>

          {filteredFichas.length === 0 ? (
            <Text style={[styles.emptyText, { ...commonTextStyle }]}>
              {searchQuery.trim()
                ? `📝 No se encontraron técnicas que coincidan con "${searchQuery}"`
                : "📝 No hay técnicas quirúrgicas registradas"}
            </Text>
          ) : (
            filteredFichas.map((ficha) => (
              <TouchableOpacity
                key={ficha.id}
                style={[
                  styles.fichaCard,
                  {
                    borderColor: theme.cardBorder,
                    backgroundColor: theme.card,
                  },
                ]}
                onPress={() => handleSelectFicha(ficha)}
              >
                <Text
                  style={[
                    styles.fichaTitle,
                    {
                      color: theme.tint,
                      fontSize: FontsSize[fontSize] + 1,
                    },
                  ]}
                >
                  {ficha.nombre_tecnica}
                </Text>
                <Text style={[styles.fichaDetail, { ...commonTextStyle }]}>
                  👨‍⚕️ {ficha.doctor}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Ficha Selection Modal (Currently not used, replaced by direct selection) */}
      {/* This modal logic seems to be redundant as handleSelectFicha directly sets modalVisible to true.
          It's kept commented out in case it's part of a different flow or future functionality.
      <Modal
        visible={fichaModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFichaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.background }]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: theme.text, fontSize: FontsSize[fontSize] + 4 },
              ]}
            >
              Seleccionar Cirugía
            </Text>

            <ScrollView style={styles.modalList}>
              {filteredFichas.map((ficha) => (
                <TouchableOpacity
                  key={ficha.id}
                  style={[
                    styles.modalFichaItem,
                    {
                      borderColor: theme.cardBorder,
                      backgroundColor: theme.card,
                    },
                  ]}
                  onPress={() => handleSelectFicha(ficha)}
                >
                  <Text
                    style={[
                      styles.modalFichaTitle,
                      {
                        color: theme.tint,
                        fontSize: FontsSize[fontSize] + 1,
                      },
                    ]}
                  >
                    {ficha.nombre_tecnica}
                  </Text>
                  <Text
                    style={[
                      styles.modalFichaDetail,
                      { ...commonTextStyle },
                    ]}
                  >
                    👨‍⚕️ {ficha.doctor}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.muted }]}
              onPress={() => setFichaModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}

      {/* Payment Form Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.background }]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: theme.text, fontSize: FontsSize[fontSize] + 4 },
              ]}
            >
              Agregar Pago
            </Text>

            {selectedFicha && (
              <Text
                style={[
                  styles.modalSubtitle,
                  {
                    color: theme.tint,
                    fontSize: FontsSize[fontSize] + 1,
                  },
                ]}
              >
                {selectedFicha.nombre_tecnica}
              </Text>
            )}

            <ScrollView style={styles.formContainer}>
              {/* Doctor */}
              <Text style={[styles.inputLabel, { ...commonTextStyle }]}>
                Doctor que realizó la cirugía:
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={doctor}
                onChangeText={setDoctor}
                placeholder="Nombre del doctor que realizó la cirugía"
                placeholderTextColor={theme.muted}
              />

              {/* Payment Source */}
              <Text style={[styles.inputLabel, { ...commonTextStyle }]}>
                Fuente de Pago:
              </Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    {
                      borderColor:
                        paymentSource === "patient" ? theme.tint : theme.border,
                    },
                  ]}
                  onPress={() => setPaymentSource("patient")}
                >
                  <View
                    style={[
                      styles.radioInner,
                      {
                        backgroundColor:
                          paymentSource === "patient"
                            ? theme.tint
                            : "transparent",
                      },
                    ]}
                  />
                  <Text style={[styles.radioText, { ...commonTextStyle }]}>
                    Paciente
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    {
                      borderColor:
                        paymentSource === "clinic" ? theme.tint : theme.border,
                    },
                  ]}
                  onPress={() => setPaymentSource("clinic")}
                >
                  <View
                    style={[
                      styles.radioInner,
                      {
                        backgroundColor:
                          paymentSource === "clinic"
                            ? theme.tint
                            : "transparent",
                      },
                    ]}
                  />
                  <Text style={[styles.radioText, { ...commonTextStyle }]}>
                    Clínica
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Payment Status */}
              <Text style={[styles.inputLabel, { ...commonTextStyle }]}>
                Estado del Pago:
              </Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    {
                      borderColor:
                        paymentStatus === "pending"
                          ? theme.pending
                          : theme.border,
                    },
                  ]}
                  onPress={() => setPaymentStatus("pending")}
                >
                  <View
                    style={[
                      styles.radioInner,
                      {
                        backgroundColor:
                          paymentStatus === "pending"
                            ? theme.pending
                            : "transparent",
                      },
                    ]}
                  />
                  <Text style={[styles.radioText, { ...commonTextStyle }]}>
                    Pendiente
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    {
                      borderColor:
                        paymentStatus === "paid" ? theme.paid : theme.border,
                    },
                  ]}
                  onPress={() => setPaymentStatus("paid")}
                >
                  <View
                    style={[
                      styles.radioInner,
                      {
                        backgroundColor:
                          paymentStatus === "paid" ? theme.paid : "transparent",
                      },
                    ]}
                  />
                  <Text style={[styles.radioText, { ...commonTextStyle }]}>
                    Pagado
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Amount (only for patient payments) */}
              {paymentSource === "patient" && (
                <>
                  <Text style={[styles.inputLabel, { ...commonTextStyle }]}>
                    Monto:
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.card,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    value={amount}
                    onChangeText={handleAmountChange}
                    placeholder="$0,00"
                    placeholderTextColor={theme.muted}
                    keyboardType="numeric"
                  />
                </>
              )}

              {/* Notes */}
              <Text style={[styles.inputLabel, { ...commonTextStyle }]}>
                Notas (opcional):
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Notas adicionales..."
                placeholderTextColor={theme.muted}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.gray400 }]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.tint }]}
                onPress={handleSavePayment}
              >
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: Colors.light.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  fichaCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fichaTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  fichaDetail: {
    marginBottom: 2,
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: Colors.light.black,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalTitle: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  modalList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  modalFichaItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  modalFichaTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  modalFichaDetail: {
    fontSize: 14,
  },
  formContainer: {
    maxHeight: 400,
    marginBottom: 20,
  },
  inputLabel: {
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 12,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  radioText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: Colors.light.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});
