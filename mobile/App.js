import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Login } from './Telas/Login';
import { AppTabs } from './Telas/AppTabs';

export default function App() {
  const [logado, setLogado] = useState(false);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {logado ? (
        <AppTabs />
      ) : (
        <Login onLoginSuccess={() => setLogado(true)} />
      )}
    </NavigationContainer>
  );
}