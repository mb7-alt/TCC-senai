import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base padrão - pode ser alterada dinamicamente pelo usuário no app
export const DEFAULT_API_URL = 'http://10.0.2.2:5000/api'; // 10.0.2.2 é o localhost no emulador Android

/**
 * Obtém a URL base configurada (ou o valor padrão)
 */
export async function getBaseUrl() {
  try {
    const salva = await AsyncStorage.getItem('custom_api_url');
    if (salva && salva.trim()) {
      return salva.trim().replace(/\/+$/, '');
    }
  } catch (e) {
    console.error('Erro ao ler custom_api_url:', e);
  }
  return DEFAULT_API_URL;
}

/**
 * Salva uma nova URL base customizada (ex: http://192.168.1.100:5000/api)
 */
export async function setBaseUrl(url) {
  try {
    let limpa = (url || '').trim().replace(/\/+$/, '');
    if (!limpa.endsWith('/api') && !limpa.includes('/api')) {
      limpa = `${limpa}/api`;
    }
    await AsyncStorage.setItem('custom_api_url', limpa);
    return limpa;
  } catch (e) {
    console.error('Erro ao salvar custom_api_url:', e);
    return DEFAULT_API_URL;
  }
}

/**
 * Recupera o token de autenticação JWT armazenado
 */
export async function getToken() {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (e) {
    return null;
  }
}

/**
 * Executa uma requisição HTTP autenticada contra a API
 */
export async function requisicao(endpoint, options = {}) {
  const baseUrl = await getBaseUrl();
  const token = await getToken();

  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const resposta = await fetch(url, {
      ...options,
      headers
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      const msgErro = dados.erro || dados.msg || `Erro ${resposta.status}: Falha na operação.`;
      const erro = new Error(msgErro);
      erro.status = resposta.status;
      erro.dados = dados;
      throw erro;
    }

    return dados;
  } catch (erro) {
    if (!erro.status) {
      erro.message = `Não foi possível conectar ao servidor em ${baseUrl}. Verifique o IP e se o backend está ligado.`;
    }
    throw erro;
  }
}

// --- MÉTODOS DE NEGÓCIO ---

export const Api = {
  // Autenticação
  login: async (email, senha) => {
    const baseUrl = await getBaseUrl();
    const resposta = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok || !dados.sucesso) {
      throw new Error(dados.erro || 'E-mail ou senha inválidos');
    }

    // Persiste o token e dados do usuário
    await AsyncStorage.setItem('userToken', dados.token);
    await AsyncStorage.setItem('userData', JSON.stringify(dados.usuario || {}));
    return dados;
  },

  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  },

  getUsuarioLogado: async () => {
    try {
      const str = await AsyncStorage.getItem('userData');
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  },

  // Itens
  getItens: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.busca) query.append('busca', params.busca);
    if (params.categoria) query.append('categoria', params.categoria);
    if (params.alerta) query.append('alerta', 'true');
    const qs = query.toString() ? `?${query.toString()}` : '';
    return requisicao(`/itens${qs}`, { method: 'GET' });
  },

  getItem: async (id) => {
    return requisicao(`/item/${id}`, { method: 'GET' });
  },

  // Movimentação
  movimentar: async (dados) => {
    return requisicao('/movimentar', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  },

  // Dashboard / Resumo
  getDashboard: async () => {
    return requisicao('/dashboard', { method: 'GET' });
  },

  // Categorias
  getCategorias: async () => {
    return requisicao('/categorias', { method: 'GET' });
  },

  // Usuários (Admin)
  getUsuarios: async () => {
    return requisicao('/usuarios', { method: 'GET' });
  },

  cadastrarUsuario: async (dados) => {
    return requisicao('/usuarios', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  },

  deletarUsuario: async (email) => {
    return requisicao(`/usuarios/${encodeURIComponent(email)}`, {
      method: 'DELETE'
    });
  }
};

export default Api;
