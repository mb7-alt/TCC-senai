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
