console.log('📅 Agenda.js carregado');

async function carregarConsultasAtivas() {
    console.log('🔄 Carregando consultas ativas...');
    try {
        const response = await fetch(`${window.API_URL}/consultas`);
        const consultas = await response.json();
        
        const recebimentosResponse = await fetch(`${window.API_URL}/recebimentos`);
        const recebimentos = await recebimentosResponse.json();
        
        const consultasAtivas = consultas.filter(c => c.status !== 'concluida');
        const tbody = document.getElementById('lista-consultas-ativas');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        let totalHoje = 0, totalAgendadas = 0, totalAndamento = 0;
        const hoje = new Date().toISOString().split('T')[0];
        
        if (consultasAtivas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-gray-500">Nenhuma consulta ativa</td></tr>`;
        } else {
            for (const consulta of consultasAtivas) {
                if (consulta.data === hoje && consulta.status !== 'concluida') totalHoje++;
                if (consulta.status === 'agendada') totalAgendadas++;
                if (consulta.status === 'em andamento') totalAndamento++;
                
                const pagamentosConsulta = recebimentos.filter(r => r.consulta_id === consulta.id);
                const totalPago = pagamentosConsulta.reduce((sum, r) => sum + r.valor, 0);
                const valorTotal = consulta.valor_total || 0;
                const estaPago = totalPago >= valorTotal && valorTotal > 0;
                const pagamentoParcial = totalPago > 0 && totalPago < valorTotal;
                
                let statusColor = consulta.status === 'agendada' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800';
                let pagamentoIcon = '', pagamentoText = '', pagamentoColor = '', botaoPagamento = '';
                
                if (estaPago) {
                    pagamentoIcon = 'fa-check-circle';
                    pagamentoText = `✅ Pago Total (R$ ${totalPago.toFixed(2)})`;
                    pagamentoColor = 'bg-green-100 text-green-800';
                } else if (pagamentoParcial) {
                    pagamentoIcon = 'fa-chart-line';
                    pagamentoText = `🔄 Parcial (R$ ${totalPago.toFixed(2)} de R$ ${valorTotal.toFixed(2)})`;
                    pagamentoColor = 'bg-yellow-100 text-yellow-800';
                    botaoPagamento = `<button onclick="abrirModalFinanceiroComConsulta(${consulta.id}, '${escapeHtml(consulta.paciente_nome)}')" class="ml-2 text-blue-600"><i class="fas fa-plus-circle"></i></button>`;
                } else {
                    pagamentoIcon = 'fa-exclamation-circle';
                    pagamentoText = valorTotal > 0 ? `❌ R$ 0,00 de R$ ${valorTotal.toFixed(2)}` : '❌ Não Pago';
                    pagamentoColor = 'bg-red-100 text-red-800';
                    botaoPagamento = `<button onclick="abrirModalFinanceiroComConsulta(${consulta.id}, '${escapeHtml(consulta.paciente_nome)}')" class="ml-2 text-blue-600"><i class="fas fa-dollar-sign"></i></button>`;
                }
                
                const row = `<tr>
                    <td class="px-4 py-3">${escapeHtml(consulta.paciente_nome)}</td>
                    <td class="px-4 py-3">${escapeHtml(consulta.paciente_telefone)}</td>
                    <td class="px-4 py-3">${formatarData(consulta.data)}</td>
                    <td class="px-4 py-3">${consulta.hora}</td>
                    <td class="px-4 py-3">${valorTotal > 0 ? `R$ ${valorTotal.toFixed(2)}` : '-'}</td>
                    <td class="px-4 py-3"><select onchange="atualizarStatus(${consulta.id}, this.value)" class="status-select px-2 py-1 text-xs rounded-full ${statusColor}"><option value="agendada" ${consulta.status === 'agendada' ? 'selected' : ''}>Agendada</option><option value="em andamento" ${consulta.status === 'em andamento' ? 'selected' : ''}>Em Andamento</option><option value="concluida" ${consulta.status === 'concluida' ? 'selected' : ''}>Concluída</option></select></td>
                    <td class="px-4 py-3"><span class="inline-flex items-center px-2 py-1 text-xs rounded-full ${pagamentoColor}"><i class="fas ${pagamentoIcon} mr-1"></i> ${pagamentoText}</span>${botaoPagamento}</td>
                    <td class="px-4 py-3"><button onclick="editarConsulta(${consulta.id})" class="text-indigo-600 mr-2"><i class="fas fa-edit"></i></button><button onclick="excluirConsulta(${consulta.id})" class="text-red-600"><i class="fas fa-trash"></i></button></td>
                </tr>`;
                tbody.innerHTML += row;
            }
        }
        
        document.getElementById('total-hoje').textContent = totalHoje;
        document.getElementById('total-agendadas').textContent = totalAgendadas;
        document.getElementById('total-andamento').textContent = totalAndamento;
    } catch (error) {
        console.error('Erro ao carregar consultas ativas:', error);
    }
}

async function carregarConsultasConcluidas() {
    console.log('🔄 Carregando consultas concluídas...');
    try {
        const response = await fetch(`${window.API_URL}/consultas`);
        let consultas = await response.json();
        let consultasConcluidas = consultas.filter(c => c.status === 'concluida');
        
        const recebimentosResponse = await fetch(`${window.API_URL}/recebimentos`);
        const recebimentos = await recebimentosResponse.json();
        
        const filtroPaciente = document.getElementById('filtro-paciente')?.value.toLowerCase();
        if (filtroPaciente) {
            consultasConcluidas = consultasConcluidas.filter(c => c.paciente_nome.toLowerCase().includes(filtroPaciente));
        }
        
        const tbody = document.getElementById('lista-consultas-concluidas');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        let totalConcluidas = consultasConcluidas.length;
        let totalEsteMes = 0, faturamentoTotal = 0;
        const mesAtual = new Date().toISOString().slice(0, 7);
        
        if (consultasConcluidas.length === 0) {
            tbody.innerHTML = `<td><td colspan="8" class="text-center py-8 text-gray-500">Nenhuma consulta concluída</td></tr>`;
        } else {
            for (const consulta of consultasConcluidas) {
                if (consulta.data.startsWith(mesAtual)) totalEsteMes++;
                const pagamentosConsulta = recebimentos.filter(r => r.consulta_id === consulta.id);
                const totalPago = pagamentosConsulta.reduce((sum, r) => sum + r.valor, 0);
                const valorTotal = consulta.valor_total || 0;
                if (pagamentosConsulta.length > 0) faturamentoTotal += totalPago;
                
                const estaPago = totalPago >= valorTotal && valorTotal > 0;
                const pagamentoParcial = totalPago > 0 && totalPago < valorTotal;
                let pagamentoIcon = '', pagamentoText = '', pagamentoColor = '', botaoPagamento = '';
                
                if (estaPago) {
                    pagamentoIcon = 'fa-check-circle';
                    pagamentoText = `✅ Pago Total (R$ ${totalPago.toFixed(2)})`;
                    pagamentoColor = 'bg-green-100 text-green-800';
                } else if (pagamentoParcial) {
                    pagamentoIcon = 'fa-chart-line';
                    pagamentoText = `🔄 Parcial (R$ ${totalPago.toFixed(2)} de R$ ${valorTotal.toFixed(2)})`;
                    pagamentoColor = 'bg-yellow-100 text-yellow-800';
                    botaoPagamento = `<button onclick="abrirModalFinanceiroComConsulta(${consulta.id}, '${escapeHtml(consulta.paciente_nome)}')" class="ml-2 text-blue-600"><i class="fas fa-plus-circle"></i></button>`;
                } else {
                    pagamentoIcon = 'fa-exclamation-circle';
                    pagamentoText = valorTotal > 0 ? `❌ R$ 0,00 de R$ ${valorTotal.toFixed(2)}` : '❌ Não Pago';
                    pagamentoColor = 'bg-red-100 text-red-800';
                    botaoPagamento = `<button onclick="abrirModalFinanceiroComConsulta(${consulta.id}, '${escapeHtml(consulta.paciente_nome)}')" class="ml-2 text-blue-600"><i class="fas fa-dollar-sign"></i></button>`;
                }
                
                const row = `<tr>
                    <td class="px-4 py-3">${escapeHtml(consulta.paciente_nome)}</td>
                    <td class="px-4 py-3">${escapeHtml(consulta.paciente_telefone)}</td>
                    <td class="px-4 py-3">${formatarData(consulta.data)}</td>
                    <td class="px-4 py-3">${consulta.hora}</td>
                    <td class="px-4 py-3">${valorTotal > 0 ? `R$ ${valorTotal.toFixed(2)}` : '-'}</td>
                    <td class="px-4 py-3"><span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"><i class="fas fa-check-circle mr-1"></i> Concluída</span></td>
                    <td class="px-4 py-3"><span class="inline-flex items-center px-2 py-1 text-xs rounded-full ${pagamentoColor}"><i class="fas ${pagamentoIcon} mr-1"></i> ${pagamentoText}</span>${botaoPagamento}</td>
                    <td class="px-4 py-3"><button onclick="reativarConsulta(${consulta.id})" class="text-green-600 mr-2"><i class="fas fa-undo-alt"></i></button><button onclick="excluirConsulta(${consulta.id})" class="text-red-600"><i class="fas fa-trash"></i></button></td>
                </tr>`;
                tbody.innerHTML += row;
            }
        }
        
        document.getElementById('total-concluidas').textContent = totalConcluidas;
        document.getElementById('total-mes').textContent = totalEsteMes;
        document.getElementById('faturamento-concluidas').textContent = `R$ ${faturamentoTotal.toFixed(2)}`;
    } catch (error) {
        console.error('Erro ao carregar consultas concluídas:', error);
    }
}

async function atualizarStatus(id, novoStatus) {
    try {
        const response = await fetch(`${window.API_URL}/consultas`);
        const consultas = await response.json();
        const consulta = consultas.find(c => c.id === id);
        if (!consulta) { alert('Consulta não encontrada!'); return; }
        
        consulta.status = novoStatus;
        const updateResponse = await fetch(`${window.API_URL}/consultas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(consulta)
        });
        
        if (updateResponse.ok) {
            alert(novoStatus === 'concluida' ? '✅ Consulta concluída! Movida para histórico.' : `✅ Status: ${novoStatus === 'em andamento' ? 'Em Andamento' : 'Agendada'}`);
            await carregarConsultasAtivas();
            await carregarConsultasConcluidas();
        } else { alert('Erro ao atualizar status'); }
    } catch (error) { console.error('Erro:', error); alert('Erro ao atualizar status'); }
}

async function reativarConsulta(id) {
    if (!confirm('Reativar esta consulta?')) return;
    try {
        const response = await fetch(`${window.API_URL}/consultas`);
        const consultas = await response.json();
        const consulta = consultas.find(c => c.id === id);
        consulta.status = 'agendada';
        const updateResponse = await fetch(`${window.API_URL}/consultas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(consulta)
        });
        if (updateResponse.ok) {
            alert('✅ Consulta reativada!');
            await carregarConsultasAtivas();
            await carregarConsultasConcluidas();
        } else { alert('Erro ao reativar'); }
    } catch (error) { console.error('Erro:', error); alert('Erro ao reativar'); }
}

async function abrirModalFinanceiroComConsulta(consultaId, pacienteNome) {
    const response = await fetch(`${window.API_URL}/consultas`);
    const consultas = await response.json();
    const consulta = consultas.find(c => c.id === consultaId);
    const recebimentosResponse = await fetch(`${window.API_URL}/recebimentos`);
    const recebimentos = await recebimentosResponse.json();
    const pagamentosConsulta = recebimentos.filter(r => r.consulta_id === consultaId);
    const totalPago = pagamentosConsulta.reduce((sum, r) => sum + r.valor, 0);
    const valorTotal = consulta?.valor_total || 0;
    const faltaPagar = valorTotal - totalPago;
    
    document.getElementById('form-financeiro').reset();
    document.getElementById('recebimento-id').value = '';
    document.getElementById('recebimento-data').value = new Date().toISOString().split('T')[0];
    
    if (typeof carregarSelectConsultas === 'function') await carregarSelectConsultas();
    const selectConsulta = document.getElementById('recebimento-consulta-id');
    if (selectConsulta) selectConsulta.value = consultaId;
    
    const modalContent = document.querySelector('#modal-financeiro .p-6');
    const existingMsg = modalContent.querySelector('.pagamento-indicacao');
    if (existingMsg) existingMsg.remove();
    
    const mensagem = document.createElement('div');
    if (faltaPagar > 0 && valorTotal > 0) {
        mensagem.innerHTML = `<div class="text-sm text-blue-600 mb-2 p-2 bg-blue-50 rounded">💰 ${escapeHtml(pacienteNome)} - Total: R$ ${valorTotal.toFixed(2)} | Pago: R$ ${totalPago.toFixed(2)} | Pendente: R$ ${faltaPagar.toFixed(2)}</div>`;
        const valorInput = document.getElementById('recebimento-valor');
        if (valorInput) valorInput.placeholder = `Sugestão: R$ ${faltaPagar.toFixed(2)}`;
    } else if (valorTotal > 0 && totalPago >= valorTotal) {
        mensagem.innerHTML = `<div class="text-sm text-green-600 mb-2 p-2 bg-green-50 rounded">✅ ${escapeHtml(pacienteNome)} - Já está totalmente pago! Total: R$ ${valorTotal.toFixed(2)}</div>`;
    } else {
        mensagem.innerHTML = `<div class="text-sm text-green-600 mb-2 p-2 bg-green-50 rounded">💰 Registrando pagamento para: ${escapeHtml(pacienteNome)}</div>`;
    }
    mensagem.classList.add('pagamento-indicacao');
    modalContent.insertBefore(mensagem, modalContent.firstChild);
    
    document.getElementById('modal-financeiro').classList.remove('hidden');
    document.getElementById('modal-financeiro').style.display = 'flex';
}

function abrirModalAgenda() {
    document.getElementById('modal-agenda-titulo').textContent = 'Nova Consulta';
    document.getElementById('form-agenda').reset();
    document.getElementById('consulta-id').value = '';
    document.getElementById('consulta-valor').value = '0.00';
    carregarSelectPacientes();
    document.getElementById('modal-agenda').classList.remove('hidden');
    document.getElementById('modal-agenda').style.display = 'flex';
}

function fecharModalAgenda(event) {
    if (!event || event.target.id === 'modal-agenda' || !event) {
        document.getElementById('modal-agenda').classList.add('hidden');
        document.getElementById('modal-agenda').style.display = 'none';
    }
}

async function editarConsulta(id) {
    try {
        const response = await fetch(`${window.API_URL}/consultas`);
        const consultas = await response.json();
        const consulta = consultas.find(c => c.id === id);
        if (consulta) {
            document.getElementById('modal-agenda-titulo').textContent = 'Editar Consulta';
            document.getElementById('consulta-id').value = consulta.id;
            await carregarSelectPacientes();
            document.getElementById('consulta-paciente-id').value = consulta.paciente_id || '';
            document.getElementById('consulta-data').value = consulta.data;
            document.getElementById('consulta-hora').value = consulta.hora;
            document.getElementById('consulta-valor').value = consulta.valor_total || 0;
            document.getElementById('modal-agenda').classList.remove('hidden');
            document.getElementById('modal-agenda').style.display = 'flex';
        }
    } catch (error) { console.error('Erro:', error); alert('Erro ao carregar dados'); }
}

async function excluirConsulta(id) {
    if (!confirm('Excluir permanentemente?')) return;
    try {
        const response = await fetch(`${window.API_URL}/consultas/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Consulta excluída!');
            await carregarConsultasAtivas();
            await carregarConsultasConcluidas();
        } else { alert('Erro ao excluir'); }
    } catch (error) { console.error('Erro:', error); alert('Erro ao excluir'); }
}

document.getElementById('form-agenda')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('consulta-id').value;
    const pacienteId = document.getElementById('consulta-paciente-id').value;
    let pacienteNome = '', pacienteTelefone = '';
    
    if (pacienteId) {
        const resp = await fetch(`${window.API_URL}/pacientes`);
        const pacientes = await resp.json();
        const paciente = pacientes.find(p => p.id == pacienteId);
        if (paciente) { pacienteNome = paciente.nome; pacienteTelefone = paciente.celular || paciente.telefone || ''; }
    } else {
        pacienteNome = prompt('Digite o nome do paciente (caso não tenha selecionado um):');
        pacienteTelefone = prompt('Digite o telefone:');
        if (!pacienteNome) { alert('Nome obrigatório'); return; }
    }
    
    const consulta = {
        paciente_id: pacienteId || null,
        paciente_nome: pacienteNome,
        paciente_telefone: pacienteTelefone,
        data: document.getElementById('consulta-data').value,
        hora: document.getElementById('consulta-hora').value,
        status: 'agendada',
        valor_total: parseFloat(document.getElementById('consulta-valor').value) || 0
    };
    
    try {
        let response;
        if (id) {
            response = await fetch(`${window.API_URL}/consultas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(consulta)
            });
        } else {
            response = await fetch(`${window.API_URL}/consultas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(consulta)
            });
        }
        if (response.ok) {
            alert(id ? 'Consulta atualizada!' : 'Consulta criada!');
            fecharModalAgenda();
            await carregarConsultasAtivas();
            if (typeof carregarSelectConsultas === 'function') carregarSelectConsultas();
        } else { alert('Erro ao salvar'); }
    } catch (error) { console.error('Erro:', error); alert('Erro ao salvar'); }
});

function formatarData(data) { if (!data) return ''; const partes = data.split('-'); return `${partes[2]}/${partes[1]}/${partes[0]}`; }
function escapeHtml(text) { if (!text) return ''; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }