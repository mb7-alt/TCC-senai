import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  SafeAreaView
} from 'react-native';
import { Api } from '../Api';

export function Movimentar({ route }: any) {
  const [idDigitado, setIdDigitado] = useState('');
  const [carregandoItem, setCarregandoItem] = useState(false);
  const [itemAtual, setItemAtual] = useState<any>(null);

  // Campos da movimentação
  const [tipo, setTipo] = useState<'Entrada' | 'Saída'>('Entrada');
  const [quantidade, setQuantidade] = useState('1');
  const [pessoa, setPessoa] = useState('');
  const [destino, setDestino] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Lista de itens cadastrados para escolha rápida
  const [listaItens, setListaItens] = useState<any[]>([]);

  // Carrega catálogo inicial para seleção
  useEffect(() => {
    Api.getItens()
      .then(res => setListaItens(res.itens || []))
      .catch(e => console.log('Falha ao listar itens:', e));
  }, []);

  // Se veio parâmetro da rota (ex: da tela Home)
  useEffect(() => {
    if (route?.params?.itemId) {
      const id = String(route.params.itemId);
      setIdDigitado(id);
      carregarItemPorId(id);
    }
  }, [route?.params?.itemId]);

  const carregarItemPorId = useCallback(async (id: string) => {
    if (!id || !id.trim()) {
      Alert.alert('Aviso', 'Digite o ID do item.');
      return;
    }

    setCarregandoItem(true);
    try {
      const dados = await Api.getItem(id.trim());
      setItemAtual(dados);
      setQuantidade('1');
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Item não encontrado no sistema.');
      setItemAtual(null);
    } finally {
      setCarregandoItem(false);
    }
  }, []);

  const alterarDelta = (delta: number) => {
    const atual = parseInt(quantidade || '0', 10);
    const novo = Math.max(1, atual + delta);
    setQuantidade(String(novo));
  };

  const calcularNovoSaldo = () => {
    if (!itemAtual) return 0;
    const atual = parseInt(itemAtual.quantidade, 10);
    const mov = parseInt(quantidade || '0', 10);
    return tipo === 'Entrada' ? atual + mov : atual - mov;
  };

  const handleMovimentar = async () => {
    if (!itemAtual) {
      Alert.alert('Atenção', 'Busque e selecione um item primeiro.');
      return;
    }

    const qtdNum = parseInt(quantidade, 10);
    if (!qtdNum || qtdNum <= 0) {
      Alert.alert('Atenção', 'A quantidade deve ser maior que zero.');
      return;
    }

    if (!pessoa.trim() || !destino.trim()) {
      Alert.alert('Atenção', 'Preencha o responsável e o destino.');
      return;
    }

    if (tipo === 'Saída' && qtdNum > itemAtual.quantidade) {
      Alert.alert('Erro', `Estoque insuficiente! Disponível: ${itemAtual.quantidade} unidades.`);
      return;
    }

    setSalvando(true);
    try {
      const resp = await Api.movimentar({
        id: itemAtual.item.id,
        tipo,
        quantidade_movimentada: qtdNum,
        pessoa: pessoa.trim(),
        destino: destino.trim()
      });

      Alert.alert('Sucesso!', resp.mensagem || 'Movimentação gravada.');
      setPessoa('');
      setDestino('');
      setQuantidade('1');

      // Atualiza os dados do item
      carregarItemPorId(String(itemAtual.item.id));
    } catch (erro: any) {
      Alert.alert('Erro na Movimentação', erro.message || 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const novoSaldo = calcularNovoSaldo();
  const estoqueCritico = itemAtual ? novoSaldo <= itemAtual.estoque_min : false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Movimentação de Estoque</Text>
          <Text style={styles.subtitulo}>Entradas e retiradas de ferramentas</Text>
        </View>

        {/* Busca por ID */}
        <View style={styles.cardBusca}>
          <Text style={styles.label}>Buscar Ferramenta pelo ID:</Text>
          <View style={styles.linhaBusca}>
            <TextInput
              style={styles.inputBusca}
              placeholder="Ex: 1, 2, 3..."
              keyboardType="numeric"
              value={idDigitado}
              onChangeText={setIdDigitado}
            />
            <TouchableOpacity
              style={styles.botaoBuscar}
              onPress={() => carregarItemPorId(idDigitado)}
              disabled={carregandoItem}
            >
              {carregandoItem ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.textoBotaoBuscar}>Buscar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Seleção rápida em chip horizontal */}
          {listaItens.length > 0 && !itemAtual && (
            <View style={styles.boxSugestoes}>
              <Text style={styles.labelSugestoes}>Ou escolha um item rápido:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {listaItens.map((it) => (
                  <TouchableOpacity
                    key={it.id}
                    style={styles.chipItem}
                    onPress={() => {
                      setIdDigitado(String(it.id));
                      carregarItemPorId(String(it.id));
                    }}
                  >
                    <Text style={styles.textoChip}>#{it.id} {it.nome}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Detalhes do Item Carregado */}
        {itemAtual && (
          <View style={styles.cardDetalhes}>
            <View style={styles.linhaItemInfo}>
              {itemAtual.imagem ? (
                <Image source={{ uri: itemAtual.imagem }} style={styles.fotoItem} />
              ) : (
                <View style={styles.fotoPlaceholder}>
                  <Text style={{ fontSize: 28 }}>🛠</Text>
                </View>
              )}
              <View style={styles.infoTextos}>
                <Text style={styles.itemNome}>{itemAtual.nome}</Text>
                <Text style={styles.itemCategoria}>{itemAtual.categoria || 'Geral'}</Text>
                <View style={styles.linhaEstoque}>
                  <Text style={styles.textoEstoqueAtual}>
                    Estoque Atual: <Text style={styles.numeroDestaque}>{itemAtual.quantidade} un.</Text>
                  </Text>
                  <Text style={styles.textoEstoqueMin}>Mín: {itemAtual.estoque_min}</Text>
                </View>
              </View>
            </View>

            {/* Alternância Entrada / Saída */}
            <Text style={styles.label}>Tipo de Operação:</Text>
            <View style={styles.linhaTipo}>
              <TouchableOpacity
                style={[styles.botaoTipo, tipo === 'Entrada' && styles.botaoTipoEntradaAtivo]}
                onPress={() => setTipo('Entrada')}
              >
                <Text style={[styles.textoTipo, tipo === 'Entrada' && styles.textoTipoAtivo]}>
                  ↓ Entrada (Adicionar)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoTipo, tipo === 'Saída' && styles.botaoTipoSaidaAtivo]}
                onPress={() => setTipo('Saída')}
              >
                <Text style={[styles.textoTipo, tipo === 'Saída' && styles.textoTipoAtivo]}>
                  ↑ Saída (Retirar)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quantidade a Movimentar */}
            <Text style={styles.label}>Quantidade:</Text>
            <View style={styles.linhaQuantidade}>
              <TouchableOpacity style={styles.btnDelta} onPress={() => alterarDelta(-1)}>
                <Text style={styles.textoDelta}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.inputQuantidade}
                keyboardType="numeric"
                value={quantidade}
                onChangeText={setQuantidade}
              />
              <TouchableOpacity style={styles.btnDelta} onPress={() => alterarDelta(1)}>
                <Text style={styles.textoDelta}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDeltaMais} onPress={() => alterarDelta(5)}>
                <Text style={styles.textoDeltaMais}>+5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDeltaMais} onPress={() => alterarDelta(10)}>
                <Text style={styles.textoDeltaMais}>+10</Text>
              </TouchableOpacity>
            </View>

            {/* Previsão do Saldo */}
            <View style={[styles.boxSaldo, novoSaldo < 0 ? styles.boxSaldoErro : (estoqueCritico ? styles.boxSaldoAlerta : styles.boxSaldoOk)]}>
              <Text style={styles.labelPrevisao}>Saldo após a movimentação:</Text>
              <Text style={styles.valorPrevisao}>
                {novoSaldo} unidades {novoSaldo < 0 ? '(Estoque Negativo!)' : (estoqueCritico ? '(Alerta Estoque Baixo)' : '')}
              </Text>
            </View>

            {/* Responsável e Destino */}
            <Text style={styles.label}>Responsável / Solicitante:</Text>
            <TextInput
              style={styles.inputTexto}
              placeholder="Ex: João da Silva / Turma DS-2"
              value={pessoa}
              onChangeText={setPessoa}
            />

            <Text style={styles.label}>Destino / Motivo:</Text>
            <TextInput
              style={styles.inputTexto}
              placeholder="Ex: Oficina Mecânica 01 / Manutenção"
              value={destino}
              onChangeText={setDestino}
            />

            {/* Botão Confirmar */}
            <TouchableOpacity
              style={[styles.botaoConfirmar, salvando && styles.botaoDesabilitado]}
              onPress={handleMovimentar}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.textoConfirmar}>Confirmar Movimentação</Text>
              )}
            </TouchableOpacity>

            {/* Histórico do Item */}
            <View style={styles.secaoHistorico}>
              <Text style={styles.tituloHistorico}>Últimas movimentações deste item:</Text>
              {itemAtual.historico && itemAtual.historico.length > 0 ? (
                itemAtual.historico.slice(0, 5).map((h: any, idx: number) => (
                  <View key={h.id || idx} style={styles.linhaHistItem}>
                    <View style={[styles.badgeHist, h.tipo === 'Entrada' ? styles.badgeHistEntrada : styles.badgeHistSaida]}>
                      <Text style={styles.textoBadgeHist}>{h.tipo}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.histPessoa}>{h.pessoa} → {h.destino}</Text>
                      <Text style={styles.histData}>{h.data}</Text>
                    </View>
                    <Text style={styles.histQtd}>{h.quantidade || 1} un.</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.textoSemHistorico}>Nenhuma movimentação registrada.</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
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
  cardBusca: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  linhaBusca: {
    flexDirection: 'row',
    gap: 8,
  },
  inputBusca: {
    flex: 1,
    backgroundColor: '#eef3f7',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  botaoBuscar: {
    backgroundColor: '#ff9500',
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotaoBuscar: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  boxSugestoes: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  labelSugestoes: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 6,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chipItem: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  textoChip: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  cardDetalhes: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  linhaItemInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  fotoItem: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  fotoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextos: {
    flex: 1,
    justifyContent: 'center',
  },
  itemNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  itemCategoria: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  linhaEstoque: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  textoEstoqueAtual: {
    fontSize: 13,
    color: '#334155',
  },
  numeroDestaque: {
    fontWeight: 'bold',
    color: '#192a6b',
  },
  textoEstoqueMin: {
    fontSize: 12,
    color: '#94a3b8',
  },
  linhaTipo: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  botaoTipo: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  botaoTipoEntradaAtivo: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  botaoTipoSaidaAtivo: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  textoTipo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748b',
  },
  textoTipoAtivo: {
    color: '#0f172a',
  },
  linhaQuantidade: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 14,
  },
  btnDelta: {
    width: 44,
    height: 44,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoDelta: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  btnDeltaMais: {
    paddingHorizontal: 10,
    height: 44,
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoDeltaMais: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1d4ed8',
  },
  inputQuantidade: {
    flex: 1,
    height: 44,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  boxSaldo: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  boxSaldoOk: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  boxSaldoAlerta: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  boxSaldoErro: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  labelPrevisao: {
    fontSize: 12,
    color: '#64748b',
  },
  valorPrevisao: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2,
  },
  inputTexto: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 14,
    color: '#0f172a',
  },
  botaoConfirmar: {
    backgroundColor: '#192a6b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  textoConfirmar: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secaoHistorico: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  tituloHistorico: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 10,
  },
  linhaHistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  badgeHist: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeHistEntrada: {
    backgroundColor: '#dcfce7',
  },
  badgeHistSaida: {
    backgroundColor: '#fee2e2',
  },
  textoBadgeHist: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  histPessoa: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  histData: {
    fontSize: 11,
    color: '#94a3b8',
  },
  histQtd: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#192a6b',
  },
  textoSemHistorico: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});
