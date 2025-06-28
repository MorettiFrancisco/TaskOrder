import React, { createContext, useContext, useState, useEffect } from "react";
import { View } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { cargarFichas, guardarFichas } from "../../utils/fichasStorage";
import Ficha from "../../models/ficha";
import { useColorScheme } from "react-native";

type FontSize = "pequeño" | "mediano" | "grande";

interface ConfiguracionContextProps {
  fontSize: FontSize;
  setFontSize: (value: FontSize) => void;
  exportarFichas: () => Promise<void>;
  importarFichas: () => Promise<void>;
}

const ConfiguracionContext = createContext<
  ConfiguracionContextProps | undefined
>(undefined);

export const useConfiguracion = () => {
  const context = useContext(ConfiguracionContext);
  if (!context)
    throw new Error(
      "useConfiguracion debe usarse dentro de ConfiguracionProvider"
    );
  return context;
};

export function ConfiguracionProvider({ children }: React.PropsWithChildren) {
  const [fontSize, setFontSize] = useState<FontSize>("mediano");

  // Función helper para normalizar fichas importadas con valores por defecto
  const normalizarFicha = (fichaData: any): Ficha => {
    // Validar que fichaData sea un objeto
    if (!fichaData || typeof fichaData !== "object") {
      fichaData = {};
    }

    return new Ficha(
      fichaData.id || Date.now() + Math.random(), // ID único si no existe
      fichaData.nombre_tecnica ||
        "Técnica sin nombre - editar para agregar información",
      fichaData.doctor ||
        "Doctor sin especificar - editar para agregar información",
      fichaData.descripcion ||
        "Descripción no disponible - editar para agregar información",
      fichaData.materiales ||
        "Materiales no especificados - editar para agregar información"
    );
  };

  const exportarFichas = async () => {
    try {
      const fichas = await cargarFichas();
      const json = JSON.stringify(fichas, null, 2);
      const fileUri = FileSystem.documentDirectory + "fichas_export.json";
      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Compartir fichas quirúrgicas",
        });
      }
    } catch (e) {
      alert("No se pudo exportar las fichas.");
    }
  };

  const importarFichas = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const content = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        let fichasImportadas;
        try {
          fichasImportadas = JSON.parse(content);
        } catch (parseError) {
          alert("Error: El archivo no contiene JSON válido.");
          return;
        }

        if (Array.isArray(fichasImportadas)) {
          // Normalizar cada ficha para asegurar que tenga todos los campos necesarios
          const fichasNormalizadas = fichasImportadas.map(
            (fichaData, index) => {
              try {
                return normalizarFicha(fichaData);
              } catch (normError) {
                console.warn(
                  `Error normalizando ficha en índice ${index}:`,
                  normError
                );
                // Crear una ficha por defecto si hay error
                return normalizarFicha({});
              }
            }
          );

          await guardarFichas(fichasNormalizadas);

          const fichasConDefaults = fichasNormalizadas.filter(
            (ficha) =>
              ficha.materiales.includes("editar para agregar información") ||
              ficha.nombre_tecnica.includes(
                "editar para agregar información"
              ) ||
              ficha.doctor.includes("editar para agregar información") ||
              ficha.descripcion.includes("editar para agregar información")
          );

          if (fichasConDefaults.length > 0) {
            alert(
              `Fichas importadas correctamente. ${fichasConDefaults.length} ficha(s) tenían campos faltantes que se completaron con valores por defecto. Recuerde editarlas para agregar la información necesaria.`
            );
          } else {
            alert("Las fichas fueron importadas correctamente.");
          }
        } else {
          alert("Error: El archivo no contiene un array de fichas válido.");
        }
      }
    } catch (e) {
      console.error("Error importando fichas:", e);
      alert(
        "No se pudo importar las fichas. Verifique que el archivo sea válido y esté accesible."
      );
    }
  };

  return (
    <ConfiguracionContext.Provider
      value={{ fontSize, setFontSize, exportarFichas, importarFichas }}
    >
      {children}
    </ConfiguracionContext.Provider>
  );
}

// Required default export for Expo Router
export default function ConfiguracionContextScreen() {
  return <View style={{ display: "none" }} />;
}
