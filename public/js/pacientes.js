console.log('📋 Pacientes.js carregado');

let pendenteAgenda = false;
let modalAgendaAberto = false;

async function carregarPacientes() {
    console.log('🔄 Carregando pacientes...');
    try {
        const response = await fetch(`${window.API_URL}/pacientes`);
        const pacientes = await response.json();
        
        const tbody = document.getElementById('lista-pacientes');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (pacientes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500">Nenhum paciente cadastrado</td></tr>`;
        } else {
            for (const p of pacientes) {
                const consultasResp = await fetch(`${window.API_URL}/consultas`);
                const consultas = await consultasResp.json();
                const ultimaConsulta = consultas.filter(c => c.paciente_id === p.id).sort((a,b) => new Date(b.data) - new Date(a.data))[0];
                
                const row = `<tr class="hover:bg-gray-50">
                    <td class="px-4 py-3">${escapeHtml(p.nome)}</td>
                    <td class="px-4 py-3">${escapeHtml(p.celular || p.telefone || '-')}</td>
                    <td class="px-4 py-3">${escapeHtml(p.email || '-')}</td>
                    <td class="px-4 py-3">${escapeHtml(p.convenio || '-')}</td>
                    <td class="px-4 py-3">${ultimaConsulta ? formatarData(ultimaConsulta.data) : '-'}</td>
                    <td class="px-4 py-3">
                        <button onclick="verProntuario(${p.id})" class="text-blue-600 hover:text-blue-800 mr-2" title="Ver Prontuário"><i class="fas fa-file-medical"></i></button>
                        <button onclick="editarPaciente(${p.id})" class="text-indigo-600 hover:text-indigo-800 mr-2" title="Editar"><i class="fas fa-edit"></i></button>
                        <button onclick="excluirPaciente(${p.id})" class="text-red-600 hover:text-red-800" title="Excluir"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
                tbody.innerHTML += row;
            }
        }
        console.log(`✅ Carregados ${pacientes.length} pacientes`);
    } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
    }
}

async function carregarSelectPacientes() {
    try {
        const response = await fetch(`${window.API_URL}/pacientes`);
        const pacientes = await response.json();
        const select = document.getElementById('consulta-paciente-id');
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione um paciente</option>';
        pacientes.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.nome} - ${p.celular || p.telefone || 'sem telefone'}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar select de pacientes:', error);
    }
}

function abrirModalPaciente() {
    pendenteAgenda = false;
    document.getElementById('modal-paciente-titulo').textContent = '👤 Novo Paciente';
    document.getElementById('form-paciente').reset();
    document.getElementById('paciente-id').value = '';
    document.getElementById('modal-paciente').classList.remove('hidden');
    document.getElementById('modal-paciente').style.display = 'flex';
}

function abrirModalPacienteParaAgenda() {
    // Fechar modal da agenda primeiro
    fecharModalAgenda();
    pendenteAgenda = true;
    setTimeout(() => {
        document.getElementById('modal-paciente-titulo').textContent = '👤 Novo Paciente';
        document.getElementById('form-paciente').reset();
        document.getElementById('paciente-id').value = '';
        document.getElementById('modal-paciente').classList.remove('hidden');
        document.getElementById('modal-paciente').style.display = 'flex';
    }, 100);
}

function fecharModalPaciente(event) {
    if (!event || event.target.id === 'modal-paciente' || !event) {
        document.getElementById('modal-paciente').classList.add('hidden');
        document.getElementById('modal-paciente').style.display = 'none';
        
        // Se veio da agenda, reabrir modal da agenda
        if (pendenteAgenda) {
            pendenteAgenda = false;
            setTimeout(() => {
                abrirModalAgenda();
            }, 100);
        }
    }
}

async function editarPaciente(id) {
    try {
        pendenteAgenda = false;
        const response = await fetch(`${window.API_URL}/pacientes/${id}`);
        const dados = await response.json();
        const p = dados.paciente;
        
        document.getElementById('modal-paciente-titulo').textContent = '✏️ Editar Paciente';
        document.getElementById('paciente-id').value = p.id;
        document.getElementById('paciente-nome-completo').value = p.nome || '';
        document.getElementById('paciente-data-nascimento').value = p.data_nascimento || '';
        document.getElementById('paciente-cpf').value = p.cpf || '';
        document.getElementById('paciente-rg').value = p.rg || '';
        document.getElementById('paciente-celular').value = p.celular || '';
        document.getElementById('paciente-telefone-fixo').value = p.telefone || '';
        document.getElementById('paciente-email').value = p.email || '';
        document.getElementById('paciente-convenio').value = p.convenio || '';
        document.getElementById('paciente-carteirinha').value = p.numero_carteirinha || '';
        document.getElementById('paciente-emergencia').value = p.contato_emergencia || '';
        document.getElementById('paciente-endereco').value = p.endereco || '';
        document.getElementById('paciente-cidade').value = p.cidade || '';
        document.getElementById('paciente-estado').value = p.estado || '';
        document.getElementById('paciente-cep').value = p.cep || '';
        
        document.getElementById('modal-paciente').classList.remove('hidden');
        document.getElementById('modal-paciente').style.display = 'flex';
    } catch (error) {
        console.error('Erro ao editar paciente:', error);
        alert('Erro ao carregar dados do paciente');
    }
}

async function excluirPaciente(id) {
    if (!confirm('⚠️ Tem certeza? Isso também excluirá todas as consultas e histórico do paciente!')) return;
    
    try {
        const response = await fetch(`${window.API_URL}/pacientes/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Paciente excluído com sucesso!');
            carregarPacientes();
            carregarSelectPacientes();
            if (typeof carregarConsultasAtivas === 'function') carregarConsultasAtivas();
        } else {
            alert('Erro ao excluir paciente');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir paciente');
    }
}

document.getElementById('form-paciente')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('paciente-id').value;
    const paciente = {
        nome: document.getElementById('paciente-nome-completo').value,
        data_nascimento: document.getElementById('paciente-data-nascimento').value,
        cpf: document.getElementById('paciente-cpf').value,
        rg: document.getElementById('paciente-rg').value,
        endereco: document.getElementById('paciente-endereco').value,
        cidade: document.getElementById('paciente-cidade').value,
        estado: document.getElementById('paciente-estado').value,
        cep: document.getElementById('paciente-cep').value,
        telefone: document.getElementById('paciente-telefone-fixo').value,
        celular: document.getElementById('paciente-celular').value,
        email: document.getElementById('paciente-email').value,
        contato_emergencia: document.getElementById('paciente-emergencia').value,
        convenio: document.getElementById('paciente-convenio').value,
        numero_carteirinha: document.getElementById('paciente-carteirinha').value
    };
    
    try {
        let response;
        if (id) {
            response = await fetch(`${window.API_URL}/pacientes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paciente)
            });
        } else {
            response = await fetch(`${window.API_URL}/pacientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paciente)
            });
        }
        
        if (response.ok) {
            alert(id ? 'Paciente atualizado!' : 'Paciente cadastrado!');
            fecharModalPaciente();
            carregarPacientes();
            carregarSelectPacientes();
            
            // Se veio da agenda, recarregar select e reabrir agenda
            if (pendenteAgenda) {
                pendenteAgenda = false;
                setTimeout(() => {
                    abrirModalAgenda();
                }, 100);
            }
        } else {
            alert('Erro ao salvar paciente');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar paciente');
    }
});