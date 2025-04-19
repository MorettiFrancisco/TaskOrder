import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { agregarFicha, existeFichaPorTecnica, obtenerFichaPorTecnica } from '../../utils/fichasStorage';
import Ficha from '../../models/ficha';

export default function AgregarFichaScreen() {
    const [nombreTecnica, setNombreTecnica] = useState('');
    const [doctor, setDoctor] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const router = useRouter();

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
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Agregar Ficha</Text>
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
            <Button title="Guardar Ficha" onPress={handleGuardar} color="#007bff" />
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