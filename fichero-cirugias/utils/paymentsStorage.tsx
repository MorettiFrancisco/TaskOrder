import AsyncStorage from "@react-native-async-storage/async-storage";
import Payment from "../models/payment";

const PAYMENTS_STORAGE_KEY = "payments_storage";

export const cargarPagos = async (): Promise<Payment[]> => {
  try {
    const data = await AsyncStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (data) {
      const payments = JSON.parse(data);
      return payments.map(
        (payment: any) =>
          new Payment(
            payment.id,
            payment.fichaId,
            payment.doctor || payment.pacienteClinica || "No especificado", // Backward compatibility
            payment.paymentSource,
            payment.paymentStatus,
            payment.amount,
            payment.paymentDate ? new Date(payment.paymentDate) : undefined,
            payment.notes
          )
      );
    }
    return [];
  } catch (error) {
    console.error("Error loading payments:", error);
    return [];
  }
};

export const guardarPagos = async (payments: Payment[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
  } catch (error) {
    console.error("Error saving payments:", error);
  }
};

export const agregarPago = async (payment: Payment): Promise<void> => {
  try {
    const payments = await cargarPagos();
    payments.push(payment);
    await guardarPagos(payments);
  } catch (error) {
    console.error("Error adding payment:", error);
  }
};

export const obtenerPagosPorFicha = async (
  fichaId: number
): Promise<Payment | null> => {
  try {
    const payments = await cargarPagos();
    return payments.find((payment) => payment.fichaId === fichaId) || null;
  } catch (error) {
    console.error("Error getting payment by ficha ID:", error);
    return null;
  }
};

export const obtenerPagosPorFichas = async (
  fichaIds: number[]
): Promise<Payment[]> => {
  try {
    const payments = await cargarPagos();
    return payments.filter((payment) => fichaIds.includes(payment.fichaId));
  } catch (error) {
    console.error("Error getting payments by ficha IDs:", error);
    return [];
  }
};

export const actualizarPago = async (
  paymentId: number,
  updatedPayment: Partial<Payment>
): Promise<void> => {
  try {
    const payments = await cargarPagos();
    const index = payments.findIndex((payment) => payment.id === paymentId);
    if (index !== -1) {
      payments[index] = { ...payments[index], ...updatedPayment };
      await guardarPagos(payments);
    }
  } catch (error) {
    console.error("Error updating payment:", error);
  }
};

export const eliminarPago = async (paymentId: number): Promise<void> => {
  try {
    const payments = await cargarPagos();
    const filteredPayments = payments.filter(
      (payment) => payment.id !== paymentId
    );
    await guardarPagos(filteredPayments);
  } catch (error) {
    console.error("Error deleting payment:", error);
  }
};

export const obtenerPagosPorMes = async (
  year: number,
  month: number
): Promise<Payment[]> => {
  try {
    const payments = await cargarPagos();
    return payments.filter((payment) => {
      if (!payment.paymentDate) return false;
      const paymentDate = new Date(payment.paymentDate);
      return (
        paymentDate.getFullYear() === year && paymentDate.getMonth() === month
      );
    });
  } catch (error) {
    console.error("Error getting payments by month:", error);
    return [];
  }
};
