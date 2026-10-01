import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity} from 'react-native';

export function Login() {
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
      width: 220,
      backgroundColor: 'rgb(226, 244, 247)',
      borderColor: '#6a859e',
      borderWidth: 2,
      borderRadius: 10,
      margin: 10,
      fontSize: 15,
      fontFamily: 'Segoe UI',
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
      fontFamily: 'Segoe UI',
    }
  });
  
  const [email, setItem] = useState('');
  const [senha, setQtde] = useState('');

  const enviarFormulario = async () => {
    await fetch('http://10.154.20.34:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    });
  };

  return (
    <View style={styles.container}>
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
