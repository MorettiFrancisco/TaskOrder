import React from 'react';
import { View, Text, Switch, Button, StyleSheet, TouchableOpacity, Alert, Platform, Share } from 'react-native';
import { useConfiguracion } from '../context/configuracionContext';
import { Colors } from '../../constants/Colors';
import { FontsSize } from '../../constants/FontsSize';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { cargarFichas, guardarFichas } from '../../utils/fichasStorage';
import * as Sharing from 'expo-sharing';

export default function ConfigurationScreen() {
    const { darkMode, setDarkMode, fontSize, setFontSize } = useConfiguracion();
    const theme = darkMode ? Colors.dark : Colors.light;

    // Exportar fichas a un archivo JSON y permitir compartir/descargar
    const handleExportar = async () => {
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
                Alert.alert('Exportación exitosa', 'Archivo compartido correctamente.');
            } else {
                Alert.alert('Error', 'No se pudo compartir el archivo en este dispositivo.');
            }
        } catch (e) {
            Alert.alert('Error', 'No se pudo exportar las fichas.');
        }
    };

    // Importar fichas desde un archivo JSON
    const handleImportar = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                const content = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
                const fichas = JSON.parse(content);
                if (Array.isArray(fichas)) {
                    await guardarFichas(fichas);
                    Alert.alert('Importación exitosa', 'Las fichas fueron importadas correctamente.');
                } else {
                    Alert.alert('Error', 'El archivo no tiene el formato correcto.');
                }
            }
        } catch (e) {
            Alert.alert('Error', 'No se pudo importar las fichas.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text, fontSize: FontsSize[fontSize] + 4 }]}>
                Configuración de la Aplicación
            </Text>

            {/* Modo oscuro */}
            <View style={styles.row}>
                <Text style={{ color: theme.text }}>Modo oscuro</Text>
                <Switch value={darkMode} onValueChange={setDarkMode} />
            </View>

            {/* Tamaño de letra */}
            <View style={styles.row}>
                <Text style={{ color: theme.text }}>Tamaño:</Text>
                <TouchableOpacity onPress={() => setFontSize('pequeño')}>
                    <Text style={[
                        styles.option,
                        fontSize === 'pequeño' && styles.selected,
                        { color: theme.text, fontSize: FontsSize['pequeño'] }
                    ]}>Pequeño</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFontSize('mediano')}>
                    <Text style={[
                        styles.option,
                        fontSize === 'mediano' && styles.selected,
                        { color: theme.text, fontSize: FontsSize['mediano'] }
                    ]}>Mediano</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFontSize('grande')}>
                    <Text style={[
                        styles.option,
                        fontSize === 'grande' && styles.selected,
                        { color: theme.text, fontSize: FontsSize['grande'] }
                    ]}>Grande</Text>
                </TouchableOpacity>
            </View>

            {/* Exportar/Importar */}
            <View style={styles.row}>
                <Button title="Exportar Fichas" onPress={handleExportar} />
                <Button title="Importar Fichas" onPress={handleImportar} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'flex-start' },
    title: { fontWeight: 'bold', marginBottom: 20 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    option: { marginHorizontal: 8, padding: 4 },
    selected: { fontWeight: 'bold', textDecorationLine: 'underline' }
});