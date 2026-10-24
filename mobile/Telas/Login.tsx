<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Api, getBaseUrl, setBaseUrl } from '../Api';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarConfigUrl, setMostrarConfigUrl] = useState(false);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    getBaseUrl().then(url => setApiUrl(url));
  }, []);

  const handleSalvarUrl = async () => {
    if (!apiUrl.trim()) {
      Alert.alert('Aviso', 'Digite uma URL válida.');
      return;
    }
    const nova = await setBaseUrl(apiUrl);
    setApiUrl(nova);
    Alert.alert('Sucesso', `URL do servidor atualizada para:\n${nova}`);
    setMostrarConfigUrl(false);
  };

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    setCarregando(true);
    try {
      await Api.login(email.trim(), senha.trim());
      onLoginSuccess();
    } catch (erro: any) {
      Alert.alert('Erro ao Entrar', erro.message || 'Verifique suas credenciais e conexão.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Cabeçalho SENAI */}
        <View style={styles.header}>
          <Text style={styles.senai}>SENAI</Text>
          <Text style={styles.almoxarifado}>Almoxarifado</Text>
          <Text style={styles.subtitulo}>Sistema Integrado de Gestão</Text>
        </View>

        {/* Card do Formulário */}
        <View style={styles.card}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="exemplo@senai.br"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#999"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.botaoEntrar, carregando && styles.botaoDesabilitado]}
            onPress={handleLogin}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBotao}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Dica de Contas de Teste */}
          <View style={styles.boxDica}>
            <Text style={styles.textoDicaTitulo}>Contas padrão para teste:</Text>
            <Text style={styles.textoDica}>Admin: ednaldo@gmail.com (123456)</Text>
            <Text style={styles.textoDica}>Comum: mauricio@gmail.com (123456)</Text>
          </View>
        </View>

        {/* Configuração Rápida de IP do Servidor */}
        <TouchableOpacity
          style={styles.botaoConfigUrl}
          onPress={() => setMostrarConfigUrl(!mostrarConfigUrl)}
        >
          <Text style={styles.textoConfigUrl}>
            {mostrarConfigUrl ? '▲ Ocultar configuração de servidor' : '▼ Configurar IP / Servidor do Backend'}
          </Text>
        </TouchableOpacity>

        {mostrarConfigUrl && (
          <View style={styles.boxConfigUrl}>
            <Text style={styles.label}>URL da API (Backend):</Text>
            <TextInput
              style={styles.input}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="Ex: http://192.168.1.100:5000/api"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.botaoSalvarUrl} onPress={handleSalvarUrl}>
              <Text style={styles.textoSalvarUrl}>Salvar URL</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  senai: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#192a6b',
    letterSpacing: 2,
  },
  almoxarifado: {
    fontSize: 26,
    color: '#ff9500',
    fontWeight: 'bold',
    marginTop: -6,
  },
  subtitulo: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#192a6b',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#eef3f7',
    borderColor: '#cbd5e1',
    borderWidth: 1.5,
    borderRadius: 10,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    color: '#1e293b',
  },
  botaoEntrar: {
    backgroundColor: '#192a6b',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  textoBotao: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  boxDica: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  textoDicaTitulo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 3,
  },
  textoDica: {
    fontSize: 12,
    color: '#64748b',
  },
  botaoConfigUrl: {
    alignItems: 'center',
    marginTop: 20,
    padding: 8,
  },
  textoConfigUrl: {
    fontSize: 13,
    color: '#192a6b',
    fontWeight: '600',
  },
  boxConfigUrl: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  botaoSalvarUrl: {
    backgroundColor: '#ff9500',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  textoSalvarUrl: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
=======
import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setItem] = useState('');
  const [senha, setQtde] = useState('');

  // AQUI É ONDE PEGA INFORMAÇÃO NAS CAIXAS DE TEXTO E ENVIA PRA API, DAÍ ELA VÊ SE EXISTEM NO BANCO DE DADOS
  const enviarFormulario = async () => {
    try {
      const resposta = await fetch('http://10.154.20.226:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const dadosRetorno = await resposta.json();

      if (resposta.ok && dadosRetorno.sucesso) {
        await AsyncStorage.setItem('userToken', dadosRetorno.token);
        
        onLoginSuccess();
      } else {
        Alert.alert("Erro", dadosRetorno.erro || "Credenciais inválidas");
      }
    } catch (erro) {
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
    }
  };

  // OS ELEMENTOS VISUAIS EM SI
  return (
    <View style={styles.container}>
      <Text style={styles.senai}>SENAI</Text>
      <Text style={styles.almoxarifado}>Almoxarifado</Text>
      <TextInput
        style={styles.texto}
        placeholder="Digite seu e-mail"
        value={email}
        onChangeText={setItem}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.texto}
        placeholder="Digite sua senha"
        value={senha}
        onChangeText={setQtde}
        secureTextEntry
      />
      <TouchableOpacity style={styles.dados} onPress={enviarFormulario}>
        <Text style={styles.dadinhos}>Entrar</Text>
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
>>>>>>> 449e082883ed487d46ad571dab8210613b1942f2
  },
});