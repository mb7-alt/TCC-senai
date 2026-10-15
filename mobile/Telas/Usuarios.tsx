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
      <Text style={styles.senai}>SENAI</Text>
      <Text style={styles.almoxarifado}>Almoxarifado</Text>
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
  );
}

// ESTILIZAÇÃO
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
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
    width: 220,
    backgroundColor: '#fff',
    borderColor: '#192a6b',
    borderWidth: 2,
    borderRadius: 10,
    margin: 10,
    fontSize: 15,
    paddingHorizontal: 10,
  },
  dados: {
    width: 130,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#192a6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dadinhos: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});