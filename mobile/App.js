import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

//PÁGINA DE LOGIN
export default function AtualizaEstoque() {
  const [email, setItem] = useState('');
  const [senha, setQtde] = useState('');

  const enviarFormulario = async () => {
    await fetch('http://10.154.20.83:5000/api/login', {
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
        placeholder="Digite o email"
        value={email}
        onChangeText={setItem}
      />
      <TextInput
        placeholder="Digite a senha"
        value={senha}
        onChangeText={setQtde}
        keyboardType="numeric"
      />
      <Button title="Enviar Dados" onPress={enviarFormulario} />
    </View>
  );
}

//PÁGINA DO ESTOQUE (HOME)
export function Home() { 

  const pegarTabela = async () => {
     const [itens] = await fetch('http://10.154.20.83:5000/api/itens', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  const [dados] = await itens.json();
  setDados(dados);
  };


  return (
    <View style={styles.container}>
      <Text>
        {dados}
      </Text>
    </View>
  );
}

//CSS (BEM PARECIDO PELO MENOS)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 20,
  },
});