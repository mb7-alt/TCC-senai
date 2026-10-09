import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home } from './Home';
import { Usuarios } from './Usuarios';

const Tab = createBottomTabNavigator();

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Oculta o cabeçalho padrão das abas se preferir
        tabBarActiveTintColor: '#ff9500', // Cor do ícone/texto quando selecionado
        tabBarInactiveTintColor: '#6a859e', // Cor quando não selecionado
        tabStyle: { paddingBottom: 5, paddingTop: 5 },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={Home} 
      />
      <Tab.Screen 
        name="Usuarios" 
        component={Usuarios} 
      />
    </Tab.Navigator>
  );
}