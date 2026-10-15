import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function Usuarios({ onAddSuccess }: { onAddSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('');

  const EnviarInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const resposta = await fetch('http://10.154.20.83:5000/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, senha, tipo }),
      });

      const textoBruto = await resposta.text();
      console.log('Status da resposta:', resposta.status);
      console.log('Corpo da resposta:', textoBruto);

      let dadosRetorno;
      try {
        dadosRetorno = JSON.parse(textoBruto);
      } catch (e) {
        dadosRetorno = { sucesso: false, mensagem: textoBruto };
      }

      // Verifica se deu certo (Status 200 ou 201 e sucesso true)
      if (resposta.ok && dadosRetorno.sucesso) {
        // Chamada segura: só executa se onAddSuccess existir
        if (typeof onAddSuccess === 'function') {
          onAddSuccess();
        }
        Alert.alert("Sucesso", dadosRetorno.mensagem || "Usuário cadastrado com sucesso!");
        return;
      }

      // Se o servidor retornou erro controlado
      Alert.alert("Aviso", dadosRetorno.erro || dadosRetorno.mensagem || "Informações inválidas. Tente novamente");

    } catch (erro) {
      console.error("Erro de conexão detalhado:", erro);
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor. Verifique o IP e se a API está rodando.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.senai}>SENAI</Text>
        <Text style={styles.almoxarifado}>Almoxarifado</Text>
      </View>
      <View style={styles.secondHeader}>
        <Text style={styles.cadastro}>Cadastro de Usuários:</Text>
      <TextInput
        style={styles.texto}
        placeholder="Digite o e-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.texto}
        placeholder="Digite a senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      <TextInput
        style={styles.texto}
        placeholder="Digite o posto do usuário"
        value={tipo}
        onChangeText={setTipo}
      />
      <TouchableOpacity style={styles.dados} onPress={EnviarInfo}>
        <Text style={styles.dadinhos}>Cadastrar</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
}

// ESTILIZAÇÃO
const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
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
  cadastro: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 40,
    color: '#192a6b',
    textAlign: 'center',
  },
  secondHeader: {
    marginTop: 50,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 5,
    padding: 10,
  },
  texto: {
    width: 250,
    height: 60,
    backgroundColor: 'rgb(255, 255, 255)',
    borderColor: '#192a6b',
    borderWidth: 2,
    borderRadius: 10,
    margin: 8,
    fontSize: 15,
    paddingHorizontal: 10,
    alignSelf: 'center',
  },
  dados: {
    width: 190,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#192a6b',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  dadinhos: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});