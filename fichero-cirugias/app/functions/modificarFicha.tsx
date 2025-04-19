import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { obtenerFichaPorTecnica, editarFichaPorTecnica } from '../../utils/fichasStorage';
import Ficha from '../../models/ficha';

export default function ModificarFichaScreen() {
    const router = useRouter();
    const { nombre_tecnica } = useLocalSearchParams<{ nombre_tecnica: string }>();
    const [nombreTecnica, setNombreTecnica] = useState('');
    const [doctor, setDoctor] = useState('');
    const [descripcion, setDescripcion] = useState('');

    useEffect(() => {
        async function cargarFicha() {
            if (nombre_tecnica) {
                const ficha = await obtenerFichaPorTecnica(nombre_tecnica);
                if (ficha) {
                    setNombreTecnica(ficha.nombre_tecnica);
                    setDoctor(ficha.doctor);
                    setDescripcion(ficha.descripcion);
                } else {
                    Alert.alert('Error', 'Ficha no encontrada.', [
                        { text: 'OK', onPress: () => router.back() }
                    ]);
                }
            }
        }
        cargarFicha();
    }, [nombre_tecnica]);

    const handleGuardar = async () => {
        if (!nombreTecnica.trim() || !doctor.trim() || !descripcion.trim()) {
            Alert.alert('Error', 'Todos los campos son obligatorios.');
            return;
        }
        const fichaEditada = new Ficha(
            Date.now(), // O usa el id original si lo tienes
            nombreTecnica.trim(),
            doctor.trim(),
            descripcion.trim(),
            new Date()
        );
        await editarFichaPorTecnica(nombre_tecnica as string, fichaEditada);
        Alert.alert('Éxito', 'Ficha modificada correctamente.', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Modificar Ficha</Text>
            <Text style={styles.label}>Nombre de la Técnica</Text>
            <TextInput
                style={styles.input}
                value={nombreTecnica}
                onChangeText={setNombreTecnica}
                placeholder="Ej: Colecistectomía"
                autoCapitalize="sentences"
            />
            <Text style={styles.label}>Doctor</Text>
            <TextInput
                style={styles.input}
                value={doctor}
                onChangeText={setDoctor}
                placeholder="Ej: Dr. Pérez"
                autoCapitalize="words"
            />
            <Text style={styles.label}>Descripción / Técnica Quirúrgica</Text>
            <TextInput
                style={styles.textArea}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Describa la técnica quirúrgica en detalle..."
                multiline
                textAlignVertical="top"
            />
            <Button title="Guardar Cambios" onPress={handleGuardar} color="#007bff" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9'
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        minHeight: 120,
        marginBottom: 20
    }
});