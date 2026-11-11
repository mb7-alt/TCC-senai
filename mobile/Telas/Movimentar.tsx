// PÁGINA DE MOVIMENTAÇÃO DO EXPO
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// aqui ele vai puxar os dados do item que tu colocou o id, vai preencher os campos automáticos e permitir o preenchimento dos outros, e depois enviar os novos dados
export function Movimento() {
  // Campos referentes aos dados do item
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [estoqueMin, setEstoqueMin] = useState('xx');
  
  // Campos referentes à movimentação/histórico
  const [pessoa, setPessoa] = useState('');
  const [destino, setDestino] = useState('');
  const [tipo, setTipo] = useState<string>('Saída');

  const options = [
    { label: 'Saída', value: 'Saída' },
    { label: 'Entrada', value: 'Entrada' },
  ];

  // Função para buscar os dados do item com base no ID digitado
  const buscarItemPorId = async (itemId: string) => {
    if (!itemId) return;
    
    try {
      const token = await AsyncStorage.getItem('userToken');

      const resposta = await fetch(`http://10.154.20.43:5000/api/item/${itemId}`, {
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

      const resposta = await fetch('http://10.154.20.43:5000/api/movimentar', {
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

      <Text style={styles.texto2}>Estoque mínimo: {estoqueMin} </Text>

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

      <Text style={styles.texto3}>Tipo de movimentação:</Text>
      <View style={styles.opcoes}>
        {options.map((item) => {
          const isSelected = tipo === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={styles.radioButtonContainer}
              onPress={() => setTipo(item.value)}
            >
              <View style={styles.radioOuter}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
  texto2: {
    color: '#192a6b',
    fontWeight: 'bold',
    marginTop: -7,
    marginLeft: 55,
    marginBottom: 5,
  },
  texto3: {
    fontWeight: 'bold',
    marginLeft: 100,
    marginBottom: 5
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
  opcoes: {
    flexDirection: 'row',
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 75,
    marginRight: 10,
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#192a6b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#192a6b',
  },
  label: {
    fontSize: 16,
  },
  dadinhos: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});