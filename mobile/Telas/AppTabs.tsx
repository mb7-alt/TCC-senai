import { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home } from './Home';
import { Usuarios } from './Usuarios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image, ActivityIndicator, View } from 'react-native';
import { Movimento } from './Movimentar';
import { Adicionar } from './Itens';
import { RouteProp, ParamListBase } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const tabNavigatorOptions = ({ route }: { route: RouteProp<ParamListBase, string> }) => ({
  tabBarStyle: {
    backgroundColor: '#19296bd5',
    marginBottom: 10,
    width: 340,
    marginLeft: 20,
    borderRadius: 20,
  },
  tabBarIcon: ({ color }: { color: string }) => {
    let imageSource: any;

    if (route.name === 'Home') {
      imageSource = require('../assets/home-icon-silhouette.png');
    } else if (route.name === 'Usuarios') {
      imageSource = require('../assets/user-shape.png');
    } else if (route.name === 'Movimento') {
      imageSource = require('../assets/user-shape.png');
    } else if (route.name === 'Adicionar') {
      imageSource = require('../assets/user-shape.png');
    } else {
      imageSource = require('../assets/home-icon-silhouette.png'); 
    }

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
});

export function AppTabs() {

  const [tipo, setTipo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function carregarTipoUsuario() {
      try {
        const valor = await AsyncStorage.getItem('userTipo');
        setTipo(valor);
      } catch (error) {
        console.error("Erro ao buscar tipo de usuário:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarTipoUsuario();
  }, []); 

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#19296bd5" />
      </View>
    );
  }

  if (tipo === "admin") {
    return (
      <Tab.Navigator screenOptions={tabNavigatorOptions}>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Usuarios" component={Usuarios} />
        <Tab.Screen name="Movimentação" component={Movimento} />
        <Tab.Screen name="Itens" component={Adicionar} />
      </Tab.Navigator>
    );
  } 
  else {
    return (
      <Tab.Navigator screenOptions={tabNavigatorOptions}>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Movimentação" component={Movimento} />
        <Tab.Screen name="Itens" component={Adicionar} />
      </Tab.Navigator>
    );
  }
}
