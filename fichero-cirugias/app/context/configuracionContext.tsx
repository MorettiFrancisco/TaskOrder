import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { cargarFichas, guardarFichas } from '../../utils/fichasStorage';
import { useColorScheme } from 'react-native';

type FontSize = 'pequeño' | 'mediano' | 'grande';

interface ConfiguracionContextProps {
    fontSize: FontSize;
    setFontSize: (value: FontSize) => void;
    exportarFichas: () => Promise<void>;
    importarFichas: () => Promise<void>;
}

const ConfiguracionContext = createContext<ConfiguracionContextProps | undefined>(undefined);

export const useConfiguracion = () => {
    const context = useContext(ConfiguracionContext);
    if (!context) throw new Error('useConfiguracion debe usarse dentro de ConfiguracionProvider');
    return context;
};

export function ConfiguracionProvider({ children }: { children: ReactNode }) {
    const [fontSize, setFontSize] = useState<FontSize>('mediano');

    const exportarFichas = async () => {
        try {
            const fichas = await cargarFichas();
            const json = JSON.stringify(fichas, null, 2);
            const fileUri = FileSystem.documentDirectory + 'fichas_export.json';
            await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Compartir fichas quirúrgicas',
                });
            }
        } catch (e) {
            alert('No se pudo exportar las fichas.');
        }
    };

    const importarFichas = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                const content = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
                const fichas = JSON.parse(content);
                if (Array.isArray(fichas)) {
                    await guardarFichas(fichas);
                    alert('Las fichas fueron importadas correctamente.');
                } else {
                    alert('El archivo no tiene el formato correcto.');
                }
            }
        } catch (e) {
            alert('No se pudo importar las fichas.');
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

