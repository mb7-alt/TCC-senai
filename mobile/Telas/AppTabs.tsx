import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home } from './Home';
import { Usuarios } from './Usuarios';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { Movimento } from './Movimentar';
import { Adicionar } from './Itens';

// AQUI É ONDE A GNT MEXE NA NAVBAR DO APP, ESTILIZAÇÃO E TALS
const Tab = createBottomTabNavigator();

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#19296be0',
          height: 50,
          width: 390,
          display: 'flex',
          marginBottom: 10,
          width: 340,
          marginLeft: 20,
          borderRadius: 20,
        },
        tabBarIcon: ({ color }) => {
          let imageSource: any;

          if (route.name === 'Home') {
            imageSource =
             require('../assets/home-icon-silhouette.png')
          } else if (route.name === 'Usuarios') {
            imageSource = 
             require('../assets/user-shape.png')
          } else if (route.name === 'Movimentação') {
            imageSource = 
             require('../assets/recycle.png')
          } else if (route.name === 'Itens') {
            imageSource = 
             require('../assets/box.png')
          }

          // Retorna o componente do ícone
          return (
            <Image
              source={imageSource}
              resizeMode="contain"
              style={{
                width: 20,
                height: 20,
                tintColor: color,
                marginBottom: 5,
              }}
            />
          );
        },
        tabBarActiveTintColor: '#ff9500',
        tabBarInactiveTintColor: '#fcfcfca6',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={Home} 
      />
      <Tab.Screen 
        name="Usuarios" 
        component={Usuarios} 
      />
      <Tab.Screen 
        name="Movimentação" 
        component={Movimento} 
      />
      <Tab.Screen 
        name="Itens" 
        component={Adicionar} 
      />
    </Tab.Navigator>
  );
}