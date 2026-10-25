import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Login } from './Telas/Login';
import { AppTabs } from './Telas/AppTabs';

export default function App() {
  const [logado, setLogado] = useState(false);
  const [verificandoSessao, setVerificandoSessao] = useState(true);

  useEffect(() => {
    // Verifica se já existe token salvo no aparelho
    async function verificarToken() {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setLogado(true);
        }
      } catch (e) {
        console.error('Erro ao verificar sessão:', e);
      } finally {
        setVerificandoSessao(false);
      }
    }

    verificarToken();
  }, []);

  if (verificandoSessao) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#192a6b" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {logado ? (
        <AppTabs onLogout={() => setLogado(false)} />
      ) : (
        <Login onLoginSuccess={() => setLogado(true)} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
