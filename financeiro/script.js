let baseDados = JSON.parse(localStorage.getItem('meuFinanceiroDataPro')) || {};
let nomeUsuario = localStorage.getItem('meuFinanceiroNome');
let mesSelecionado = '2026-03';

const mesesDisponiveis = {
    '2026-01': 'Jan 26', '2026-02': 'Fev 26', '2026-03': 'Mar 26',
    '2026-04': 'Abr 26', '2026-05': 'Mai 26', '2026-06': 'Jun 26',
    '2026-07': 'Jul 26', '2026-08': 'Ago 26', '2026-09': 'Set 26',
    '2026-10': 'Out 26', '2026-11': 'Nov 26', '2026-12': 'Dez 26'
};

function criarParticulas() {
    const container = document.getElementById('container-particulas');
    const quantidade = 30;
    for (let i = 0; i < quantidade; i++) {
        const particula = document.createElement('div');
        particula.className = 'particula';
        const tamanho = Math.random() * 60 + 10 + 'px';
        particula.style.width = tamanho;
        particula.style.height = tamanho;
        particula.style.left = Math.random() * 100 + 'vw';
        particula.style.top = Math.random() * 100 + 'vh';
        particula.style.animationDuration = Math.random() * 20 + 10 + 's';
        particula.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(particula);
    }
}

function inicializar() {
    criarParticulas();
    if (!nomeUsuario) {
        document.getElementById('tela-onboarding').classList.remove('oculto');
        return;
    }
    mostrarDashboard();
}

function finalizarOnboarding() {
    const inputNome = document.getElementById('nome-usuario');
    const nome = inputNome.value.trim();
    if (nome === "") return;
    localStorage.setItem('meuFinanceiroNome', nome);
    nomeUsuario = nome;
    document.getElementById('tela-onboarding').classList.add('oculto');
    mostrarDashboard();
}

function definirSaudacao() {
    const hora = new Date().getHours();
    let saudacao = "";
    if (hora >= 5 && hora < 12) saudacao = "Bom dia";
    else if (hora >= 12 && hora < 18) saudacao = "Boa tarde";
    else saudacao = "Boa noite";
    document.getElementById('saudacao-humana').textContent = `${saudacao}, ${nomeUsuario}. Vamos organizar seu mês?`;
}

function mostrarDashboard() {
    document.getElementById('conteudo-principal').classList.remove('oculto');
    definirSaudacao();
    const select = document.getElementById('mes-select');
    select.innerHTML = '';
    for (let chave in mesesDisponiveis) {
        let opt = document.createElement('option');
        opt.value = chave;
        opt.textContent = mesesDisponiveis[chave];
        if (chave === mesSelecionado) opt.selected = true;
        select.appendChild(opt);
        if (!baseDados[chave]) {
            baseDados[chave] = { salario: 0, reserva: 0, transacoes: [] };
        }
    }
    renderizarTela();
}

function mudarMes() {
    mesSelecionado = document.getElementById('mes-select').value;
    document.getElementById('input-salario').value = '';
    document.getElementById('input-reserva').value = '';
    document.getElementById('input-desc').value = '';
    document.getElementById('input-valor').value = '';
    renderizarTela();
}

function salvarLocal() {
    localStorage.setItem('meuFinanceiroDataPro', JSON.stringify(baseDados));
}

function renderizarTela() {
    const dadosMes = baseDados[mesSelecionado];
    let totalEntradasExtras = 0;
    let totalSaidas = 0;
    const lista = document.getElementById('lista-historico');
    lista.innerHTML = '';
    dadosMes.transacoes.sort((a, b) => b.id - a.id);
    dadosMes.transacoes.forEach(t => {
        if (t.tipo === 'entrada') totalEntradasExtras += t.valor;
        if (t.tipo === 'saida') totalSaidas += t.valor;
        const li = document.createElement('li');
        li.className = "bg-slate-950/20 backdrop-blur-md border border-slate-800 p-3 rounded-2xl flex justify-between items-center group hover:border-slate-700 transition-all";
        const divEsq = document.createElement('div');
        divEsq.className = "flex items-center gap-3";
        const icone = document.createElement('div');
        if (t.tipo === 'entrada') {
            icone.className = "w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400";
            icone.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>`;
        } else {
            icone.className = "w-7 h-7 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400";
            icone.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>`;
        }
        const spanDesc = document.createElement('span');
        spanDesc.className = "font-medium text-xs text-slate-300";
        spanDesc.textContent = t.descricao;
        divEsq.appendChild(icone);
        divEsq.appendChild(spanDesc);
        const divDir = document.createElement('div');
        divDir.className = "flex items-center gap-3";
        const spanVal = document.createElement('span');
        spanVal.className = t.tipo === 'entrada' ? "font-bold text-xs text-cyan-400" : "font-bold text-xs text-rose-400";
        spanVal.textContent = formataBRL(t.valor);
        const btnDel = document.createElement('button');
        btnDel.className = "text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110";
        btnDel.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
        btnDel.onclick = () => apagarTransacao(t.id);
        divDir.appendChild(spanVal);
        divDir.appendChild(btnDel);
        li.appendChild(divEsq);
        li.appendChild(divDir);
        lista.appendChild(li);
    });
    if (dadosMes.transacoes.length === 0) {
        lista.innerHTML = `<li class="text-center text-slate-600 text-xs py-5">Nenhum registro neste mês.</li>`;
    }
    const saldoLivre = (dadosMes.salario + totalEntradasExtras) - totalSaidas - dadosMes.reserva;
    document.getElementById('card-salario').textContent = formataBRL(dadosMes.salario);
    document.getElementById('card-saidas').textContent = formataBRL(totalSaidas);
    document.getElementById('card-reserva').textContent = formataBRL(dadosMes.reserva);
    document.getElementById('card-livre').textContent = formataBRL(saldoLivre);
}

function salvarFixos(tipo) {
    const val = parseFloat(document.getElementById(`input-${tipo}`).value);
    if (isNaN(val) || val < 0) return;
    baseDados[mesSelecionado][tipo] = val;
    document.getElementById(`input-${tipo}`).value = '';
    salvarLocal();
    renderizarTela();
}

function novaTransacao(tipo) {
    const desc = document.getElementById('input-desc').value.trim();
    const val = parseFloat(document.getElementById('input-valor').value);
    if (desc === "" || isNaN(val) || val <= 0) return;
    baseDados[mesSelecionado].transacoes.push({
        id: Date.now(),
        descricao: desc,
        valor: val,
        tipo: tipo
    });
    document.getElementById('input-desc').value = '';
    document.getElementById('input-valor').value = '';
    salvarLocal();
    renderizarTela();
}

function apagarTransacao(id) {
    baseDados[mesSelecionado].transacoes = baseDados[mesSelecionado].transacoes.filter(t => t.id !== id);
    salvarLocal();
    renderizarTela();
}

function formataBRL(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

window.onload = inicializar;