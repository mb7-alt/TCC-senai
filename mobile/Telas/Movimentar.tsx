import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function Movimento() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Controle de itens</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  texto: { fontSize: 18, fontWeight: 'bold', color: '#192a6b' }
});