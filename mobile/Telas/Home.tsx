import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { Api } from '../Api';
import { Accordion, AccordionItem } from '../src/components/ui/accordion';

export interface ItemProduto {
  id: number;
  nome: string;
  quantidade: number;
  estoque_min: number;
  preco: number;
  categoria: string;
  descricao: string;
  imagem?: string;
  estoque_baixo?: boolean;
}

export function Home({ navigation }: any) {
  const [produtos, setProdutos] = useState<ItemProduto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroApenasBaixo, setFiltroApenasBaixo] = useState(false);

  const carregarProdutos = useCallback(async () => {
    try {
      const dados = await Api.getItens();
      setProdutos(dados.itens || []);
    } catch (erro: any) {
      console.error('Erro ao buscar produtos:', erro.message);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  const onRefresh = () => {
    setAtualizando(true);
    carregarProdutos();
  };

  // Filtros aplicados localmente em tempo real
  const produtosFiltrados = produtos.filter(p => {
    const nome = (p.nome || '').toLowerCase();
    const cat = (p.categoria || '').toLowerCase();
    const desc = (p.descricao || '').toLowerCase();
    const termo = termoBusca.toLowerCase().trim();

    const bateBusca = !termo || nome.includes(termo) || cat.includes(termo) || desc.includes(termo);
    const bateAlerta = !filtroApenasBaixo || (p.quantidade <= p.estoque_min);

    return bateBusca && bateAlerta;
  });

  const totalCritico = produtos.filter(p => p.quantidade <= p.estoque_min).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Cabeçalho da Lista */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Estoque Almoxarifado</Text>
          <Text style={styles.subtitulo}>{produtos.length} ferramentas cadastradas</Text>
        </View>

        {/* Resumo Rápido */}
        <View style={styles.resumoContainer}>
          <View style={[styles.cardResumo, styles.cardResumoTotal]}>
            <Text style={styles.resumoNumero}>{produtos.length}</Text>
            <Text style={styles.resumoLabel}>Total de Itens</Text>
          </View>
          <View style={[styles.cardResumo, styles.cardResumoAlerta]}>
            <Text style={[styles.resumoNumero, styles.resumoNumeroAlerta]}>{totalCritico}</Text>
            <Text style={styles.resumoLabel}>Estoque Baixo</Text>
          </View>
        </View>

        {/* Barra de Busca e Filtro */}
        <View style={styles.buscaContainer}>
          <TextInput
            style={styles.inputBusca}
            placeholder="Buscar por ferramenta ou categoria..."
            placeholderTextColor="#888"
            value={termoBusca}
            onChangeText={setTermoBusca}
          />
          <TouchableOpacity
            style={[styles.botaoFiltro, filtroApenasBaixo && styles.botaoFiltroAtivo]}
            onPress={() => setFiltroApenasBaixo(!filtroApenasBaixo)}
          >
            <Text style={[styles.textoFiltro, filtroApenasBaixo && styles.textoFiltroAtivo]}>
              {filtroApenasBaixo ? '⚠ Críticos' : 'Todos'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Itens */}
        {carregando ? (
          <View style={styles.centralizado}>
            <ActivityIndicator size="large" color="#192a6b" />
            <Text style={styles.textoCarregando}>Carregando catálogo...</Text>
          </View>
        ) : (
          <FlatList
            data={produtosFiltrados}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl refreshing={atualizando} onRefresh={onRefresh} colors={['#192a6b']} />
            }
            contentContainerStyle={styles.listaConteudo}
            ListEmptyComponent={
              <View style={styles.centralizado}>
                <Text style={styles.textoVazio}>Nenhum produto encontrado.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const estoqueBaixo = item.quantidade <= item.estoque_min;

              return (
                <View style={[styles.cardItem, estoqueBaixo && styles.cardItemAlerta]}>
                  {/* Linha Principal com Foto e Informações */}
                  <View style={styles.itemLinha}>
                    {item.imagem ? (
                      <Image source={{ uri: item.imagem }} style={styles.imagemProduto} />
                    ) : (
                      <View style={styles.imagemPlaceholder}>
                        <Text style={styles.iconePlaceholder}>📦</Text>
                      </View>
                    )}

                    <View style={styles.itemInfo}>
                      <View style={styles.itemTopo}>
                        <Text style={styles.itemNome} numberOfLines={1}>{item.nome}</Text>
                        <Text style={styles.itemId}>#{item.id}</Text>
                      </View>

                      <Text style={styles.itemCategoria}>{item.categoria || 'Geral'}</Text>

                      <View style={styles.estoqueLinha}>
                        <Text style={styles.itemPreco}>R$ {Number(item.preco || 0).toFixed(2)}</Text>
                        <View style={[styles.badgeEstoque, estoqueBaixo ? styles.badgeCritico : styles.badgeOk]}>
                          <Text style={styles.textoBadgeEstoque}>
                            {estoqueBaixo ? `Alerta: ${item.quantidade} un.` : `${item.quantidade} un.`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Accordion para Detalhes e Ação de Movimentar */}
                  <Accordion style={styles.accordionDetalhes}>
                    <AccordionItem title="Ver mais detalhes">
                      <View style={styles.detalhesBox}>
                        <Text style={styles.detalheTexto}>
                          <Text style={styles.detalheNegrito}>Descrição: </Text>
                          {item.descricao || 'Sem descrição.'}
                        </Text>
                        <Text style={styles.detalheTexto}>
                          <Text style={styles.detalheNegrito}>Estoque Mínimo: </Text>
                          {item.estoque_min} unidades
                        </Text>

                        {/* Botão de Atalho para Movimentar */}
                        <TouchableOpacity
                          style={styles.botaoAcaoMovimentar}
                          onPress={() => {
                            if (navigation && navigation.navigate) {
                              navigation.navigate('Movimentar', { itemId: item.id });
                            }
                          }}
                        >
                          <Text style={styles.textoAcaoMovimentar}>⇄ Movimentar Este Item</Text>
                        </TouchableOpacity>
                      </View>
                    </AccordionItem>
                  </Accordion>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    marginBottom: 12,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#192a6b',
  },
  subtitulo: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  resumoContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  cardResumo: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardResumoTotal: {
    borderLeftColor: '#192a6b',
  },
  cardResumoAlerta: {
    borderLeftColor: '#ef4444',
  },
  resumoNumero: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#192a6b',
  },
  resumoNumeroAlerta: {
    color: '#ef4444',
  },
  resumoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  buscaContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  inputBusca: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    fontSize: 14,
  },
  botaoFiltro: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoFiltroAtivo: {
    backgroundColor: '#ef4444',
  },
  textoFiltro: {
    color: '#475569',
    fontWeight: 'bold',
    fontSize: 13,
  },
  textoFiltroAtivo: {
    color: '#ffffff',
  },
  listaConteudo: {
    paddingBottom: 24,
  },
  cardItem: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardItemAlerta: {
    borderColor: '#fca5a5',
    backgroundColor: '#fffdfd',
  },
  itemLinha: {
    flexDirection: 'row',
    gap: 12,
  },
  imagemProduto: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  imagemPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconePlaceholder: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
    marginRight: 6,
  },
  itemId: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  itemCategoria: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  estoqueLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  itemPreco: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#192a6b',
  },
  badgeEstoque: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeOk: {
    backgroundColor: '#dcfce7',
  },
  badgeCritico: {
    backgroundColor: '#fee2e2',
  },
  textoBadgeEstoque: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  accordionDetalhes: {
    marginTop: 10,
    borderWidth: 0,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
  },
  detalhesBox: {
    gap: 6,
    paddingTop: 6,
  },
  detalheTexto: {
    fontSize: 13,
    color: '#334155',
  },
  detalheNegrito: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  botaoAcaoMovimentar: {
    backgroundColor: '#ff9500',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  textoAcaoMovimentar: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  textoCarregando: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 14,
  },
  textoVazio: {
    color: '#94a3b8',
    fontSize: 15,
  },
});
