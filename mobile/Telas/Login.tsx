import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, Alert} from 'react-native';

export function Login({ onLoginSucess}: {onLoginSucess: () => void}) {
  // AQUI TEMO AS ESTILIZAÇÕES
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 20,
      padding: 20,
      fontFamily: 'Segoe UI',
    },

    senai: {
      fontSize: 50,
      fontWeight: 'bold',
      color: '#192a6b'
    },

    almoxarifado: {
      fontSize: 30,
      color: '#ff9500',
      fontWeight: 'bold',
    },

    texto: {
      width: 220,
      backgroundColor: 'rgb(226, 244, 247)',
      borderColor: '#6a859e',
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
    },

    dadinhos: {
      color: '#fff',
      paddingHorizontal: 40,
      paddingVertical: 12,
      fontSize: 18,
    }
  });
  
  // O MÉTODO DE ENVIAR AS INFORMAÇÕES PRA API, ASSIM ELA VERIFICA SE EXISTEM NO BANCO DE DADOS
  const [email, setItem] = useState('');
  const [senha, setQtde] = useState('');

  const enviarFormulario = async () => {
    try {
      const resposta = await fetch('http://10.154.20.34:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });
    

      const dadosRetorno = await resposta.json();

      if (resposta.ok && dadosRetorno.sucesso) {
        onLoginSucess();
      } else {
        Alert.alert("Erro", dadosRetorno.erro || "Credenciais inválidas");
      }
    } catch (erro) {
      Alert.alert("Erro de conexão", "Não foi possível conectar ao servidor.");
    }
  };
  // OS ELEMENTOS VISUAIS EM SI
  return (
    <View style={styles.container}>
      <Text style={styles.senai}>
        SENAI
      </Text>
      <Text style={styles.almoxarifado}>
        Almoxarifado
      </Text>
      <TextInput
        style={styles.texto}
        placeholder="Digite seu e-mail"
        value={email}
        onChangeText={setItem}
      />
      <TextInput
        style={styles.texto}
        placeholder="Digite sua senha"
        value={senha}
        onChangeText={setQtde}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.dados} onPress={enviarFormulario}>
        <Text style={styles.dadinhos}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}
