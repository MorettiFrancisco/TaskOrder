import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useConfiguracion } from './context/configuracionContext';
import { Colors } from '../constants/Colors';
import { FontsSize } from '../constants/FontsSize';
import Ficha from '../models/ficha';
import { cargarFichas, eliminarFichaPorId } from '../utils/fichasStorage';

export default function SingleFichaView() {
    const { id } = useLocalSearchParams();
    const { darkMode, fontSize } = useConfiguracion();
    const [ficha, setFicha] = React.useState<Ficha | null>(null);
    const router = useRouter();

    React.useEffect(() => {
        const fetchFicha = async () => {
            const fichas = await cargarFichas();
            const found = fichas.find(f => f.id === Number(id));
            setFicha(found || null);
        };
        fetchFicha();
    }, [id]);

    const theme = darkMode ? Colors.dark : Colors.light;

    const handleEditar = () => {
        if (!ficha) return;
        router.push({
            pathname: '/functions/modificarFicha',
            params: { nombre_tecnica: ficha.nombre_tecnica }
        });
    };

    const handleEliminar = () => {
        if (!ficha) return;
        Alert.alert(
            'Eliminar ficha',
            `¿Seguro que deseas eliminar la ficha de "${ficha.nombre_tecnica}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        await eliminarFichaPorId(ficha.id);
                        router.back();
                    }
                }
            ]
        );
    };

    if (!ficha) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text, fontSize: FontsSize[fontSize] }}>Ficha no encontrada.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text, fontSize: FontsSize[fontSize] + 6 }]}>
                {ficha.nombre_tecnica}
            </Text>
            <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.icon, fontSize: FontsSize[fontSize] }]}>Doctor:</Text>
                <Text style={[styles.value, { color: theme.text, fontSize: FontsSize[fontSize] }]}>{ficha.doctor}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.icon, fontSize: FontsSize[fontSize] }]}>Fecha:</Text>
                <Text style={[styles.value, { color: theme.text, fontSize: FontsSize[fontSize] }]}>
                    {ficha.fecha ? new Date(ficha.fecha).toLocaleDateString() : 'Sin fecha'}
                </Text>
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: FontsSize[fontSize] + 2 }]}>
                Descripción / Técnica Quirúrgica
            </Text>
            <Text style={[styles.description, { color: theme.text, fontSize: FontsSize[fontSize] }]}>
                {ficha.descripcion}
            </Text>
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.editButton} onPress={handleEditar}>
                    <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleEliminar}>
                    <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 18,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center',
    },
    label: {
        fontWeight: 'bold',
        marginRight: 8,
    },
    value: {
        flex: 1,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginTop: 18,
        marginBottom: 8,
    },
    description: {
        textAlign: 'justify',
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 24,
    },
    editButton: {
        marginRight: 12,
        backgroundColor: '#ddeeff',
        padding: 10,
        borderRadius: 6,
    },
    editText: {
        color: '#0057b7',
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: '#ffdddd',
        padding: 10,
        borderRadius: 6,
    },
    deleteText: {
        color: '#c00',
        fontWeight: 'bold',
    },
});