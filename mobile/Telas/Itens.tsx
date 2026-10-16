import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AQUI DEFINE OS TIPOS DE CADA ELEMENTO DA TABELA. NÚMEROS, NOMES, ETC
interface ItemProduto {
  id: number;
  nome: string;
  quantidade: number;
  estoque_min: number;
  preco: GLfloat;
  categoria: string;
  descricao: string
}

// AQUI ELE EMPURRA OS DADOS PRO BANCO PARA PREENCHER A TABELA COM O NOVO ITEM, RECONHECENDO O USUÁRIO COM O "userToken"
export function Adicionar() { 
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [estoqueMin, setEstoqueMin] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descricao, setdescricao] = useState('');
  const [imagem, setImagem] = useState('');

  const CadastrarProduto = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      const resposta = await fetch('http://10.154.20.34:5000/api/itens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nome, quantidade, estoqueMin, preco, categoria, descricao, imagem }),
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
        <View style={styles.header}>
        <Text style={styles.senai}>SENAI</Text>
        <Text style={styles.almoxarifado}>Almoxarifado</Text>
        </View>

        <View style={styles.secondHeader}>
          <Text style={styles.item}>Cadastro de Itens: </Text>
        </View>

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
          keyboardType='numeric'
        />
  
        <TextInput
          style={styles.texto}
          placeholder="Estoque Mínimo"
          value={estoqueMin}
          onChangeText={setEstoqueMin}
          keyboardType="numeric"
        />
  
        <TextInput
          style={styles.texto}
          placeholder="Preço do produto"
          value={preco}
          onChangeText={setPreco}
          keyboardType='decimal-pad'
        />

        <TextInput
          style={styles.texto}
          placeholder="Categoria do produto"
          value={categoria}
          onChangeText={setCategoria}
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
          keyboardType='url'
        />
  
        <TouchableOpacity style={styles.dados} onPress={CadastrarProduto}>
          <Text style={styles.dadinhos}>Adicionar item</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // ESTILIZAÇÃO
  const styles = StyleSheet.create({
    header: {
      alignItems: 'flex-start',
    },
    secondHeader: {
      marginTop: 30,
    },
    item: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      marginTop: 10,
      color: '#192a6b',
      textAlign: 'center',
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 10,
    },
    senai: {
      fontSize: 40,
      fontWeight: 'bold',
      color: '#192a6b',
      textAlign: 'left',
    },
    almoxarifado: {
      fontSize: 20,
      color: '#ff9500',
      fontWeight: 'bold',
      textAlign: 'left',
    },
    texto: {
      width: 260,
      height: 45,
      backgroundColor: '#fff',
      borderColor: '#192a6b',
      borderWidth: 2,
      borderRadius: 10,
      margin: 6,
      fontSize: 15,
      paddingHorizontal: 10,
      paddingVertical: 8,
      alignSelf: 'center',
    },
    dados: {
      width: 200,
      height: 50,
      borderRadius: 10,
      backgroundColor: '#192a6b',
      marginTop: 10,
      alignSelf: 'center',
      justifyContent: 'center',
    },
    dadinhos: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
});