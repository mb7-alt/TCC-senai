import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AQUI ELE VAI PUXAR OS DADOS DO ITEM QUE TU COLOCOU O ID, VAI PREENCHER OS CAMPOS AUTOMÁTICOS E PERMITIR QUE VC PREENCHA OS OUTROS, DAÍ VAI ENVIAR OS NOVOS DADOS PRO BANCO
export function Movimento() {
  // Campos referentes aos dados do item
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [estoqueMin, setEstoqueMin] = useState('');
  
  // Campos referentes à movimentação/histórico
  const [pessoa, setPessoa] = useState('');
  const [destino, setDestino] = useState('');
  const [tipo, setTipo] = useState('');

  // Função para buscar os dados do item com base no ID digitado
  const buscarItemPorId = async (itemId: string) => {
    if (!itemId) return;
    
    try {
      const token = await AsyncStorage.getItem('userToken');

      const resposta = await fetch(`http://10.154.20.226:5000/api/item/${itemId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const dados = await resposta.json();
      
      if (resposta.ok) {
        setNome(dados.nome || '');
        setQuantidade(String(dados.quantidade ?? ''));
        setEstoqueMin(String(dados.estoque_min ?? ''));
      } 
        else {
        setNome('');
        setQuantidade('');
        setEstoqueMin('');
        console.error("Erro da API:", dados.erro);
      }
    } catch (erro) {
      console.error("Erro ao buscar produto:", erro);
    }   
  };

  // Função para enviar as alterações e registrar a movimentação na API
  const EnviarDadosMov = async () => {
    if (!id) {
      Alert.alert("Aviso", "Digite o ID do item antes de salvar.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');

      const resposta = await fetch('http://10.154.20.34:5000/api/movimentar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: id,
          quantidade: quantidade,
          pessoa: pessoa,
          destino: destino,
          tipo: tipo
        })
      });

      const dados = await resposta.json();

      if (resposta.ok && dados.sucesso) {
        Alert.alert("Sucesso", "Movimentação realizada e dados atualizados!");
      } else {
        Alert.alert("Erro", dados.erro || "Não foi possível atualizar os dados.");
      }
    } catch (erro) {
      console.error("Erro ao enviar dados:", erro);
      Alert.alert("Erro", "Falha na comunicação com o servidor.");
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
        <Text style={styles.move}>Movimentação de itens: </Text>
      </View>

      <TextInput
        style={styles.texto}
        placeholder="Digite o ID do item"
        value={id}
        onChangeText={(texto) => {
          setId(texto);
          buscarItemPorId(texto);
        }}
        keyboardType="numeric"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.texto}
        placeholder="Nome do Item"
        value={nome}
        editable={false}
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
        placeholder="Pessoa responsável"
        value={pessoa}
        onChangeText={setPessoa}
      />

      <TextInput
        style={styles.texto}
        placeholder="Destino"
        value={destino}
        onChangeText={setDestino}
      />

      <TextInput
        style={styles.texto}
        placeholder="Tipo (Ex: Saída / Entrada)"
        value={tipo}
        onChangeText={setTipo}
      />

      <TouchableOpacity style={styles.dados} onPress={EnviarDadosMov}>
        <Text style={styles.dadinhos}>Atualizar</Text>
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
  move: {
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