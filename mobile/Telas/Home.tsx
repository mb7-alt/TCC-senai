import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accordion, AccordionItem } from '../src/components/ui/accordion';

interface ItemProduto {
  id: number;
  nome: string;
  quantidade: number;
  estoque_min: number;
  preco: GLfloat;
  categoria: string;
  descricao: string
}

export function Home() {
  // PEGA OS DADOS DA TABELA SQL
  const [produtos, setProdutos] = useState<ItemProduto[]>([]);

  const pegarTabela = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      const resposta = await fetch('http://10.154.20.153:5000/api/itens', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const dados = await resposta.json();
      
      if (resposta.ok) {
        setProdutos(dados.itens || []);
      } else {
        console.error("Erro da API:", dados.erro);
      }
    } catch (erro) {
      console.error("Erro ao buscar produtos:", erro);
    }   
  }; 

  useEffect(() => {
    pegarTabela();
  }, []);

  // ELEMENTOS VISUAIS EM SI
  return (    
    <View style={styles.container}>      
      <Text style={styles.texto}>Lista de Produtos:</Text>
      <FlatList
        data={produtos}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => (
          <View style={{ padding: 5 }}>
            <Accordion style={styles.itens}>
              <AccordionItem title={item.nome || 'Nome não encontrado'}>
                <Text>{'ID: ' + item.id || 'ID não encontrado'}</Text>
                <Text>{'Quantidade: ' + item.quantidade || 'Quantidade não encontrada'}</Text>
                <Text>{'Quant. mínima: ' + item.estoque_min || 'Quant. mínima não encontrada'}</Text>
                <Text>{'Preço: R$' + item.preco || 'Preço não encontrado'}</Text>
                <Text>{'Categoria: ' + item.categoria || 'Categoria não encontrada'}</Text>
                <Text>{'Descrição: ' + item.descricao || 'Descrição não encontrada'}</Text>
              </AccordionItem>
            </Accordion>
          </View>
        )}
      />
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
    margin: 20,
    padding: 20,
  },
  texto: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#192a6b',
  },
  itens: {
    width: 300,
    borderColor: '#192a6b'
  }
});
