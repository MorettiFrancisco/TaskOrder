import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { cargarPagos, guardarPagos } from "../../utils/paymentsStorage";
import { cargarFichas } from "../../utils/fichasStorage";
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrency,
} from "./formatCurrency";
import Payment from "../../models/payment";
import Ficha from "../../models/ficha";
import { useConfiguracion } from "../context/configuracionContext";
import { useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";
import { FontsSize } from "../../constants/FontsSize";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ModificarPagoScreen() {
  const { paymentId } = useLocalSearchParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { fontSize } = useConfiguracion();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  useEffect(() => {
    loadPaymentData();
  }, [paymentId]);

  const handleAmountChange = (text: string) => {
    // Format input as user types for currency
    const formatted = formatCurrencyInput(text);
    setAmount(formatted);
  };

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const pagos = await cargarPagos();
      const fichas = await cargarFichas();

      const foundPayment = pagos.find((p) => p.id.toString() === paymentId);
      if (foundPayment) {
        setPayment(foundPayment);
        setAmount(
          foundPayment.amount ? formatCurrency(foundPayment.amount) : ""
        );

        const foundFicha = fichas.find((f) => f.id === foundPayment.fichaId);
        setFicha(foundFicha || null);
      } else {
        Alert.alert("Error", "No se encontró el pago especificado");
        router.back();
      }
    } catch (error) {
      console.error("Error loading payment data:", error);
      Alert.alert("Error", "Error al cargar los datos del pago");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!payment) return;

    // Si el pago ya tiene un monto establecido, solo cambiar el estado
    const finalAmount = payment.amount || parseCurrency(amount);

    // Si no hay monto y es necesario, validar
    if (
      !payment.amount &&
      (!amount || isNaN(parseCurrency(amount)) || parseCurrency(amount) <= 0)
    ) {
      Alert.alert("Error", "Por favor ingrese un monto válido mayor a 0");
      return;
    }

    try {
      setSaving(true);
      const pagos = await cargarPagos();
      const updatedPayments = pagos.map((p) => {
        if (p.id === payment.id) {
          return {
            ...p,
            paymentStatus: "paid" as const,
            amount: finalAmount,
            paymentDate: new Date(),
          };
        }
        return p;
      });

      await guardarPagos(updatedPayments);
      Alert.alert("Éxito", "Pago marcado como pagado correctamente", [
        { text: "OK", onPress: () => router.push("/(tabs)/payment") },
      ]);
    } catch (error) {
      console.error("Error updating payment:", error);
      Alert.alert("Error", "Error al actualizar el pago");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!payment) return;

    Alert.alert(
      "Confirmar eliminación",
      "¿Está seguro de que desea eliminar este pago?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              const pagos = await cargarPagos();
              const filteredPayments = pagos.filter((p) => p.id !== payment.id);
              await guardarPagos(filteredPayments);
              Alert.alert("Éxito", "Pago eliminado correctamente", [
                { text: "OK", onPress: () => router.push("/(tabs)/payment") },
              ]);
            } catch (error) {
              console.error("Error deleting payment:", error);
              Alert.alert("Error", "Error al eliminar el pago");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text
            style={[
              styles.loadingText,
              { color: theme.text, fontSize: FontsSize[fontSize] },
            ]}
          >
            Cargando pago...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!payment || !ficha) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.errorContainer}>
          <Text
            style={[
              styles.errorText,
              { color: theme.text, fontSize: FontsSize[fontSize] },
            ]}
          >
            No se pudo cargar la información del pago
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.tint }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Payment Information Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: theme.tint, fontSize: FontsSize[fontSize] + 2 },
            ]}
          >
            Información del Pago
          </Text>

          <View style={styles.infoRow}>
            <Text
              style={[
                styles.label,
                { color: theme.text, fontSize: FontsSize[fontSize] },
              ]}
            >
              🩺 Técnica:
            </Text>
            <Text
              style={[
                styles.value,
                { color: theme.text, fontSize: FontsSize[fontSize] },
              ]}
            >
              {ficha.nombre_tecnica}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text
              style={[
                styles.label,
                { color: theme.text, fontSize: FontsSize[fontSize] },
              ]}
            >
              👨‍⚕️ Doctor que realizó:
            </Text>
            <Text
              style={[
                styles.value,
                { color: theme.text, fontSize: FontsSize[fontSize] },
              ]}
            >
              {payment.doctor}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text
              style={[
                styles.label,
                { color: theme.text, fontSize: FontsSize[fontSize] },
              ]}
            >
              📊 Estado:
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    payment.paymentStatus === "paid"
                      ? theme.paid
                      : theme.pending,
                },
              ]}
            >
              <Text style={styles.statusText}>
                {payment.paymentStatus === "paid" ? "Pagado" : "Pendiente"}
              </Text>
            </View>
          </View>

          {payment.paymentDate && (
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.label,
                  { color: theme.text, fontSize: FontsSize[fontSize] },
                ]}
              >
                📅 Fecha de pago:
              </Text>
              <Text
                style={[
                  styles.value,
                  { color: theme.text, fontSize: FontsSize[fontSize] },
                ]}
              >
                {new Date(payment.paymentDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Amount Display (read-only once set) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: theme.tint, fontSize: FontsSize[fontSize] + 2 },
            ]}
          >
            Monto del Pago
          </Text>

          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.inputLabel,
                { color: theme.text, fontSize: FontsSize[fontSize] },
              ]}
            >
              💰 Monto establecido:
            </Text>
            {payment.amount ? (
              <View
                style={[
                  styles.amountDisplay,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.amountText,
                    {
                      color: theme.tint,
                      fontSize: FontsSize[fontSize] + 2,
                    },
                  ]}
                >
                  {formatCurrency(payment.amount)}
                </Text>
                <Text
                  style={[
                    styles.amountSubtext,
                    { color: theme.text, fontSize: FontsSize[fontSize] - 1 },
                  ]}
                >
                  Monto no modificable una vez establecido
                </Text>
              </View>
            ) : (
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                    fontSize: FontsSize[fontSize],
                  },
                ]}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="$0,00"
                placeholderTextColor={theme.muted}
                keyboardType="numeric"
                editable={!saving}
              />
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {payment.paymentStatus === "pending" && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                { backgroundColor: theme.success },
                saving && styles.disabledButton,
              ]}
              onPress={handleMarkAsPaid}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.white} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color={theme.white} />
                  <Text
                    style={[
                      styles.buttonText,
                      { fontSize: FontsSize[fontSize] },
                    ]}
                  >
                    Marcar como Pagado
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.dangerButton,
              { backgroundColor: theme.danger },
              saving && styles.disabledButton,
            ]}
            onPress={handleDeletePayment}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Ionicons name="trash" size={20} color={theme.white} />
            <Text
              style={[styles.buttonText, { fontSize: FontsSize[fontSize] }]}
            >
              Eliminar Pago
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    fontFamily:
      Platform.OS === "ios" ? "Arial Rounded MT Bold" : "sans-serif-medium",
  },
  headerSpacer: {
    width: 40,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: Colors.light.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  label: {
    fontWeight: "600",
    marginRight: 8,
    minWidth: 120,
    flexShrink: 0,
  },
  value: {
    flex: 1,
    flexWrap: "wrap",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  buttonContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 48,
  },
  primaryButton: {
    gap: 8,
  },
  dangerButton: {
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.light.white,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 20,
  },
  amountDisplay: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    minHeight: 48,
  },
  amountText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  amountSubtext: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 4,
  },
});
