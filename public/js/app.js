// Controle de navegação estilo app
let paginaAtual = 'agenda';

function navegarPara(pagina) {
    paginaAtual = pagina;
    
    // Atualizar menu
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        const i = item.querySelector('i');
        const span = item.querySelector('span');
        if (i) {
            i.classList.remove('text-indigo-600', 'text-gray-600');
            i.classList.add('text-gray-600');
        }
        if (span) span.classList.remove('text-gray-600');
    });
    
    const navAtivo = document.getElementById(`nav-${pagina}`);
    if (navAtivo) {
        navAtivo.classList.add('active');
        const i = navAtivo.querySelector('i');
        const span = navAtivo.querySelector('span');
        if (i) {
            i.classList.remove('text-gray-600');
            i.classList.add('text-white');
        }
        if (span) span.classList.add('text-white');
    }
    
    // Carregar conteúdo
    const contentDiv = document.getElementById('pageContent');
    
    if (pagina === 'agenda') {
        contentDiv.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white"><i class="fas fa-calendar-check mr-2"></i>Agenda</h2>
                <button onclick="abrirModalAgenda()" class="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold">
                    <i class="fas fa-plus mr-1"></i> Nova
                </button>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="stat-card"><p class="text-gray-500 text-xs">Hoje</p><p class="text-2xl font-bold text-indigo-600" id="total-hoje">0</p></div>
                <div class="stat-card"><p class="text-gray-500 text-xs">Agendadas</p><p class="text-2xl font-bold text-yellow-600" id="total-agendadas">0</p></div>
                <div class="stat-card"><p class="text-gray-500 text-xs">Em Andamento</p><p class="text-2xl font-bold text-blue-600" id="total-andamento">0</p></div>
                <div class="stat-card"><p class="text-gray-500 text-xs">Concluídas</p><p class="text-2xl font-bold text-green-600" id="total-concluidas-agenda">0</p></div>
            </div>
            <div class="card">
                <div class="table-responsive">
                    <table class="table-modern">
                        <thead><tr><th>Paciente</th><th>Data/Hora</th><th>Status</th><th></th></tr></thead>
                        <tbody id="lista-consultas-ativas-mobile"></tbody>
                    </table>
                </div>
            </div>
        `;
        carregarConsultasAtivasMobile();
    } 
    else if (pagina === 'pacientes') {
        contentDiv.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white"><i class="fas fa-users mr-2"></i>Pacientes</h2>
                <button onclick="abrirModalPaciente()" class="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold">
                    <i class="fas fa-plus mr-1"></i> Novo
                </button>
            </div>
            <div class="card">
                <div class="space-y-2" id="lista-pacientes-mobile"></div>
            </div>
        `;
        carregarPacientesMobile();
    }
    else if (pagina === 'consultas') {
        contentDiv.innerHTML = `
            <div class="mb-4">
                <h2 class="text-xl font-bold text-white"><i class="fas fa-history mr-2"></i>Histórico</h2>
                <input type="text" id="filtro-paciente-mobile" placeholder="🔍 Buscar paciente..." class="input-modern mt-2 bg-white">
            </div>
            <div class="card">
                <div class="space-y-2" id="lista-consultas-concluidas-mobile"></div>
            </div>
        `;
        carregarConsultasConcluidasMobile();
        document.getElementById('filtro-paciente-mobile')?.addEventListener('input', () => carregarConsultasConcluidasMobile());
    }
    else if (pagina === 'financeiro') {
        contentDiv.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white"><i class="fas fa-coins mr-2"></i>Financeiro</h2>
                <button onclick="abrirModalFinanceiro()" class="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold">
                    <i class="fas fa-plus mr-1"></i> Registrar
                </button>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="stat-card"><p class="text-gray-500 text-xs">Total Recebido</p><p class="text-xl font-bold text-green-600" id="total-recebido-mobile">R$ 0</p></div>
                <div class="stat-card"><p class="text-gray-500 text-xs">Transações</p><p class="text-2xl font-bold text-blue-600" id="total-transacoes-mobile">0</p></div>
            </div>
            <div class="flex gap-2 mb-3">
                <select id="filtro-pagamento-mobile" class="input-modern text-sm flex-1"><option value="">Todos</option><option value="pix">PIX</option><option value="dinheiro">Dinheiro</option><option value="cartao">Cartão</option></select>
                <button onclick="filtrarRecebimentosMobile()" class="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm"><i class="fas fa-search"></i></button>
            </div>
            <div class="card">
                <div class="space-y-2" id="lista-recebimentos-mobile"></div>
            </div>
        `;
        carregarRecebimentosMobile();
    }
}

// Versões mobile das funções
async function carregarConsultasAtivasMobile() {
    try {
        const res = await fetch(`${window.API_URL}/consultas`);
        const consultas = await res.json();
        const recebimentosRes = await fetch(`${window.API_URL}/recebimentos`);
        const recebimentos = await recebimentosRes.json();
        const ativas = consultas.filter(c => c.status !== 'concluida');
        const hoje = new Date().toISOString().split('T')[0];
        
        let totalHoje = 0, totalAgendadas = 0, totalAndamento = 0;
        
        const tbody = document.getElementById('lista-consultas-ativas-mobile');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        ativas.forEach(c => {
            if (c.data === hoje) totalHoje++;
            if (c.status === 'agendada') totalAgendadas++;
            if (c.status === 'em andamento') totalAndamento++;
            
            const pag = recebimentos.filter(r => r.consulta_id === c.id);
            const totalPago = pag.reduce((s, r) => s + r.valor, 0);
            const statusColor = c.status === 'agendada' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700';
            const statusText = c.status === 'agendada' ? 'Agendada' : 'Em Andamento';
            
            tbody.innerHTML += `<tr>
                <td><strong>${escapeHtml(c.paciente_nome)}</strong><br><small class="text-gray-500">${c.hora}</small></td>
                <td><span class="badge ${statusColor}">${statusText}</span></td>
                <td class="text-right"><button onclick="editarConsulta(${c.id})" class="text-indigo-600 mr-2"><i class="fas fa-edit"></i></button><button onclick="excluirConsulta(${c.id})" class="text-red-500"><i class="fas fa-trash"></i></button></td>
            </tr>`;
        });
        
        document.getElementById('total-hoje') && (document.getElementById('total-hoje').textContent = totalHoje);
        document.getElementById('total-agendadas') && (document.getElementById('total-agendadas').textContent = totalAgendadas);
        document.getElementById('total-andamento') && (document.getElementById('total-andamento').textContent = totalAndamento);
    } catch(e) { console.error(e); }
}

async function carregarPacientesMobile() {
    try {
        const res = await fetch(`${window.API_URL}/pacientes`);
        const pacientes = await res.json();
        const div = document.getElementById('lista-pacientes-mobile');
        if (!div) return;
        div.innerHTML = pacientes.length ? '' : '<div class="text-center text-gray-500 py-8">Nenhum paciente cadastrado</div>';
        pacientes.forEach(p => {
            div.innerHTML += `<div class="flex justify-between items-center p-3 border-b">
                <div><strong>${escapeHtml(p.nome)}</strong><br><small class="text-gray-500">${p.celular || p.telefone || '-'}</small></div>
                <div><button onclick="verProntuario(${p.id})" class="text-blue-600 mr-2"><i class="fas fa-file-medical"></i></button><button onclick="editarPaciente(${p.id})" class="text-indigo-600"><i class="fas fa-edit"></i></button></div>
            </div>`;
        });
    } catch(e) { console.error(e); }
}

async function carregarConsultasConcluidasMobile() {
    try {
        const res = await fetch(`${window.API_URL}/consultas`);
        let consultas = await res.json();
        const filtro = document.getElementById('filtro-paciente-mobile')?.value.toLowerCase();
        let concluidas = consultas.filter(c => c.status === 'concluida');
        if (filtro) concluidas = concluidas.filter(c => c.paciente_nome.toLowerCase().includes(filtro));
        
        const div = document.getElementById('lista-consultas-concluidas-mobile');
        if (!div) return;
        div.innerHTML = concluidas.length ? '' : '<div class="text-center text-gray-500 py-8">Nenhuma consulta concluída</div>';
        concluidas.forEach(c => {
            div.innerHTML += `<div class="flex justify-between items-center p-3 border-b">
                <div><strong>${escapeHtml(c.paciente_nome)}</strong><br><small>${formatarData(c.data)} ${c.hora}</small></div>
                <div><span class="badge bg-green-100 text-green-700">Concluída</span></div>
            </div>`;
        });
    } catch(e) { console.error(e); }
}

async function carregarRecebimentosMobile() {
    try {
        const res = await fetch(`${window.API_URL}/recebimentos`);
        let recebimentos = await res.json();
        const filtro = document.getElementById('filtro-pagamento-mobile')?.value;
        if (filtro) recebimentos = recebimentos.filter(r => r.forma_pagamento === filtro);
        
        const total = recebimentos.reduce((s, r) => s + r.valor, 0);
        document.getElementById('total-recebido-mobile') && (document.getElementById('total-recebido-mobile').textContent = `R$ ${total.toFixed(2)}`);
        document.getElementById('total-transacoes-mobile') && (document.getElementById('total-transacoes-mobile').textContent = recebimentos.length);
        
        const div = document.getElementById('lista-recebimentos-mobile');
        if (!div) return;
        div.innerHTML = recebimentos.length ? '' : '<div class="text-center text-gray-500 py-8">Nenhum recebimento</div>';
        recebimentos.forEach(r => {
            div.innerHTML += `<div class="flex justify-between items-center p-3 border-b">
                <div><strong>R$ ${r.valor.toFixed(2)}</strong><br><small>${r.paciente_nome || '-'}</small></div>
                <div><span class="badge bg-blue-100 text-blue-700">${r.forma_pagamento}</span></div>
            </div>`;
        });
    } catch(e) { console.error(e); }
}

function filtrarRecebimentosMobile() { carregarRecebimentosMobile(); }

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    navegarPara('agenda');
    if (typeof carregarSelectPacientes === 'function') carregarSelectPacientes();
});