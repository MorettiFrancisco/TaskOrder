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
import { formatCurrency } from "../../utils/formatCurrency";
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
  const backgroundColor = colorScheme === "dark" ? "#23272f" : "#fff";
  const topInset =
    Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 0;

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
            backgroundColor: colorScheme === "dark" ? "#2a2e37" : "#fff",
            borderColor: colorScheme === "dark" ? "#353945" : "#eee",
          },
        ]}
      >
        <View style={styles.surgeryHeader}>
          <Text
            style={[
              styles.surgeryName,
              { color: Colors.light.tint, fontSize: FontsSize[fontSize] + 2 },
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
              <AntDesign name="edit" size={16} color={Colors.light.tint} />
            </TouchableOpacity>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isPaidSection ? "#4CAF50" : "#FF5722",
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

        <Text
          style={[
            styles.surgeryDetail,
            { color: theme.text, fontSize: FontsSize[fontSize] },
          ]}
        >
          🩺 Técnica de la ficha: {ficha.doctor}
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
                color: Colors.light.tint,
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

      <View
        style={[styles.header, { backgroundColor, paddingTop: topInset + 12 }]}
      >
        <Text
          style={[
            styles.headerText,
            {
              color: Colors.light.tint,
              fontSize: FontsSize[fontSize] + 8,
              letterSpacing: 1.5,
            },
          ]}
        >
          💰 Pagos
        </Text>

        {/* Month/Year Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity
            style={[styles.monthButton, { borderColor: Colors.light.tint }]}
            onPress={() => handleMonthChange("prev")}
            activeOpacity={0.7}
          >
            <AntDesign name="left" size={16} color={Colors.light.tint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.monthDisplay, { borderColor: Colors.light.tint }]}
            onPress={goToCurrentMonth}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.monthText,
                { color: Colors.light.tint, fontSize: FontsSize[fontSize] + 2 },
              ]}
            >
              {getMonthName(selectedMonth)} {selectedYear}
            </Text>
            <Text
              style={[
                styles.monthHint,
                { color: theme.text, fontSize: FontsSize[fontSize] - 2 },
              ]}
            >
              Toca para ir al mes actual
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.monthButton, { borderColor: Colors.light.tint }]}
            onPress={() => handleMonthChange("next")}
            activeOpacity={0.7}
          >
            <AntDesign name="right" size={16} color={Colors.light.tint} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary */}
      <View
        style={[
          styles.summaryContainer,
          {
            backgroundColor: colorScheme === "dark" ? "#2a2e37" : "#f8f8f8",
            borderBottomColor: colorScheme === "dark" ? "#353945" : "#eee",
          },
        ]}
      >
        <View style={styles.summaryItem}>
          <Text
            style={[
              styles.summaryNumber,
              { color: "#FF5722", fontSize: FontsSize[fontSize] + 4 },
            ]}
          >
            {totalPending}
          </Text>
          <Text
            style={[
              styles.summaryLabel,
              { color: theme.text, fontSize: FontsSize[fontSize] - 1 },
            ]}
          >
            Pendientes
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text
            style={[
              styles.summaryNumber,
              { color: "#4CAF50", fontSize: FontsSize[fontSize] + 4 },
            ]}
          >
            {totalPaid}
          </Text>
          <Text
            style={[
              styles.summaryLabel,
              { color: theme.text, fontSize: FontsSize[fontSize] - 1 },
            ]}
          >
            Pagados
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text
            style={[
              styles.summaryNumber,
              { color: Colors.light.tint, fontSize: FontsSize[fontSize] + 2 },
            ]}
          >
            {formatCurrency(totalPaidAmount)}
          </Text>
          <Text
            style={[
              styles.summaryLabel,
              { color: theme.text, fontSize: FontsSize[fontSize] - 1 },
            ]}
          >
            Total Recaudado
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor }}>
        {/* To Be Paid Section */}
        <TouchableOpacity
          style={[
            styles.sectionHeader,
            {
              backgroundColor: colorScheme === "dark" ? "#2a2e37" : "#fff",
              borderBottomColor: colorScheme === "dark" ? "#353945" : "#eee",
            },
          ]}
          onPress={() => setShowToBePaid(!showToBePaid)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: "#FF5722", fontSize: FontsSize[fontSize] + 2 },
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
            {
              backgroundColor: colorScheme === "dark" ? "#2a2e37" : "#fff",
              borderBottomColor: colorScheme === "dark" ? "#353945" : "#eee",
            },
          ]}
          onPress={() => setShowPaid(!showPaid)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: "#4CAF50", fontSize: FontsSize[fontSize] + 2 },
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
                  `completed-${payment.id}-${index}`
                )
              )
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: Colors.light.tint }]}
        onPress={handleAddPayment}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
  },
  headerText: {
    fontWeight: "bold",
    fontFamily:
      Platform.OS === "ios" ? "Arial Rounded MT Bold" : "sans-serif-medium",
  },
  summaryContainer: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryNumber: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  summaryLabel: {
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontWeight: "bold",
  },
  sectionContent: {
    padding: 16,
  },
  surgeryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: "#fff",
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
    color: "#fff",
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
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 12,
  },
  monthButton: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 8,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  monthDisplay: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    minWidth: 180,
  },
  monthText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  monthHint: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 2,
  },
});
