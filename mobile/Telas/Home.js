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
        const resposta = await fetch('http://10.154.20.83:5000/api/itens', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    finally
    {};
  };

  return (
    <View style={styles.container}>
      <Text>
        {dados}
      </Text>
    </View>
  );

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
}
