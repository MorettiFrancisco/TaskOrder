import React from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useConfiguracion } from '../context/configuracionContext';
import { Colors } from '../../constants/Colors';
import { FontsSize } from '../../constants/FontsSize';

export default function ConfigurationScreen() {
  const { darkMode, setDarkMode, fontSize, setFontSize, exportarFichas, importarFichas } = useConfiguracion();
  const theme = darkMode ? Colors.dark : Colors.light;
  const backgroundColor = darkMode ? '#23272f' : '#fff';

  // Calcula el padding top dinámico para Android
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      <View style={[styles.header, { backgroundColor, paddingTop: topInset + 12 }]}>
        <Text style={[styles.headerText, { color: darkMode ? '#fff' : '#d72660', fontSize: FontsSize[fontSize] + 6 }]}>
          Configuración
        </Text>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.optionContainer}>
          <Text style={[styles.label, { color: theme.text, fontSize: FontsSize[fontSize] }]}>Modo oscuro</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <View style={styles.optionContainer}>
          <Text style={[styles.label, { color: theme.text, fontSize: FontsSize[fontSize] }]}>Tamaño:</Text>
          {(['pequeño', 'mediano', 'grande'] as const).map((size) => (
            <TouchableOpacity key={size} onPress={() => setFontSize(size)} style={styles.sizeOption}>
              <Text
                style={[
                  styles.option,
                  fontSize === size && styles.selected,
                  {
                    color: theme.text,
                    fontSize: FontsSize[size],
                    fontWeight: fontSize === size ? 'bold' : 'normal',
                    textDecorationLine: fontSize === size ? 'underline' : 'none',
                  },
                ]}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={exportarFichas} style={styles.button}>
            <Text style={styles.buttonText}>Exportar Fichas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={importarFichas} style={styles.button}>
            <Text style={styles.buttonText}>Importar Fichas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    // paddingTop se ajusta dinámicamente en el componente
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  headerText: {
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Arial Rounded MT Bold' : 'sans-serif-medium',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    flexWrap: 'wrap',
    gap: 10,
  },
  label: {
    fontSize: 16,
    marginRight: 10,
  },
  sizeOption: {
    marginHorizontal: 5,
  },
  option: {
    fontSize: 16,
  },
  selected: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#f48fb1',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
