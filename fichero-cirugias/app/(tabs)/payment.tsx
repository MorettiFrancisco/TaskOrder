import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { cargarFichas } from "../../utils/fichasStorage";
import { cargarPagos } from "../../utils/paymentsStorage";
import { formatCurrency } from "../functions/formatCurrency";
import Ficha from "../../models/ficha";
import Payment from "../../models/payment";
import { useConfiguracion } from "../context/configuracionContext";
import { useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";
import { FontsSize } from "../../constants/FontsSize";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function PaymentScreen() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [allPagos, setAllPagos] = useState<Payment[]>([]);
  const [showToBePaid, setShowToBePaid] = useState(true);
  const [showPaid, setShowPaid] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const router = useRouter();
  const { fontSize } = useConfiguracion();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const backgroundColor = theme.background;

  // Card background colors consistent with other screens using new palette
  const cardBg = theme.card;
  const borderColor = theme.cardBorder;

  // Get only payments that are completed (paid)
  const completedPayments = pagos.filter(
    (payment) => payment.paymentStatus === "paid"
  );

  // Get only payments that are pending
  const pendingPayments = pagos.filter(
    (payment) => payment.paymentStatus === "pending"
  );

  const totalPending = pendingPayments.length;
  const totalPaid = completedPayments.length;
  const totalPaidAmount = completedPayments.reduce((sum, payment) => {
    return sum + (payment.amount || 0);
  }, 0);

  // Filter payments by selected month and year
  const filterPaymentsByMonth = (
    payments: Payment[],
    month: number,
    year: number
  ) => {
    return payments.filter((payment) => {
      // For paid payments, use paymentDate
      if (payment.paymentStatus === "paid" && payment.paymentDate) {
        const paymentDate = new Date(payment.paymentDate);
        return (
          paymentDate.getMonth() === month && paymentDate.getFullYear() === year
        );
      }

      // For pending payments, show in current month regardless of source
      if (payment.paymentStatus === "pending") {
        const currentDate = new Date();
        return (
          month === currentDate.getMonth() && year === currentDate.getFullYear()
        );
      }

      return false;
    });
  };

  // Get filtered payments for the selected month
  const getFilteredPayments = () => {
    return filterPaymentsByMonth(allPagos, selectedMonth, selectedYear);
  };

  // Update pagos when month/year changes
  React.useEffect(() => {
    setPagos(getFilteredPayments());
  }, [selectedMonth, selectedYear, allPagos]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        const fichasData = await cargarFichas();
        const pagosData = await cargarPagos();
        setFichas(fichasData);
        setAllPagos(pagosData);
        // Initial filter with current month/year
        setPagos(filterPaymentsByMonth(pagosData, selectedMonth, selectedYear));
      };
      fetchData();
    }, [])
  );

  const handleEditPayment = (payment: Payment) => {
    // Navegar a la pantalla de modificar pago con los datos del pago
    router.push({
      pathname: "/functions/modificarPago",
      params: { paymentId: payment.id.toString() },
    });
  };

  const handleAddPayment = () => {
    // Navegar a la pantalla de agregar pago
    router.push("/functions/agregarPago");
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[month];
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };

  const getPaymentInfo = (ficha: Ficha) => {
    return pagos.find((p) => p.fichaId === ficha.id);
  };

  const getFichaInfo = (payment: Payment) => {
    return fichas.find((f) => f.id === payment.fichaId);
  };

  const renderPaymentItem = (
    payment: Payment,
    isPaidSection: boolean = false,
    keyProp?: string
  ) => {
    const ficha = getFichaInfo(payment);

    if (!ficha) {
      // Si no encontramos la ficha asociada, no mostramos el pago
      return null;
    }

    return (
      <View
        key={keyProp || `payment-${payment.id}`}
        style={[
          styles.surgeryCard,
          {
            backgroundColor: cardBg,
            borderColor: borderColor,
          },
        ]}
      >
        <View style={styles.surgeryHeader}>
          <Text
            style={[
              styles.surgeryName,
              { color: theme.tint, fontSize: FontsSize[fontSize] + 2 },
            ]}
          >
            {ficha.nombre_tecnica}
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditPayment(payment)}
              activeOpacity={0.7}
            >
              <AntDesign name="edit" size={16} color={theme.tint} />
            </TouchableOpacity>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isPaidSection ? theme.paid : theme.pending,
                },
              ]}
            >
              <Text style={styles.statusText}>
                {isPaidSection ? "Pagado" : "Pendiente"}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={[
            styles.surgeryDetail,
            { color: theme.text, fontSize: FontsSize[fontSize] },
          ]}
        >
          👨‍⚕️ Doctor que realizó: {payment.doctor || "No especificado"}
        </Text>

        {payment.paymentDate && (
          <Text
            style={[
              styles.surgeryDetail,
              { color: theme.text, fontSize: FontsSize[fontSize] },
            ]}
          >
            📅 Fecha de Pago:{" "}
            {new Date(payment.paymentDate).toLocaleDateString()}
          </Text>
        )}

        {payment.amount && (
          <Text
            style={[
              styles.surgeryDetail,
              {
                color: theme.tint,
                fontSize: FontsSize[fontSize],
                fontWeight: "bold",
              },
            ]}
          >
            💰 Monto: {formatCurrency(payment.amount)}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
      />

      {/* Main Content Container */}
      <View style={{ flex: 1, paddingTop: Platform.OS === "ios" ? 0 : 20 }}>
        {/* Title */}
        <View
          style={[
            styles.titleContainer,
            { backgroundColor, borderBottomColor: theme.cardBorder },
          ]}
        >
          <Text
            style={[
              styles.titleText,
              {
                color: theme.tint,
                fontSize: Math.min(FontsSize[fontSize] + 6, 26), // Aumentar tamaño
                letterSpacing: 0.5,
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            💰 Pagos
          </Text>
        </View>

        <View style={[styles.header, { backgroundColor }]}>
          {/* Month/Year Selector */}
          <View style={styles.monthSelector}>
            <TouchableOpacity
              style={[styles.monthButton, { borderColor: theme.tint }]}
              onPress={() => handleMonthChange("prev")}
              activeOpacity={0.7}
            >
              <AntDesign name="left" size={16} color={theme.tint} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.monthDisplay, { borderColor: theme.tint }]}
              onPress={goToCurrentMonth}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.monthText,
                  {
                    color: theme.tint,
                    fontSize: Math.min(FontsSize[fontSize], 16), // Reducir tamaño máximo
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {getMonthName(selectedMonth)} {selectedYear}
              </Text>
              <Text
                style={[
                  styles.monthHint,
                  {
                    color: theme.muted,
                    fontSize: Math.min(FontsSize[fontSize] - 3, 10), // Reducir tamaño
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                Toca para ir al mes actual
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.monthButton, { borderColor: theme.tint }]}
              onPress={() => handleMonthChange("next")}
              activeOpacity={0.7}
            >
              <AntDesign name="right" size={16} color={theme.tint} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        <View
          style={[
            styles.summaryContainer,
            {
              backgroundColor: cardBg,
              borderColor: borderColor,
            },
          ]}
        >
          <View style={styles.summaryItem}>
            <Text
              style={[
                styles.summaryNumber,
                {
                  color: theme.pending,
                  fontSize: Math.min(FontsSize[fontSize] + 3, 28), // Limitar tamaño
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {totalPending}
            </Text>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: theme.text,
                  fontSize: Math.min(FontsSize[fontSize] - 1, 14), // Limitar tamaño
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              Pendientes
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text
              style={[
                styles.summaryNumber,
                {
                  color: theme.paid,
                  fontSize: Math.min(FontsSize[fontSize] + 3, 28), // Limitar tamaño
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {totalPaid}
            </Text>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: theme.text,
                  fontSize: Math.min(FontsSize[fontSize] - 1, 14), // Limitar tamaño
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              Pagados
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text
              style={[
                styles.summaryNumber,
                {
                  color: theme.tint,
                  fontSize: Math.min(FontsSize[fontSize] + 1, 22), // Más pequeño para texto largo
                },
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit={true}
            >
              {formatCurrency(totalPaidAmount)}
            </Text>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: theme.text,
                  fontSize: Math.min(FontsSize[fontSize] - 1, 14), // Limitar tamaño
                },
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit={true}
            >
              Total Recaudado
            </Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1, backgroundColor }}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* To Be Paid Section */}
          <TouchableOpacity
            style={[
              styles.sectionHeader,
              { backgroundColor: cardBg, borderColor },
            ]}
            onPress={() => setShowToBePaid(!showToBePaid)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.pending, fontSize: FontsSize[fontSize] + 2 },
              ]}
            >
              🔴 Por Pagar ({totalPending})
            </Text>
            <AntDesign
              name={showToBePaid ? "up" : "down"}
              size={20}
              color={theme.text}
            />
          </TouchableOpacity>

          {showToBePaid && (
            <View style={styles.sectionContent}>
              {pendingPayments.length === 0 ? (
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme.text, fontSize: FontsSize[fontSize] },
                  ]}
                >
                  📝 No hay pagos pendientes registrados para{" "}
                  {getMonthName(selectedMonth)} {selectedYear}
                </Text>
              ) : (
                pendingPayments.map((payment, index) =>
                  renderPaymentItem(
                    payment,
                    false,
                    `pending-${payment.id}-${index}`
                  )
                )
              )}
            </View>
          )}

          {/* Paid Section */}
          <TouchableOpacity
            style={[
              styles.sectionHeader,
              { backgroundColor: cardBg, borderColor },
            ]}
            onPress={() => setShowPaid(!showPaid)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.paid, fontSize: FontsSize[fontSize] + 2 },
              ]}
            >
              🟢 Pagados ({totalPaid})
            </Text>
            <AntDesign
              name={showPaid ? "up" : "down"}
              size={20}
              color={theme.text}
            />
          </TouchableOpacity>

          {showPaid && (
            <View style={styles.sectionContent}>
              {completedPayments.length === 0 ? (
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme.text, fontSize: FontsSize[fontSize] },
                  ]}
                >
                  📝 No hay pagos completados registrados para{" "}
                  {getMonthName(selectedMonth)} {selectedYear}
                </Text>
              ) : (
                completedPayments.map((payment, index) =>
                  renderPaymentItem(
                    payment,
                    true,
                    `paid-${payment.id}-${index}`
                  )
                )
              )}
            </View>
          )}
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: theme.tint }]}
          onPress={handleAddPayment}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color={theme.background} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    paddingTop: Platform.OS === "ios" ? 15 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray200,
    minHeight: 60,
    maxHeight: 80,
    marginTop: Platform.OS === "android" ? 10 : 0,
  },
  titleText: {
    fontWeight: "bold",
    fontFamily:
      Platform.OS === "ios" ? "Arial Rounded MT Bold" : "sans-serif-medium",
    textAlign: "center",
  },
  header: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    maxHeight: 80, // Reducir altura máxima
    minHeight: 60,
    marginBottom: 16, // Añadir separación con el contenido de abajo
  },
  headerTitleContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 30,
    marginBottom: 4,
  },
  headerText: {
    fontWeight: "bold",
    fontFamily:
      Platform.OS === "ios" ? "Arial Rounded MT Bold" : "sans-serif-medium",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  monthSelectorContainer: {
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
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 4, // Reducir margen superior
    maxWidth: "100%", // Asegurar que no se desborde
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  monthDisplay: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginHorizontal: 6,
    borderWidth: 2,
    borderRadius: 12,
    minWidth: 0,
    maxWidth: "70%", // Limitar ancho máximo
    minHeight: 32,
  },
  monthText: {
    fontWeight: "bold",
    textAlign: "center",
    flexShrink: 1,
    lineHeight: 16,
  },
  monthHint: {
    textAlign: "center",
    marginTop: 1,
    fontStyle: "italic",
    flexShrink: 1,
    lineHeight: 12,
  },
  summaryContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    marginHorizontal: 8,
    marginTop: 8, // Añadir separación adicional desde arriba
    borderRadius: 12,
    justifyContent: "space-around",
    borderWidth: 1,
    elevation: 2,
    shadowColor: Colors.light.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    minHeight: 80, // Altura mínima
    maxHeight: 100, // Altura máxima para evitar desbordamiento
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  summaryNumber: {
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
    flexShrink: 1,
  },
  summaryLabel: {
    textAlign: "center",
    flexShrink: 1,
    lineHeight: 16,
    maxWidth: "100%",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: Colors.light.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontWeight: "bold",
  },
  sectionContent: {
    marginBottom: 16,
  },
  surgeryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 3,
    shadowColor: Colors.light.black,
    shadowOpacity: 0.13,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  surgeryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  surgeryName: {
    fontWeight: "bold",
    flex: 1,
    marginRight: 12,
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
  surgeryDetail: {
    marginBottom: 6,
  },
  paymentButtons: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  paymentButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  paymentButtonText: {
    color: Colors.light.white,
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 20,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.tint,
    elevation: 8,
    shadowColor: Colors.light.black,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});
