console.log('💰 Financeiro.js carregado');

async function carregarRecebimentos() {
    try {
        const response = await fetch(`${window.API_URL}/recebimentos`);
        const recebimentos = await response.json();
        const tbody = document.getElementById('lista-recebimentos');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        let totalRecebido = 0;
        
        if (recebimentos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500">Nenhum recebimento registrado</td></tr>`;
        } else {
            recebimentos.forEach(rec => {
                totalRecebido += rec.valor;
                let pagamentoIcon = rec.forma_pagamento === 'pix' ? 'fa-qrcode' : rec.forma_pagamento === 'dinheiro' ? 'fa-money-bill' : 'fa-credit-card';
                const row = `<tr><td class="px-4 py-3">${formatarData(rec.data_pagamento)}</td><td class="px-4 py-3">${escapeHtml(rec.paciente_nome) || 'Sem vínculo'}</td><td class="px-4 py-3 font-semibold text-green-600">R$ ${rec.valor.toFixed(2)}</td><td class="px-4 py-3"><span class="px-2 py-1 text-xs rounded-full bg-blue-100"><i class="fas ${pagamentoIcon} mr-1"></i> ${rec.forma_pagamento.toUpperCase()}</span></td><td class="px-4 py-3"><span class="px-2 py-1 text-xs rounded-full bg-gray-100">${escapeHtml(rec.descricao || 'Pagamento')}</span></td><td class="px-4 py-3"><button onclick="editarRecebimento(${rec.id})" class="text-indigo-600 mr-2"><i class="fas fa-edit"></i></button><button onclick="excluirRecebimento(${rec.id})" class="text-red-600"><i class="fas fa-trash"></i></button></td></tr>`;
                tbody.innerHTML += row;
            });
        }
        document.getElementById('total-recebido').textContent = `R$ ${totalRecebido.toFixed(2)}`;
        document.getElementById('total-transacoes').textContent = recebimentos.length;
    } catch (error) { console.error('Erro:', error); }
}

async function carregarSelectConsultas() {
    try {
        const response = await fetch(`${window.API_URL}/consultas`);
        const consultas = await response.json();
        const recebimentosResponse = await fetch(`${window.API_URL}/recebimentos`);
        const recebimentos = await recebimentosResponse.json();
        const select = document.getElementById('recebimento-consulta-id');
        if (!select) return;
        
        select.innerHTML = '<option value="">📋 Selecione uma consulta</option>';
        const consultasAtivas = consultas.filter(c => c.status !== 'concluida');
        
        for (const consulta of consultasAtivas) {
            const pagamentosConsulta = recebimentos.filter(r => r.consulta_id === consulta.id);
            const totalPago = pagamentosConsulta.reduce((sum, r) => sum + r.valor, 0);
            const valorTotal = consulta.valor_total || 0;
            let statusTexto = '';
            if (valorTotal > 0) {
                if (totalPago >= valorTotal) statusTexto = `✅ PAGO TOTAL`;
                else if (totalPago > 0) statusTexto = `🔄 PARCIAL (Falta R$ ${(valorTotal - totalPago).toFixed(2)})`;
                else statusTexto = `❌ NÃO PAGO (R$ ${valorTotal.toFixed(2)})`;
            }
            const option = document.createElement('option');
            option.value = consulta.id;
            option.textContent = `👤 ${consulta.paciente_nome} - ${formatarData(consulta.data)} ${consulta.hora} ${statusTexto ? `- ${statusTexto}` : ''}`;
            select.appendChild(option);
        }
    } catch (error) { console.error('Erro:', error); }
}

function abrirModalFinanceiro() {
    document.getElementById('form-financeiro').reset();
    document.getElementById('recebimento-id').value = '';
    document.getElementById('recebimento-data').value = new Date().toISOString().split('T')[0];
    document.getElementById('modal-financeiro-titulo').textContent = '💰 Registrar Recebimento';
    const msg = document.querySelector('.pagamento-indicacao');
    if (msg) msg.remove();
    carregarSelectConsultas().then(() => {
        document.getElementById('modal-financeiro').classList.remove('hidden');
        document.getElementById('modal-financeiro').style.display = 'flex';
    });
}

function fecharModalFinanceiro(event) {
    if (!event || event.target.id === 'modal-financeiro' || !event) {
        document.getElementById('modal-financeiro').classList.add('hidden');
        document.getElementById('modal-financeiro').style.display = 'none';
        const msg = document.querySelector('.pagamento-indicacao');
        if (msg) msg.remove();
    }
}

async function editarRecebimento(id) {
    try {
        const response = await fetch(`${window.API_URL}/recebimentos/${id}`);
        const rec = await response.json();
        if (rec) {
            document.getElementById('recebimento-id').value = rec.id;
            document.getElementById('recebimento-consulta-id').value = rec.consulta_id || '';
            document.getElementById('recebimento-valor').value = rec.valor;
            document.getElementById('recebimento-forma').value = rec.forma_pagamento;
            document.getElementById('recebimento-data').value = rec.data_pagamento;
            document.getElementById('recebimento-descricao').value = rec.descricao || '';
            document.getElementById('modal-financeiro-titulo').textContent = '✏️ Editar Recebimento';
            await carregarSelectConsultas();
            
            const modalContent = document.querySelector('#modal-financeiro .p-6');
            const existingMsg = modalContent.querySelector('.pagamento-indicacao');
            if (existingMsg) existingMsg.remove();
            const mensagem = document.createElement('div');
            mensagem.innerHTML = `<div class="text-sm text-blue-600 mb-2 p-2 bg-blue-50 rounded">✏️ Editando recebimento #${rec.id} - ${escapeHtml(rec.paciente_nome || 'Sem vínculo')}</div>`;
            mensagem.classList.add('pagamento-indicacao');
            modalContent.insertBefore(mensagem, modalContent.firstChild);
            
            document.getElementById('modal-financeiro').classList.remove('hidden');
            document.getElementById('modal-financeiro').style.display = 'flex';
        }
    } catch (error) { console.error('Erro:', error); alert('Erro ao carregar recebimento'); }
}

async function excluirRecebimento(id) {
    if (!confirm('⚠️ Excluir este recebimento permanentemente?')) return;
    try {
        const response = await fetch(`${window.API_URL}/recebimentos/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('✅ Recebimento excluído!');
            carregarRecebimentos();
            carregarSelectConsultas();
            if (typeof carregarConsultasAtivas === 'function') carregarConsultasAtivas();
            if (typeof carregarConsultasConcluidas === 'function') carregarConsultasConcluidas();
        } else { alert('Erro ao excluir'); }
    } catch (error) { console.error('Erro:', error); alert('Erro ao excluir'); }
}

async function filtrarRecebimentos() {
    const filtroPagamento = document.getElementById('filtro-pagamento').value;
    const filtroMes = document.getElementById('filtro-mes').value;
    try {
        const response = await fetch(`${window.API_URL}/recebimentos`);
        let recebimentos = await response.json();
        if (filtroPagamento) recebimentos = recebimentos.filter(r => r.forma_pagamento === filtroPagamento);
        if (filtroMes) recebimentos = recebimentos.filter(r => r.data_pagamento.startsWith(filtroMes));
        const tbody = document.getElementById('lista-recebimentos');
        if (!tbody) return;
        tbody.innerHTML = '';
        let totalFiltrado = 0;
        if (recebimentos.length === 0) { tbody.innerHTML = `<td><td colspan="6" class="text-center py-8 text-gray-500">Nenhum recebimento encontrado</td></tr>`; }
        else {
            recebimentos.forEach(rec => {
                totalFiltrado += rec.valor;
                let pagamentoIcon = rec.forma_pagamento === 'pix' ? 'fa-qrcode' : rec.forma_pagamento === 'dinheiro' ? 'fa-money-bill' : 'fa-credit-card';
                tbody.innerHTML += `<tr><td class="px-4 py-3">${formatarData(rec.data_pagamento)}</td><td class="px-4 py-3">${escapeHtml(rec.paciente_nome) || 'Sem vínculo'}</td><td class="px-4 py-3 font-semibold text-green-600">R$ ${rec.valor.toFixed(2)}</td><td class="px-4 py-3"><span class="px-2 py-1 text-xs rounded-full bg-blue-100"><i class="fas ${pagamentoIcon} mr-1"></i> ${rec.forma_pagamento.toUpperCase()}</span></td><td class="px-4 py-3"><span class="px-2 py-1 text-xs rounded-full bg-gray-100">${escapeHtml(rec.descricao || 'Pagamento')}</span></td><td class="px-4 py-3"><button onclick="editarRecebimento(${rec.id})" class="text-indigo-600 mr-2"><i class="fas fa-edit"></i></button><button onclick="excluirRecebimento(${rec.id})" class="text-red-600"><i class="fas fa-trash"></i></button></td></tr>`;
            });
        }
        document.getElementById('total-recebido').textContent = `R$ ${totalFiltrado.toFixed(2)}`;
        document.getElementById('total-transacoes').textContent = recebimentos.length;
    } catch (error) { console.error('Erro ao filtrar:', error); }
}

document.getElementById('form-financeiro')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('recebimento-id').value;
    const valor = document.getElementById('recebimento-valor').value;
    if (!valor || valor <= 0) { alert('Valor inválido'); return; }
    
    const recebimento = {
        consulta_id: document.getElementById('recebimento-consulta-id').value || null,
        valor: parseFloat(valor),
        forma_pagamento: document.getElementById('recebimento-forma').value,
        data_pagamento: document.getElementById('recebimento-data').value,
        descricao: document.getElementById('recebimento-descricao').value || (id ? 'Pagamento editado' : 'Pagamento de consulta')
    };
    
    try {
        let response;
        if (id) {
            response = await fetch(`${window.API_URL}/recebimentos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recebimento)
            });
        } else {
            response = await fetch(`${window.API_URL}/recebimentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recebimento)
            });
        }
        if (response.ok) {
            alert(id ? '✅ Recebimento atualizado!' : '✅ Recebimento registrado!');
            fecharModalFinanceiro();
            carregarRecebimentos();
            carregarSelectConsultas();
            if (typeof carregarConsultasAtivas === 'function') carregarConsultasAtivas();
            if (typeof carregarConsultasConcluidas === 'function') carregarConsultasConcluidas();
        } else { alert('Erro ao salvar'); }
    } catch (error) { console.error('Erro:', error); alert('Erro ao conectar'); }
});

function formatarData(data) { if (!data) return ''; const partes = data.split('-'); return `${partes[2]}/${partes[1]}/${partes[0]}`; }
function escapeHtml(text) { if (!text) return ''; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }