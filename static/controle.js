let quantidadeOriginalDoItem = 0; 

const btnMovimentar = document.getElementById("btnMovimentar");
const btnBuscar = document.getElementById("btnBuscar");
const detalhes = document.getElementById("detalhesItem");
const nomeItem = document.getElementById("nomeItem");
const quantidadeItem = document.getElementById("quantidadeItem");

btnBuscar.addEventListener("click", () => {
    const id = Number(document.getElementById("idItem").value);

    if (!id) {
        Swal.fire('Atenção', 'Digite um ID válido', 'warning');
        return;
    }

    fetch(`/api/item/${id}`)
        .then(response => {
            if (!response.ok) throw new Error("Item não encontrado");
            return response.json();
        })
        .then(data => {
            document.getElementById("idItemAtivo").value = data.id;
            nomeItem.value = data.nome;
            quantidadeItem.value = data.quantidade;
            quantidadeOriginalDoItem = data.quantidade;
            
            renderizarTabelaHistorico(data.historico);
            detalhes.classList.add("ativo");
        })
        .catch(erro => Swal.fire('Erro', erro.message, 'error'));
});

document.querySelector(".btnMais").addEventListener("click", () => {
    quantidadeItem.value = Number(quantidadeItem.value) + 1;
});

document.querySelector(".btnMenos").addEventListener("click", () => {
    if (quantidadeItem.value > 0) {
        quantidadeItem.value = Number(quantidadeItem.value) - 1;
    }
});

document.getElementById("btnVoltar").addEventListener("click", () => {
    detalhes.classList.remove("ativo");
    document.getElementById("idItem").value = "";
    document.getElementById("idItemAtivo").value = "";
    nomeItem.value = "";
    quantidadeItem.value = "";
    document.querySelector("#tabelaHistorico tbody").innerHTML = "";
});

document.getElementById("btnMovimentar").addEventListener("click", () => {
    registrarMovimento();
});

function renderizarTabelaHistorico(listaHistorico) {
    const tbody = document.querySelector("#tabelaHistorico tbody");

    if (!listaHistorico || listaHistorico.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">Sem histórico para este item</td></tr>`;
        return;
    }

    tbody.innerHTML = listaHistorico.map(h => `
        <tr>
            <td><span class="badge ${h.tipo === 'entrada' ? 'bg-success' : 'bg-danger'}">${h.tipo.toUpperCase()}</span></td>
            <td>${h.pessoa}</td>
            <td>${h.destino}</td>
            <td>${h.data}</td>
        </tr>
    `).join("");
}

function registrarMovimento() {
    const id = Number(document.getElementById("idItemAtivo").value);
    const pessoa = document.getElementById("pessoaMov").value;
    const destino = document.getElementById("destinoMov").value;
    const novaQuantidade = Number(quantidadeItem.value);

    if (!id || !pessoa || !destino) {
        Swal.fire('Aviso', 'Preencha todos os campos (Pessoa e Destino)', 'warning');
        return;
    }

    let tipo = "saida";
    if (novaQuantidade > quantidadeOriginalDoItem) {
        tipo = "entrada";
    } else if (novaQuantidade === quantidadeOriginalDoItem) {
        Swal.fire('Info', 'A quantidade não foi alterada.', 'info');
        return;
    }

    const dadosMovimentacao = {
        itemId: id,
        tipo: tipo,
        pessoa: pessoa,
        destino: destino,
        novaQuantidade: novaQuantidade
    };

    fetch('/api/movimentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosMovimentacao)
    })
    .then(response => response.json())
    .then(data => {
        Swal.fire('Sucesso!', 'Movimentação gravada no MySQL!', 'success');
        renderizarTabelaHistorico(data.historicoAtualizado);
        quantidadeOriginalDoItem = novaQuantidade;
    })
    .catch(erro => Swal.fire('Erro ao salvar', erro.message, 'error'));

    document.getElementById("pessoaMov").value = "";
    document.getElementById("destinoMov").value = "";
}