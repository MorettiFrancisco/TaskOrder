// Required imports for Expo Router
import React from "react";
import { View } from "react-native";

/**
 * Formats a number as currency with Colombian peso formatting
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$1.000.000,00")
 */
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "$0,00";
  }

  // Convert to fixed decimal places (2)
  const fixedAmount = amount.toFixed(2);

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = fixedAmount.split(".");

  // Add thousand separators to integer part (using dots)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // Return formatted currency with Colombian formatting ($1.000.000,00)
  return `$${formattedInteger},${decimalPart}`;
};

/**
 * Parses a formatted currency string back to a number
 * @param currencyString - The formatted currency string
 * @returns The numeric value
 */
export const parseCurrency = (currencyString: string): number => {
  if (!currencyString) return 0;

  // Remove currency symbol and thousand separators
  const cleanString = currencyString
    .replace(/\$/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");

  return parseFloat(cleanString) || 0;
};

/**
 * Formats input as user types for currency input
 * @param input - The input string
 * @returns Formatted input string
 */
export const formatCurrencyInput = (input: string): string => {
  // Remove non-numeric characters except comma
  const numericOnly = input.replace(/[^\d,]/g, "");

  // Split by comma to handle decimal part
  const parts = numericOnly.split(",");

  // Format integer part with dots
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Limit decimal part to 2 digits
  if (parts[1]) {
    parts[1] = parts[1].substring(0, 2);
  }

  // Join and add currency symbol
  const formatted = parts.length > 1 ? parts.join(",") : parts[0];
  return formatted ? `$${formatted}` : "";
};

// Required default export for Expo Router
export default function FormatCurrencyScreen() {
  return <View style={{ display: "none" }} />;
}
