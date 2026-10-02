import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ItemProduto {
  id: number;
  nome: string;
  quantidade?: number;
}

export function Home() { 
  const [produtos, setProdutos] = useState<ItemProduto[]>([]);

  const pegarTabela = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      const resposta = await fetch('http://10.154.20.15:5000/api/itens', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const dados = await resposta.json();
      
      if (resposta.ok) {
        // Acessa a chave 'itens' enviada pelo backend
        setProdutos(dados.itens || []);
      } else {
        console.error("Erro da API:", dados.erro);
      }
    } catch (erro) {
      console.error("Erro ao buscar produtos:", erro);
    }   
  }; 

  useEffect(() => {
    pegarTabela();
  }, []);

  return (    
    <View style={styles.container}>      
      <Text style={styles.texto}>Lista de Produtos:</Text>
      <FlatList
        data={produtos}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <Text>{item.nome || 'Sem nome'}</Text>
          </View>
        )}
      />
    </View>   
  ); 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 20,
  },
  texto: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#192a6b',
  }
});