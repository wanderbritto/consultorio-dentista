// Controle de navegação estilo app
let paginaAtual = 'agenda';

function navegarPara(pagina) {
    paginaAtual = pagina;
    
    // Resetar todos os itens do menu para estado normal
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        // Resetar cores dos ícones e textos
        const icone = item.querySelector('i');
        const texto = item.querySelector('span');
        if (icone) {
            icone.classList.remove('text-white');
            icone.classList.add('text-gray-600');
        }
        if (texto) {
            texto.classList.remove('text-white');
            texto.classList.add('text-gray-600');
        }
    });
    
    // Ativar o item clicado
    const navAtivo = document.getElementById(`nav-${pagina}`);
    if (navAtivo) {
        navAtivo.classList.add('active');
        const icone = navAtivo.querySelector('i');
        const texto = navAtivo.querySelector('span');
        if (icone) {
            icone.classList.remove('text-gray-600');
            icone.classList.add('text-white');
        }
        if (texto) {
            texto.classList.remove('text-gray-600');
            texto.classList.add('text-white');
        }
    }
    
    // Carregar conteúdo baseado na página
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
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="text-gray-500 border-b">
                                <th class="text-left py-2">Paciente</th>
                                <th class="text-left py-2">Data/Hora</th>
                                <th class="text-left py-2">Status</th>
                                <th class="text-center py-2"></th>
                            </tr>
                        </thead>
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
        const filtroInput = document.getElementById('filtro-paciente-mobile');
        if (filtroInput) {
            filtroInput.oninput = () => carregarConsultasConcluidasMobile();
        }
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
                <select id="filtro-pagamento-mobile" class="input-modern text-sm flex-1">
                    <option value="">Todos</option>
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao">Cartão</option>
                </select>
                <button onclick="filtrarRecebimentosMobile()" class="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm">
                    <i class="fas fa-search"></i>
                </button>
            </div>
            <div class="card">
                <div class="space-y-2" id="lista-recebimentos-mobile"></div>
            </div>
        `;
        carregarRecebimentosMobile();
        const filtroSelect = document.getElementById('filtro-pagamento-mobile');
        if (filtroSelect) {
            filtroSelect.onchange = () => carregarRecebimentosMobile();
        }
    }
}

// Versões mobile das funções
async function carregarConsultasAtivasMobile() {
    try {
        const res = await fetch(`${window.API_URL}/consultas`);
        const consultas = await res.json();
        const ativas = consultas.filter(c => c.status !== 'concluida');
        
        let totalHoje = 0, totalAgendadas = 0, totalAndamento = 0;
        const hoje = new Date().toISOString().split('T')[0];
        
        ativas.forEach(c => {
            if (c.data === hoje) totalHoje++;
            if (c.status === 'agendada') totalAgendadas++;
            if (c.status === 'em andamento') totalAndamento++;
        });
        
        document.getElementById('total-hoje') && (document.getElementById('total-hoje').textContent = totalHoje);
        document.getElementById('total-agendadas') && (document.getElementById('total-agendadas').textContent = totalAgendadas);
        document.getElementById('total-andamento') && (document.getElementById('total-andamento').textContent = totalAndamento);
        
        const tbody = document.getElementById('lista-consultas-ativas-mobile');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        if (ativas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500 py-8">Nenhuma consulta agendada</td></tr>';
        } else {
            ativas.forEach(c => {
                const statusColor = c.status === 'agendada' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700';
                const statusText = c.status === 'agendada' ? 'Agendada' : 'Em Andamento';
                
                tbody.innerHTML += `
                    <tr class="border-b">
                        <td class="py-3"><strong>${escapeHtml(c.paciente_nome)}</strong><br><small class="text-gray-500">${c.hora}</small></td>
                        <td class="py-3"><span class="badge ${statusColor}">${statusText}</span></td>
                        <td class="py-3 text-right">
                            <button onclick="editarConsulta(${c.id})" class="text-indigo-600 mr-2"><i class="fas fa-edit"></i></button>
                            <button onclick="excluirConsulta(${c.id})" class="text-red-500"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch(e) { console.error(e); }
}

async function carregarPacientesMobile() {
    try {
        const res = await fetch(`${window.API_URL}/pacientes`);
        const pacientes = await res.json();
        const div = document.getElementById('lista-pacientes-mobile');
        if (!div) return;
        
        if (pacientes.length === 0) {
            div.innerHTML = '<div class="text-center text-gray-500 py-8">Nenhum paciente cadastrado</div>';
        } else {
            div.innerHTML = '';
            pacientes.forEach(p => {
                div.innerHTML += `
                    <div class="flex justify-between items-center p-3 border-b">
                        <div>
                            <strong>${escapeHtml(p.nome)}</strong>
                            <br><small class="text-gray-500">${p.celular || p.telefone || '-'}</small>
                        </div>
                        <div>
                            <button onclick="verProntuario(${p.id})" class="text-blue-600 mr-2"><i class="fas fa-file-medical"></i></button>
                            <button onclick="editarPaciente(${p.id})" class="text-indigo-600"><i class="fas fa-edit"></i></button>
                        </div>
                    </div>
                `;
            });
        }
    } catch(e) { console.error(e); }
}

async function carregarConsultasConcluidasMobile() {
    try {
        const res = await fetch(`${window.API_URL}/consultas`);
        let consultas = await res.json();
        const filtro = document.getElementById('filtro-paciente-mobile')?.value.toLowerCase();
        let concluidas = consultas.filter(c => c.status === 'concluida');
        if (filtro) {
            concluidas = concluidas.filter(c => c.paciente_nome.toLowerCase().includes(filtro));
        }
        
        const div = document.getElementById('lista-consultas-concluidas-mobile');
        if (!div) return;
        
        if (concluidas.length === 0) {
            div.innerHTML = '<div class="text-center text-gray-500 py-8">Nenhuma consulta concluída</div>';
        } else {
            div.innerHTML = '';
            concluidas.forEach(c => {
                div.innerHTML += `
                    <div class="flex justify-between items-center p-3 border-b">
                        <div>
                            <strong>${escapeHtml(c.paciente_nome)}</strong>
                            <br><small>${formatarData(c.data)} ${c.hora}</small>
                        </div>
                        <div><span class="badge bg-green-100 text-green-700">Concluída</span></div>
                    </div>
                `;
            });
        }
    } catch(e) { console.error(e); }
}

async function carregarRecebimentosMobile() {
    try {
        const res = await fetch(`${window.API_URL}/recebimentos`);
        let recebimentos = await res.json();
        const filtro = document.getElementById('filtro-pagamento-mobile')?.value;
        if (filtro) {
            recebimentos = recebimentos.filter(r => r.forma_pagamento === filtro);
        }
        
        const total = recebimentos.reduce((s, r) => s + r.valor, 0);
        document.getElementById('total-recebido-mobile') && (document.getElementById('total-recebido-mobile').textContent = `R$ ${total.toFixed(2)}`);
        document.getElementById('total-transacoes-mobile') && (document.getElementById('total-transacoes-mobile').textContent = recebimentos.length);
        
        const div = document.getElementById('lista-recebimentos-mobile');
        if (!div) return;
        
        if (recebimentos.length === 0) {
            div.innerHTML = '<div class="text-center text-gray-500 py-8">Nenhum recebimento</div>';
        } else {
            div.innerHTML = '';
            recebimentos.forEach(r => {
                div.innerHTML += `
                    <div class="flex justify-between items-center p-3 border-b">
                        <div>
                            <strong>R$ ${r.valor.toFixed(2)}</strong>
                            <br><small>${r.paciente_nome || '-'}</small>
                        </div>
                        <div><span class="badge bg-blue-100 text-blue-700">${r.forma_pagamento}</span></div>
                    </div>
                `;
            });
        }
    } catch(e) { console.error(e); }
}

function filtrarRecebimentosMobile() { carregarRecebimentosMobile(); }

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    navegarPara('agenda');
    if (typeof carregarSelectPacientes === 'function') carregarSelectPacientes();
});

// Funções auxiliares
function formatarData(data) {
    if (!data) return '';
    const partes = data.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}