// ================================
// SELEÇÃO DOS ELEMENTOS
// ================================

const formItem = document.getElementById("formItem");

const nome = document.getElementById("nome");
const categoria = document.getElementById("categoria");
const estado = document.getElementById("estado");
const tipo = document.getElementById("tipo");
const descricao = document.getElementById("descricao");
const responsavel = document.getElementById("responsavel");

const pesquisa = document.getElementById("pesquisa");

const filtroCategoria = document.getElementById("filtroCategoria");
const filtroSituacao = document.getElementById("filtroSituacao");

const listaItens = document.getElementById("listaItens");
const mensagem = document.getElementById("mensagem");
const nenhumResultado = document.getElementById("estadoVazio");

const totalItens = document.getElementById("totalItens");
const totalDisponiveis = document.getElementById("totalDisponiveis");
const totalReservados = document.getElementById("totalReservados");
const totalDoacoes = document.getElementById("totalDoacoes");

// ================================
// ARRAY PRINCIPAL
// ================================

let itens = [];

// ================================
// CADASTRAR ITEM
// ================================

formItem.addEventListener("submit", cadastrarItem);

function cadastrarItem(event) {

    event.preventDefault();

    const novoItem = {
        id: Date.now(),
        nome: nome.value.trim(),
        categoria: categoria.value,
        estado: estado.value,
        tipo: tipo.value,
        descricao: descricao.value.trim(),
        responsavel: responsavel.value.trim(),
        reservado: false
    };

    if (!validarItem(novoItem)) {
        return;
    }

    itens.push(novoItem);

    renderizarItens();
    atualizarResumo();
    salvarDados();

    mostrarMensagem("Item cadastrado com sucesso!", "sucesso");

    formItem.reset();
}

// ================================
// VALIDAÇÃO
// ================================

function validarItem(item) {

    if (item.nome === "") {
        mostrarMensagem("Informe o nome do item.", "erro");
        return false;
    }

    if (item.categoria === "") {
        mostrarMensagem("Selecione uma categoria.", "erro");
        return false;
    }

    const itemDuplicado = itens.some(i =>
        i.nome.toLowerCase() === item.nome.toLowerCase() &&
        i.categoria === item.categoria &&
        i.tipo === item.tipo &&
        i.responsavel.toLowerCase() === item.responsavel.toLowerCase()
    );

    if (itemDuplicado) {
        mostrarMensagem("Este item já foi cadastrado.", "erro");
        return false;
    }

    return true;
}

// ================================
// MENSAGEM
// ================================

function mostrarMensagem(texto, tipo = "") {

    mensagem.textContent = texto;
    mensagem.className = tipo;

    setTimeout(() => {
        mensagem.textContent = "";
        mensagem.className = "";
    }, 3000);

}
// ================================
// RENDERIZAÇÃO DOS ITENS
// ================================

function renderizarItens(lista = itens) {

    listaItens.innerHTML = "";

    if (lista.length === 0) {
        nenhumResultado.style.display = "block";
        return;
    }

    nenhumResultado.style.display = "none";

    lista.forEach(item => {

        const card = document.createElement("div");
        card.className = "card";

        card.classList.add(
            item.reservado ? "reservado" : "disponivel"
        );

        card.classList.add(
            item.tipo === "Troca" ? "troca" : "doacao"
        );

        card.innerHTML = `
            <h3>${item.nome}</h3>

            <p><strong>Categoria:</strong> ${item.categoria}</p>

            <p><strong>Estado:</strong> ${item.estado}</p>

            <p><strong>Tipo:</strong> ${item.tipo}</p>

            <p><strong>Descrição:</strong> ${item.descricao}</p>

            <p><strong>Responsável:</strong> ${item.responsavel}</p>

            <p>
                <strong>Situação:</strong>
                ${item.reservado ? "Reservado" : "Disponível"}
            </p>

            <button
                class="btn-reservar"
                data-id="${item.id}">
                ${item.reservado ? "Disponibilizar" : "Reservar"}
            </button>

            <button
                class="btn-excluir"
                data-id="${item.id}">
                Excluir
            </button>
        `;

        listaItens.appendChild(card);

    });

}
// ================================
// CLIQUES NOS BOTÕES
// ================================

listaItens.addEventListener("click", tratarClique);

function tratarClique(event) {

    const botao = event.target;
    const id = Number(botao.dataset.id);

    if (!id) return;

    if (botao.classList.contains("btn-reservar")) {
        alterarSituacao(id);
    }

    if (botao.classList.contains("btn-excluir")) {
        excluirItem(id);
    }

}

// ================================
// ALTERAR SITUAÇÃO
// ================================

function alterarSituacao(id) {

    const item = itens.find(item => item.id === id);

    if (!item) return;

    item.reservado = !item.reservado;

    salvarDados();
    aplicarFiltros();
    atualizarResumo();

    mostrarMensagem(
        item.reservado
            ? "Item reservado com sucesso!"
            : "Item disponibilizado novamente!",
        "sucesso"
    );

}

// ================================
// EXCLUIR ITEM
// ================================

function excluirItem(id) {

    const confirmar = confirm("Deseja realmente excluir este item?");

    if (!confirmar) return;

    itens = itens.filter(item => item.id !== id);

    salvarDados();
    aplicarFiltros();
    atualizarResumo();

    mostrarMensagem("Item excluído com sucesso!", "sucesso");

}

// ================================
// PESQUISA E FILTROS
// ================================

pesquisa.addEventListener("input", aplicarFiltros);
filtroCategoria.addEventListener("change", aplicarFiltros);
filtroSituacao.addEventListener("change", aplicarFiltros);

function aplicarFiltros() {

    const texto = pesquisa.value.toLowerCase().trim();
    const categoriaSelecionada = filtroCategoria.value;
    const situacaoSelecionada = filtroSituacao.value;

    const itensFiltrados = itens.filter(item => {

        const correspondePesquisa =
            item.nome.toLowerCase().includes(texto) ||
            item.descricao.toLowerCase().includes(texto);

        const correspondeCategoria =
            categoriaSelecionada === "" ||
            item.categoria === categoriaSelecionada;

        const correspondeSituacao =
            situacaoSelecionada === "" ||
            (situacaoSelecionada === "disponivel" && !item.reservado) ||
            (situacaoSelecionada === "reservado" && item.reservado);

        return (
            correspondePesquisa &&
            correspondeCategoria &&
            correspondeSituacao
        );

    });

    renderizarItens(itensFiltrados);

}

// ================================
// RESUMO
// ================================

function atualizarResumo() {

    totalItens.textContent = itens.length;

    totalDisponiveis.textContent =
        itens.filter(item => !item.reservado).length;

    totalReservados.textContent =
        itens.filter(item => item.reservado).length;

    totalDoacoes.textContent =
        itens.filter(item => item.tipo === "Doação").length;

}
// ================================
// SALVAR DADOS
// ================================

function salvarDados() {

    localStorage.setItem(
        "feiraDigital",
        JSON.stringify(itens)
    );

}

// ================================
// CARREGAR DADOS
// ================================

function carregarDados() {

    const dados = localStorage.getItem("feiraDigital");

    if (dados) {
        itens = JSON.parse(dados);
    }

    aplicarFiltros();
    atualizarResumo();

}

// ================================
// PESQUISA COM ENTER
// ================================

pesquisa.addEventListener("keydown", verificarTecla);

function verificarTecla(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        aplicarFiltros();

        mostrarMensagem("Pesquisa realizada!", "sucesso");

    }

}

// ================================
// INICIALIZAÇÃO
// ================================

document.addEventListener("DOMContentLoaded", () => {

    carregarDados();

});








