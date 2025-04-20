import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { agregarFicha, existeFichaPorTecnica, obtenerFichaPorTecnica } from '../../utils/fichasStorage';
import Ficha from '../../models/ficha';
import { useColorScheme } from 'react-native';

export default function AgregarFichaScreen() {
    const [nombreTecnica, setNombreTecnica] = useState('');
    const [doctor, setDoctor] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const router = useRouter();
    const colorScheme = useColorScheme();
    const backgroundColor = colorScheme === 'dark' ? '#23272f' : '#fff';
    const textColor = colorScheme === 'dark' ? '#fff' : '#23272f';
    const inputBg = colorScheme === 'dark' ? '#2a2e37' : '#f9f9f9';
    const borderColor = colorScheme === 'dark' ? '#555' : '#ccc';
    const buttonBg = colorScheme === 'dark' ? '#d72660' : '#d72660';
    const buttonText = '#fff';

    const handleGuardar = async () => {
        if (!nombreTecnica.trim() || !doctor.trim() || !descripcion.trim()) {
            Alert.alert('Error', 'Todos los campos son obligatorios.');
            return;
        }
        if (await existeFichaPorTecnica(nombreTecnica)) {
            const fichaExistente = await obtenerFichaPorTecnica(nombreTecnica);
            const doctorExistente = fichaExistente ? fichaExistente.doctor : 'Desconocido';
            Alert.alert(
                'Ficha existente',
                `Ya existe una ficha con ese nombre de técnica.\nDoctor: ${doctorExistente}\n¿Desea agregar igualmente?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Agregar',
                        style: 'default',
                        onPress: async () => {
                            const nuevaFicha = new Ficha(
                                Date.now(),
                                nombreTecnica.trim(),
                                doctor.trim(),
                                descripcion.trim(),
                                new Date()
                            );
                            await agregarFicha(nuevaFicha);
                            Alert.alert('Éxito', 'Ficha agregada correctamente.', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        }
                    }
                ]
            );
            return;
        }
        const nuevaFicha = new Ficha(
            Date.now(),
            nombreTecnica.trim(),
            doctor.trim(),
            descripcion.trim(),
            new Date()
        );
        await agregarFicha(nuevaFicha);
        Alert.alert('Éxito', 'Ficha agregada correctamente.', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
            <View style={[styles.form, { backgroundColor: colorScheme === 'dark' ? '#292d36' : '#fff', borderColor }]}>
                <Text style={[styles.title, { color: textColor }]}>Agregar Ficha</Text>
                <Text style={[styles.label, { color: textColor }]}>Nombre de la Técnica</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                    value={nombreTecnica}
                    onChangeText={setNombreTecnica}
                    placeholder="Ej: Colecistectomía"
                    placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#888'}
                    autoCapitalize="sentences"
                />
                <Text style={[styles.label, { color: textColor }]}>Doctor</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                    value={doctor}
                    onChangeText={setDoctor}
                    placeholder="Ej: Dr. Pérez"
                    placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#888'}
                    autoCapitalize="words"
                />
                <Text style={[styles.label, { color: textColor }]}>Descripción / Técnica Quirúrgica</Text>
                <TextInput
                    style={[styles.textArea, { backgroundColor: inputBg, color: textColor, borderColor }]}
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholder="Describa la técnica quirúrgica en detalle..."
                    placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#888'}
                    multiline
                    textAlignVertical="top"
                />
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: buttonBg }]}
                    onPress={handleGuardar}
                    activeOpacity={0.85}
                >
                    <Text style={[styles.buttonText, { color: buttonText }]}>Guardar Ficha</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    form: {
        width: '100%',
        maxWidth: 420,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 4,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        minHeight: 100,
        marginBottom: 20,
    },
    button: {
        marginTop: 18,
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 36,
        borderRadius: 24,
        elevation: 2,
        shadowColor: '#d72660',
        shadowOpacity: 0.18,
        shadowRadius: 6,
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
});