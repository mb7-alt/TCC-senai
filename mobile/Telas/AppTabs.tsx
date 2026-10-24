<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home } from './Home';
import { Movimentar } from './Movimentar';
import { Usuarios } from './Usuarios';
import { Api } from '../Api';

const Tab = createBottomTabNavigator();

// Tela de Perfil e Configurações / Sair
function PerfilScreen({ onLogout }: { onLogout: () => void }) {
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    Api.getUsuarioLogado().then(u => setUsuario(u));
  }, []);

  const confirmarLogout = () => {
    Alert.alert('Sair do Sistema', 'Deseja realmente encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await Api.logout();
          onLogout();
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.perfilContainer}>
      <View style={styles.perfilCard}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 36 }}>👤</Text>
        </View>

        <Text style={styles.perfilEmail}>{usuario?.email || 'Usuário Almoxarifado'}</Text>
        <View style={styles.perfilBadge}>
          <Text style={styles.perfilBadgeTexto}>
            {usuario?.tipo === 'admin' ? 'Perfil Administrador' : 'Perfil Operador'}
          </Text>
        </View>

        <View style={styles.divisor} />

        <Text style={styles.infoSistema}>SENAI - Almoxarifado Integrado</Text>
        <Text style={styles.infoVersao}>Versão Mobile 2.0 (React Native + Expo)</Text>

        <TouchableOpacity style={styles.botaoLogout} onPress={confirmarLogout}>
          <Text style={styles.textoLogout}>Encerrar Sessão (Sair)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

interface AppTabsProps {
  onLogout?: () => void;
}

export function AppTabs({ onLogout = () => {} }: AppTabsProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ff9500',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="Movimentar"
        component={Movimentar}
        options={{
          tabBarLabel: 'Movimentar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⇄</Text>,
        }}
      />
      <Tab.Screen
        name="Usuarios"
        component={Usuarios}
        options={{
          tabBarLabel: 'Usuários',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="Perfil"
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙</Text>,
        }}
      >
        {() => <PerfilScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  perfilContainer: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    justifyContent: 'center',
    padding: 24,
  },
  perfilCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eef3f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  perfilEmail: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  perfilBadge: {
    backgroundColor: '#ff9500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  perfilBadgeTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  divisor: {
    width: '100%',
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 20,
  },
  infoSistema: {
    fontSize: 13,
    fontWeight: '600',
    color: '#192a6b',
  },
  infoVersao: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    marginBottom: 24,
  },
  botaoLogout: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  textoLogout: {
    color: '#b91c1c',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
=======
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home } from './Home';
import { Usuarios } from './Usuarios';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { Movimento } from './Movimentar';
import { Adicionar } from './Itens';

const Tab = createBottomTabNavigator();

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#192a6b',
          opacity: 0.9,
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
        tabBarInactiveTintColor: '#181818',
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
>>>>>>> 449e082883ed487d46ad571dab8210613b1942f2
