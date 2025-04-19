import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Ficha from '../../models/ficha';
import { cargarFichas } from '../../utils/fichasStorage';
import { useConfiguracion } from '../context/configuracionContext';
import { Colors } from '../../constants/Colors';
import { FontsSize } from '../../constants/FontsSize';

export default function HomeScreen() {
    const [fichas, setFichas] = useState<Ficha[]>([]);
    const router = useRouter();
    const { darkMode, fontSize } = useConfiguracion();

    const fetchFichas = async () => {
        const data = await cargarFichas();
        setFichas(data);
    };

    useFocusEffect(
        useCallback(() => {
            fetchFichas();
        }, [])
    );

    const handleAgregar = () => {
        router.push('/functions/agregarFicha');
    };

    const theme = darkMode ? Colors.dark : Colors.light;

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, { color: theme.text, fontSize: FontsSize[fontSize] + 4 }]}>Listado de Fichas</Text>
          <Button title="Agregar Ficha" onPress={handleAgregar} color={theme.tint} />
          <FlatList
              data={fichas}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                  <TouchableOpacity
                      style={[styles.card, { backgroundColor: theme.tabIconDefault }]}
                      onPress={() => router.push({ pathname: '/singleFichaView', params: { id: item.id } })}
                  >
                      <Text style={[styles.technique, { color: theme.text, fontSize: FontsSize[fontSize] }]}>{item.nombre_tecnica}</Text>
                      <Text style={[styles.doctor, { color: theme.text, fontSize: FontsSize[fontSize] - 2 }]}>Doctor: {item.doctor}</Text>
                      <Text style={[styles.description, { color: theme.icon, fontSize: FontsSize[fontSize] - 4 }]} numberOfLines={2}>{item.descripcion}</Text>
                  </TouchableOpacity>
              )}
          />     
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  card: { padding: 12, marginBottom: 12, borderRadius: 8 },
  technique: { fontWeight: 'bold' },
  doctor: {},
  description: {},
});