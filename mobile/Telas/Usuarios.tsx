import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { Api } from '../Api';

interface Usuario {
  id?: number;
  email: string;
  tipo: string;
  data_criacao?: string;
}

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

  // Formulário de novo usuário
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoTipo, setNovoTipo] = useState<'comum' | 'admin'>('comum');
  const [salvando, setSalvando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      const user = await Api.getUsuarioLogado();
      setUsuarioLogado(user);

      const dados = await Api.getUsuarios();
      setUsuarios(dados.usuarios || []);
    } catch (erro: any) {
      if (erro.status === 403) {
        // Usuário comum
        setUsuarios([]);
      } else {
        console.error('Erro ao buscar usuários:', erro.message);
      }
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const onRefresh = () => {
    setAtualizando(true);
    carregarDados();
  };

  const handleCadastrar = async () => {
    if (!novoEmail.trim() || !novaSenha.trim()) {
      Alert.alert('Aviso', 'Preencha o e-mail e a senha do novo usuário.');
      return;
    }

    setSalvando(true);
    try {
      const res = await Api.cadastrarUsuario({
        email: novoEmail.trim(),
        senha: novaSenha.trim(),
        tipo: novoTipo
      });

      Alert.alert('Sucesso!', res.mensagem || 'Usuário cadastrado com sucesso.');
      setNovoEmail('');
      setNovaSenha('');
      setNovoTipo('comum');
      setMostrarForm(false);
      carregarDados();
    } catch (erro: any) {
      Alert.alert('Erro ao Cadastrar', erro.message || 'Falha ao salvar usuário.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = (email: string) => {
    if (usuarioLogado && usuarioLogado.email === email) {
      Alert.alert('Ação Negada', 'Você não pode excluir sua própria conta enquanto estiver logado.');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o usuário "${email}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await Api.deletarUsuario(email);
              Alert.alert('Sucesso', 'Usuário removido.');
              carregarDados();
            } catch (erro: any) {
              Alert.alert('Erro', erro.message || 'Falha ao excluir usuário.');
            }
          }
        }
      ]
    );
  };

  // Se o usuário não for administrador
  if (!carregando && usuarioLogado && usuarioLogado.tipo !== 'admin') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.containerCentro}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🔒</Text>
          <Text style={styles.tituloAviso}>Acesso Restrito</Text>
          <Text style={styles.textoAviso}>
            O gerenciamento de usuários é exclusivo para contas de nível Administrador.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.titulo}>Gerenciamento de Usuários</Text>
            <Text style={styles.subtitulo}>{usuarios.length} contas cadastradas</Text>
          </View>
          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={() => setMostrarForm(!mostrarForm)}
          >
            <Text style={styles.textoBotaoAdicionar}>{mostrarForm ? '✕ Fechar' : '+ Novo'}</Text>
          </TouchableOpacity>
        </View>

        {/* Formulário de Cadastro Rápido (Expansível) */}
        {mostrarForm && (
          <View style={styles.cardForm}>
            <Text style={styles.formTitulo}>Cadastrar Novo Usuário</Text>

            <TextInput
              style={styles.input}
              placeholder="E-mail (ex: novo@senai.br)"
              value={novoEmail}
              onChangeText={setNovoEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Senha de acesso"
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry
            />

            {/* Seletor de Perfil */}
            <View style={styles.linhaTipo}>
              <TouchableOpacity
                style={[styles.btnTipo, novoTipo === 'comum' && styles.btnTipoAtivo]}
                onPress={() => setNovoTipo('comum')}
              >
                <Text style={[styles.textoBtnTipo, novoTipo === 'comum' && styles.textoBtnTipoAtivo]}>
                  Comum (Operador)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnTipo, novoTipo === 'admin' && styles.btnTipoAtivo]}
                onPress={() => setNovoTipo('admin')}
              >
                <Text style={[styles.textoBtnTipo, novoTipo === 'admin' && styles.textoBtnTipoAtivo]}>
                  Administrador
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
              onPress={handleCadastrar}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.textoSalvar}>Cadastrar Conta</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Usuários */}
        {carregando ? (
          <View style={styles.centralizado}>
            <ActivityIndicator size="large" color="#192a6b" />
          </View>
        ) : (
          <FlatList
            data={usuarios}
            keyExtractor={(item) => item.email}
            refreshControl={
              <RefreshControl refreshing={atualizando} onRefresh={onRefresh} colors={['#192a6b']} />
            }
            contentContainerStyle={styles.listaConteudo}
            ListEmptyComponent={
              <View style={styles.centralizado}>
                <Text style={styles.textoVazio}>Nenhum usuário cadastrado.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const ehAdmin = item.tipo === 'admin';
              const souEu = usuarioLogado?.email === item.email;

              return (
                <View style={styles.cardUsuario}>
                  <View style={styles.infoUsuario}>
                    <Text style={styles.emailUsuario}>{item.email}</Text>
                    <View style={[styles.badgeTipo, ehAdmin ? styles.badgeAdmin : styles.badgeComum]}>
                      <Text style={styles.textoBadgeTipo}>{ehAdmin ? 'Administrador' : 'Comum'}</Text>
                    </View>
                  </View>

                  {!souEu ? (
                    <TouchableOpacity
                      style={styles.botaoExcluir}
                      onPress={() => handleExcluir(item.email)}
                    >
                      <Text style={styles.textoExcluir}>🗑</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.badgeVoce}>
                      <Text style={styles.textoBadgeVoce}>Você</Text>
                    </View>
                  )}
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
  containerCentro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  tituloAviso: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  textoAviso: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#192a6b',
  },
  subtitulo: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  botaoAdicionar: {
    backgroundColor: '#ff9500',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textoBotaoAdicionar: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cardForm: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    elevation: 2,
  },
  formTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#192a6b',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  linhaTipo: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  btnTipo: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  btnTipoAtivo: {
    backgroundColor: '#192a6b',
  },
  textoBtnTipo: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  textoBtnTipoAtivo: {
    color: '#ffffff',
  },
  botaoSalvar: {
    backgroundColor: '#ff9500',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  textoSalvar: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listaConteudo: {
    paddingBottom: 24,
  },
  cardUsuario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  infoUsuario: {
    flex: 1,
  },
  emailUsuario: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  badgeTipo: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAdmin: {
    backgroundColor: '#fef3c7',
  },
  badgeComum: {
    backgroundColor: '#f1f5f9',
  },
  textoBadgeTipo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  botaoExcluir: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  textoExcluir: {
    fontSize: 16,
  },
  badgeVoce: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  textoBadgeVoce: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0369a1',
  },
  centralizado: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  textoVazio: {
    color: '#94a3b8',
    fontSize: 14,
  },
});