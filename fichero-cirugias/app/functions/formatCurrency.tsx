import { View } from "react-native";

/**
 * Formats a number as currency with Colombian peso formatting.
 * @param amount - The amount to format.
 * @returns Formatted currency string (e.g., "$1.000.000,00").
 */
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "$0,00";
  }

  const fixedAmount = amount.toFixed(2);
  const [integerPart, decimalPart] = fixedAmount.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `$${formattedInteger},${decimalPart}`;
};

/**
 * Parses a formatted currency string back to a number.
 * @param currencyString - The formatted currency string.
 * @returns The numeric value.
 */
export const parseCurrency = (currencyString: string): number => {
  if (!currencyString) return 0;

  const cleanString = currencyString
    .replace(/\$/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");

  return parseFloat(cleanString) || 0;
};

/**
 * Formats input as user types for currency input.
 * @param input - The input string.
 * @returns Formatted input string.
 */
export const formatCurrencyInput = (input: string): string => {
  const numericOnly = input.replace(/[^\d,]/g, "");
  const parts = numericOnly.split(",");

  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  if (parts[1]) {
    parts[1] = parts[1].substring(0, 2);
  }

  const formatted = parts.length > 1 ? parts.join(",") : parts[0];
  return formatted ? `$${formatted}` : "";
};

// Required default export for Expo Router
export default function FormatCurrencyScreen() {
  return <View style={{ display: "none" }} />;
}
