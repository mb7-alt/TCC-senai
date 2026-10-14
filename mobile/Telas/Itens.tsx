import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ItemProduto {
  id: number;
  nome: string;
  quantidade: number;
  estoque_min: number;
  preco: GLfloat;
  categoria: string;
  descricao: string
}

export function Adicionar() { 
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [estoqueMin, setEstoqueMin] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setdescricao] = useState('');
  const [imagem, setImagem] = useState('');

  const CadastrarProduto = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      const resposta = await fetch('http://10.154.20.83:5000/api/itens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nome, quantidade, estoqueMin, preco, descricao, imagem }),
      });

      const dadosRetorno = await resposta.json();

      if (resposta.ok && dadosRetorno.sucesso) {
        Alert.alert("Item cadastrado");
      } else {
        Alert.alert("Erro", dadosRetorno.erro || "Credenciais inválidas");
      }
    } catch (erro) {
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
    }
  };

  // ELEMENTOS VISUAIS EM SI
  return (
      <View style={styles.container}>
        <Text style={styles.senai}>SENAI</Text>
        <Text style={styles.almoxarifado}>Almoxarifado</Text>
  
        <TextInput
          style={styles.texto}
          placeholder="Nome do Item"
          value={nome}
          onChangeText={setNome}
        />
  
        <TextInput
          style={styles.texto}
          placeholder="Quantidade"
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="numeric"
        />
  
        <TextInput
          style={styles.texto}
          placeholder="Estoque Mínimo"
          value={estoqueMin}
          onChangeText={setEstoqueMin}
          keyboardType="numeric"
          editable={false}
        />
  
        <TextInput
          style={styles.texto}
          placeholder="Preço do produto"
          value={preco}
          onChangeText={setPreco}
        />
  
        <TextInput
          style={styles.texto}
          placeholder="Descrição"
          value={descricao}
          onChangeText={setdescricao}
        />
  
        <TextInput
          style={styles.texto}
          placeholder="Imagem"
          value={imagem}
          onChangeText={setImagem}
        />
  
        <TouchableOpacity style={styles.dados} onPress={CadastrarProduto}>
          <Text style={styles.dadinhos}>Adicionar item</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // ESTILIZAÇÃO
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 20,
      padding: 20,
    },
    senai: {
      fontSize: 50,
      fontWeight: 'bold',
      color: '#192a6b',
    },
    almoxarifado: {
      fontSize: 30,
      color: '#ff9500',
      fontWeight: 'bold',
    },
    texto: {
      width: 260,
      backgroundColor: 'rgb(226, 244, 247)',
      borderColor: '#6a859e',
      borderWidth: 2,
      borderRadius: 10,
      margin: 6,
      fontSize: 15,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    dados: {
      width: 200,
      height: 50,
      borderRadius: 10,
      backgroundColor: '#192a6b',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15,
    },
    dadinhos: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
});