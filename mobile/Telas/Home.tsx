import { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';

// AQUI TEMO AS ESTILIZAÇÕES
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

// O MÉTODO DE PEGAR INFORMAÇÕES DO BANCO DE DADOS
export function Home() { 
  const [produtos, setProdutos] = useState([]);

  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [preço, setPreço] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [min, setMin] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descriçao, setDescriçao] = useState('');
  const [imagem, setImagem] = useState('');

  const pegarTabela = async () => {
    try{
        const resposta = await fetch('http://10.154.20.34:5000/api/itens', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    finally
    {};
  };

  // OS ELEMENTOS VISUAIS EM SI
  return (
    <View style={styles.container}>
      <Text>
        {produtos}
      </Text>
    </View>
  );
}
