const itens = [
    { id: 1, nome: "Furadeira", quantidade: 15 },
    { id: 2, nome: "Parafusadeira", quantidade: 8 }
];

const historico = [
    {
        itemId: 1,
        tipo: "saida",
        pessoa: "João",
        destino: "TI",
        data: "2026-06-10"
    },
    {
        itemId: 1,
        tipo: "entrada",
        pessoa: "Maria",
        destino: "Almoxarifado",
        data: "2026-06-09"
    },
    {
        itemId: 2,
        tipo: "saida",
        pessoa: "Carlos",
        destino: "RH",
        data: "2026-06-08"
    }
];

const btnMovimentar = document.getElementById("btnMovimentar");
const btnBuscar = document.getElementById("btnBuscar");
const detalhes = document.getElementById("detalhesItem");

const nomeItem = document.getElementById("nomeItem");
const quantidadeItem = document.getElementById("quantidadeItem");

btnBuscar.addEventListener("click", () => {

    const id = Number(document.getElementById("idItem").value);

    if (!id) {
        alert("Digite um ID");
        return;
    }

    // SIMULAÇÃO DO ITEM

    const item = itens.find(i => i.id === id);

    if (!item) {
        alert("Item não encontrado");
        return;
    }

    nomeItem.value = item.nome;
    quantidadeItem.value = item.quantidade;

    // 🔥 FILTRAR HISTÓRICO DO ITEM
    atualizarHistorico(id);

    detalhes.classList.add("ativo");
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
    nomeItem.value = "";
    quantidadeItem.value = "";

    document.querySelector("#tabelaHistorico tbody").innerHTML = "";
});

document.getElementById("btnMovimentar").addEventListener("click", () => {
    registrarMovimento();
});

function atualizarHistorico(id) {

    const tbody = document.querySelector("#tabelaHistorico tbody");

    const historicoFiltrado = historico.filter(h => h.itemId === id);

    if (historicoFiltrado.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4">Sem histórico para este item</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = historicoFiltrado.map(h => `
        <tr>
            <td>${h.tipo}</td>
            <td>${h.pessoa}</td>
            <td>${h.destino}</td>
            <td>${h.data}</td>
        </tr>
    `).join("");
}

function registrarMovimento() {

    const idInput = document.getElementById("idItem").value;
    const id = Number(idInput);
    const pessoa = document.getElementById("pessoaMov").value;
    const destino = document.getElementById("destinoMov").value;

    if (!id || !pessoa || !destino) {
        alert("Preencha todos os campos");
        return;
    }

    const item = itens.find(i => i.id === id);
    if (!item) return;

    const novaQuantidade = Number(quantidadeItem.value);

    let tipo = "saida";
    if (novaQuantidade > item.quantidade) {
        tipo = "entrada";
    }

    item.quantidade = novaQuantidade;

    historico.push({
        itemId: id,
        tipo: tipo,
        pessoa: pessoa,
        destino: destino,
        data: new Date().toLocaleDateString()
    });

    atualizarHistorico(id);

    document.getElementById("pessoaMov").value = "";
    document.getElementById("destinoMov").value = "";
}