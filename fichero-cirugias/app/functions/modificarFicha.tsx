import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, BackHandler } from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { obtenerFichaPorId, editarFichaPorId } from '../../utils/fichasStorage';
import Ficha from '../../models/ficha';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function ModificarFichaScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [nombreTecnica, setNombreTecnica] = useState('');
    const [doctor, setDoctor] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(true);
    const [original, setOriginal] = useState({ nombreTecnica: '', doctor: '', descripcion: '' });
    const colorScheme = useColorScheme();
    const backgroundColor = colorScheme === 'dark' ? '#23272f' : '#fff';
    const textColor = colorScheme === 'dark' ? '#fff' : '#23272f';
    const inputBg = colorScheme === 'dark' ? '#2a2e37' : '#f9f9f9';
    const borderColor = colorScheme === 'dark' ? '#555' : '#ccc';
    const buttonBg = colorScheme === 'dark' ? '#d72660' : '#d72660';
    const buttonText = '#fff';

    // Flags para manejar alertas y navegación
    const alertVisible = useRef(false);
    const confirmedExit = useRef(false);
    const justSaved = useRef(false);

    // Confirmación al salir
    const confirmExit = useCallback((onConfirm?: () => void) => {
        if (justSaved.current) return false;
        if (
            nombreTecnica === original.nombreTecnica &&
            doctor === original.doctor &&
            descripcion === original.descripcion
        ) {
            if (onConfirm) {
                onConfirm();
            } else {
                router.back();
            }
            return false;
        }
        // Si hay cambios, muestra alerta
        if (alertVisible.current) return true;
        if (confirmedExit.current) return false;
        if (nombreTecnica || doctor || descripcion) {
            alertVisible.current = true;
            Alert.alert(
                'Cancelar',
                '¿Seguro que deseas cancelar? Se perderán los cambios realizados.',
                [
                    {
                        text: 'No',
                        style: 'cancel',
                        onPress: () => { alertVisible.current = false; }
                    },
                    {
                        text: 'Sí',
                        style: 'destructive',
                        onPress: () => {
                            alertVisible.current = false;
                            confirmedExit.current = true;
                            if (onConfirm) {
                                onConfirm();
                            } else {
                                router.back();
                            }
                        }
                    }
                ],
                { cancelable: false }
            );
            return true;
        }
        return false;
    }, [nombreTecnica, doctor, descripcion, original, router, id]);

    // Manejo de botón físico y flecha de back
    useFocusEffect(
        useCallback(() => {
            alertVisible.current = false;
            confirmedExit.current = false;

            const onBackPress = () => {
                if (confirmExit(() => {
                    confirmedExit.current = true;
                    router.back(); 
                })) {
                    return true;
                }
                return false;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            const unsubscribe = navigation.addListener('beforeRemove', (e) => {
                if (confirmExit(() => {
                    confirmedExit.current = true;
                    navigation.dispatch(e.data.action);
                })) {
                    e.preventDefault();
                }
            });

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
                unsubscribe();
                alertVisible.current = false;
                confirmedExit.current = false;
                justSaved.current = false; // <--- Limpia la bandera
            };
        }, [confirmExit, navigation, router, id])
    );

    useEffect(() => {
        async function cargarFicha() {
            if (id) {
                const ficha = await obtenerFichaPorId(Number(id));
                if (ficha) {
                    setNombreTecnica(ficha.nombre_tecnica);
                    setDoctor(ficha.doctor);
                    setDescripcion(ficha.descripcion);
                    setOriginal({
                        nombreTecnica: ficha.nombre_tecnica,
                        doctor: ficha.doctor,
                        descripcion: ficha.descripcion,
                    });
                } else {
                    Alert.alert('Error', 'Ficha no encontrada.', [
                        { text: 'OK', onPress: () => router.back() }
                    ]);
                }
            }
            setLoading(false);
        }
        cargarFicha();
    }, [id]);

    const handleGuardar = async () => {
        if (!nombreTecnica.trim() || !doctor.trim() || !descripcion.trim()) {
            Alert.alert('Error', 'Todos los campos son obligatorios.');
            return;
        }
        const fichaEditada = new Ficha(
            Number(id),
            nombreTecnica.trim(),
            doctor.trim(),
            descripcion.trim(),
            new Date()
        );
        await editarFichaPorId(Number(id), fichaEditada);
        justSaved.current = true;
        Alert.alert('Éxito', 'Ficha modificada correctamente.', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor }}>
                <ActivityIndicator size="large" color="#d72660" />
                <Text style={{ marginTop: 16, color: textColor }}>Cargando ficha...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
            <View style={[styles.form, { backgroundColor: colorScheme === 'dark' ? '#292d36' : '#fff', borderColor }]}>
                <Text style={[styles.title, { color: textColor }]}>Modificar Ficha</Text>
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
                    <Text style={[styles.buttonText, { color: buttonText }]}>Guardar Cambios</Text>
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