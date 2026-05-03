console.log('📋 Prontuario.js carregado');

let pacienteAtualId = null;
let odontogramaAtual = {};
let dadosPacienteCompleto = null;

async function verProntuario(id) {
    pacienteAtualId = id;
    console.log(`🔄 Abrindo prontuário do paciente ${id}`);
    
    try {
        const response = await fetch(`${window.API_URL}/pacientes/${id}`);
        dadosPacienteCompleto = await response.json();
        
        document.getElementById('prontuario-nome').innerHTML = `🦷 ${dadosPacienteCompleto.paciente.nome} 
            <button onclick="imprimirProntuario()" class="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                <i class="fas fa-print mr-2"></i>Imprimir Prontuário
            </button>`;
        
        // Carregar dados da aba Dados
        carregarTabDados(dadosPacienteCompleto);
        
        // Carregar dados da aba Clínico
        carregarTabClinico(dadosPacienteCompleto);
        
        // Carregar odontograma
        carregarOdontograma(dadosPacienteCompleto);
        
        // Carregar consultas
        carregarTabConsultas(dadosPacienteCompleto);
        
        // Carregar anotações
        carregarTabAnotacoes(dadosPacienteCompleto);
        
        // Carregar arquivos
        carregarTabArquivos(dadosPacienteCompleto);
        
        document.getElementById('modal-prontuario').classList.remove('hidden');
        document.getElementById('modal-prontuario').style.display = 'flex';
    } catch (error) {
        console.error('Erro ao carregar prontuário:', error);
        alert('Erro ao carregar prontuário');
    }
}

function fecharModalProntuario(event) {
    if (!event || event.target.id === 'modal-prontuario' || !event) {
        document.getElementById('modal-prontuario').classList.add('hidden');
        document.getElementById('modal-prontuario').style.display = 'none';
    }
}

function mostrarTabProntuario(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tab}-content`).classList.remove('hidden');
    
    ['dados', 'clinico', 'odontograma', 'consultas', 'anotacoes', 'arquivos'].forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        if(btn) {
            btn.classList.remove('border-indigo-500', 'text-indigo-600');
            btn.classList.add('text-gray-600', 'border-transparent');
        }
    });
    const btnAtivo = document.getElementById(`tab-${tab}`);
    if(btnAtivo) {
        btnAtivo.classList.add('border-indigo-500', 'text-indigo-600');
        btnAtivo.classList.remove('text-gray-600', 'border-transparent');
    }
}

// ============= FUNÇÃO DE IMPRESSÃO =============

function imprimirProntuario() {
    if (!dadosPacienteCompleto) return;
    
    const p = dadosPacienteCompleto.paciente;
    const h = dadosPacienteCompleto.historico_clinico || {};
    const consultas = dadosPacienteCompleto.consultas || [];
    const anotacoes = dadosPacienteCompleto.anotacoes || [];
    const odontograma = dadosPacienteCompleto.odontograma || [];
    
    // Mapeamento dos status do odontograma
    const statusDenteMap = {
        'saudavel': '🟢 Saudável',
        'carie': '🟡 Cárie',
        'tratamento': '🔴 Tratamento Necessário',
        'extraido': '⚫ Extraído',
        'tratado': '🔵 Tratado'
    };
    
    // Criar mapa de dentes
    const denteMap = {};
    odontograma.forEach(o => { denteMap[o.dente_numero] = o; });
    
    // Gerar HTML do odontograma para impressão
    let odontogramaHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">';
    
    // Dentes superiores (18-11 e 21-28)
    odontogramaHtml += '<tr><td colspan="8" style="text-align: center; font-weight: bold; background: #f3f4f6; padding: 8px;">DENTES SUPERIORES</td></tr><tr>';
    for(let i = 18; i >= 11; i--) {
        const status = denteMap[i]?.status || 'saudavel';
        const cor = status === 'saudavel' ? '#4ade80' : status === 'carie' ? '#facc15' : status === 'tratamento' ? '#ef4444' : status === 'extraido' ? '#374151' : '#3b82f6';
        odontogramaHtml += `<td style="border: 1px solid #ddd; text-align: center; padding: 10px; background: ${cor}; color: white; font-weight: bold;">${i}</td>`;
    }
    odontogramaHtml += '</tr><tr>';
    for(let i = 21; i <= 28; i++) {
        const status = denteMap[i]?.status || 'saudavel';
        const cor = status === 'saudavel' ? '#4ade80' : status === 'carie' ? '#facc15' : status === 'tratamento' ? '#ef4444' : status === 'extraido' ? '#374151' : '#3b82f6';
        odontogramaHtml += `<td style="border: 1px solid #ddd; text-align: center; padding: 10px; background: ${cor}; color: white; font-weight: bold;">${i}</td>`;
    }
    odontogramaHtml += '</tr>';
    
    // Dentes inferiores
    odontogramaHtml += '<tr><td colspan="8" style="text-align: center; font-weight: bold; background: #f3f4f6; padding: 8px;">DENTES INFERIORES</td></tr><tr>';
    for(let i = 48; i >= 41; i--) {
        const status = denteMap[i]?.status || 'saudavel';
        const cor = status === 'saudavel' ? '#4ade80' : status === 'carie' ? '#facc15' : status === 'tratamento' ? '#ef4444' : status === 'extraido' ? '#374151' : '#3b82f6';
        odontogramaHtml += `<td style="border: 1px solid #ddd; text-align: center; padding: 10px; background: ${cor}; color: white; font-weight: bold;">${i}</td>`;
    }
    odontogramaHtml += '</tr><tr>';
    for(let i = 31; i <= 38; i++) {
        const status = denteMap[i]?.status || 'saudavel';
        const cor = status === 'saudavel' ? '#4ade80' : status === 'carie' ? '#facc15' : status === 'tratamento' ? '#ef4444' : status === 'extraido' ? '#374151' : '#3b82f6';
        odontogramaHtml += `<td style="border: 1px solid #ddd; text-align: center; padding: 10px; background: ${cor}; color: white; font-weight: bold;">${i}</td>`;
    }
    odontogramaHtml += '</tr>';
    odontogramaHtml += '<tr><td colspan="8" style="padding: 10px;"><div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">';
    odontogramaHtml += '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 15px; height: 15px; background: #4ade80; margin-right: 5px;"></span> Saudável</span>';
    odontogramaHtml += '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 15px; height: 15px; background: #facc15; margin-right: 5px;"></span> Cárie</span>';
    odontogramaHtml += '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 15px; height: 15px; background: #ef4444; margin-right: 5px;"></span> Tratamento</span>';
    odontogramaHtml += '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 15px; height: 15px; background: #374151; margin-right: 5px;"></span> Extraído</span>';
    odontogramaHtml += '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 15px; height: 15px; background: #3b82f6; margin-right: 5px;"></span> Tratado</span>';
    odontogramaHtml += '</div></td></tr></table>';
    
    // Gerar HTML das consultas
    let consultasHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;"><thead><tr style="background: #f3f4f6;"><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Data</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Hora</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Valor</th></tr></thead><tbody>';
    consultas.forEach(c => {
        consultasHtml += `<tr><td style="border: 1px solid #ddd; padding: 8px;">${formatarData(c.data)}</td><td style="border: 1px solid #ddd; padding: 8px;">${c.hora}</td><td style="border: 1px solid #ddd; padding: 8px;">${c.status}</td><td style="border: 1px solid #ddd; padding: 8px;">R$ ${(c.valor_total || 0).toFixed(2)}</td></tr>`;
    });
    consultasHtml += '</tbody></table>';
    
    // Gerar HTML das anotações
    let anotacoesHtml = '<div style="margin-top: 10px;">';
    anotacoes.forEach(a => {
        anotacoesHtml += `<div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px;"><strong>${formatarDataHora(a.data_anotacao)}</strong><p style="margin-top: 5px;">${escapeHtml(a.texto)}</p></div>`;
    });
    anotacoesHtml += '</div>';
    
    // Calcular idade
    const idade = p.data_nascimento ? calcularIdade(p.data_nascimento) : 'N/I';
    
    // HTML COMPLETO PARA IMPRESSÃO
    const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Prontuário - ${escapeHtml(p.nome)}</title>
            <style>
                @media print {
                    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                    .no-print { display: none; }
                    .page-break { page-break-before: always; }
                    h2, h3 { margin-top: 0; }
                    table { page-break-inside: avoid; }
                }
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
                .container { max-width: 1000px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
                .header h1 { color: #4f46e5; margin: 0; }
                .header p { color: #666; margin: 5px 0 0; }
                .section { margin-bottom: 25px; }
                .section-title { background: #4f46e5; color: white; padding: 8px 12px; border-radius: 5px; margin-bottom: 15px; }
                .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px; }
                .info-item { border-bottom: 1px solid #eee; padding: 8px; }
                .info-label { font-weight: bold; color: #555; }
                .info-value { margin-top: 3px; }
                .odontograma { margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
                .status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
                button.no-print { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-bottom: 20px; }
                button.no-print:hover { background: #4338ca; }
            </style>
        </head>
        <body>
            <div class="container">
                <div style="text-align: center; margin-bottom: 20px;">
                    <button onclick="window.print();" class="no-print" style="background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        🖨️ Imprimir / Salvar como PDF
                    </button>
                    <button onclick="window.close();" class="no-print" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                        ❌ Fechar
                    </button>
                </div>
                
                <div class="header">
                    <h1>🦷 PRONTUÁRIO ODONTOLÓGICO</h1>
                    <p>Documento de acompanhamento clínico - ${new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                
                <!-- DADOS DO PACIENTE -->
                <div class="section">
                    <div class="section-title">
                        <h3>📋 DADOS PESSOAIS</h3>
                    </div>
                    <div class="info-grid">
                        <div class="info-item"><div class="info-label">Nome Completo:</div><div class="info-value">${escapeHtml(p.nome)}</div></div>
                        <div class="info-item"><div class="info-label">Idade:</div><div class="info-value">${idade} anos</div></div>
                        <div class="info-item"><div class="info-label">Data Nascimento:</div><div class="info-value">${p.data_nascimento ? formatarData(p.data_nascimento) : '-'}</div></div>
                        <div class="info-item"><div class="info-label">CPF:</div><div class="info-value">${p.cpf || '-'}</div></div>
                        <div class="info-item"><div class="info-label">RG:</div><div class="info-value">${p.rg || '-'}</div></div>
                        <div class="info-item"><div class="info-label">Celular:</div><div class="info-value">${p.celular || '-'}</div></div>
                        <div class="info-item"><div class="info-label">Telefone:</div><div class="info-value">${p.telefone || '-'}</div></div>
                        <div class="info-item"><div class="info-label">E-mail:</div><div class="info-value">${p.email || '-'}</div></div>
                        <div class="info-item"><div class="info-label">Convênio:</div><div class="info-value">${p.convenio || '-'}</div></div>
                        <div class="info-item"><div class="info-label">Nº Carteirinha:</div><div class="info-value">${p.numero_carteirinha || '-'}</div></div>
                        <div class="info-item"><div class="info-label">Contato Emergência:</div><div class="info-value">${p.contato_emergencia || '-'}</div></div>
                        <div class="info-item"><div class="info-label">Endereço:</div><div class="info-value">${p.endereco ? `${p.endereco}, ${p.cidade || ''} - ${p.estado || ''}` : '-'}</div></div>
                    </div>
                </div>
                
                <!-- HISTÓRICO CLÍNICO -->
                <div class="section">
                    <div class="section-title">
                        <h3>🩺 HISTÓRICO CLÍNICO</h3>
                    </div>
                    <div class="info-grid">
                        <div class="info-item"><div class="info-label">Doenças Pré-existentes:</div><div class="info-value">${h.doencas || 'Nenhuma informada'}</div></div>
                        <div class="info-item"><div class="info-label">Alergias:</div><div class="info-value">${h.alergias || 'Nenhuma informada'}</div></div>
                        <div class="info-item"><div class="info-label">Medicamentos em Uso:</div><div class="info-value">${h.medicamentos || 'Nenhum informado'}</div></div>
                        <div class="info-item"><div class="info-label">Cirurgias/Internações:</div><div class="info-value">${h.cirurgias || 'Nenhuma informada'}</div></div>
                        <div class="info-item"><div class="info-label">Gestante:</div><div class="info-value">${h.gestante || 'Não'}</div></div>
                        <div class="info-item"><div class="info-label">Hábitos:</div><div class="info-value">${h.habitos || 'Nenhum informado'}</div></div>
                        <div class="info-item"><div class="info-label">Última Visita ao Dentista:</div><div class="info-value">${h.ultima_visita || 'Não informada'}</div></div>
                        <div class="info-item"><div class="info-label">Anamnese/Observações:</div><div class="info-value">${h.anamnese || 'Nenhuma observação'}</div></div>
                    </div>
                </div>
                
                <!-- ODONTOGRAMA -->
                <div class="section">
                    <div class="section-title">
                        <h3>🦷 ODONTOGRAMA DIGITAL</h3>
                    </div>
                    ${odontogramaHtml}
                </div>
                
                <!-- HISTÓRICO DE CONSULTAS -->
                <div class="section">
                    <div class="section-title">
                        <h3>📅 HISTÓRICO DE CONSULTAS</h3>
                    </div>
                    ${consultasHtml}
                </div>
                
                <!-- ANOTAÇÕES DO DENTISTA -->
                <div class="section">
                    <div class="section-title">
                        <h3>📝 ANOTAÇÕES DO DENTISTA</h3>
                    </div>
                    ${anotacoesHtml}
                </div>
                
                <div class="footer">
                    <p>Documento gerado pelo sistema DentSaaS em ${new Date().toLocaleString('pt-BR')}</p>
                    <p>Prontuário digital - Válido para fins de acompanhamento clínico</p>
                </div>
            </div>
            <script>
                // Auto print (opcional - descomente se quiser imprimir automaticamente)
                // window.onload = function() { setTimeout(() => window.print(), 500); }
            </script>
        </body>
        </html>
    `;
    
    // Abrir janela de impressão
    const printWindow = window.open('', '_blank', 'width=900,height=700,toolbar=yes,scrollbars=yes,resizable=yes');
    printWindow.document.write(printHtml);
    printWindow.document.close();
}

// ============= FUNÇÕES EXISTENTES (ATUALIZADAS) =============

function carregarTabDados(dados) {
    const p = dados.paciente;
    const idade = p.data_nascimento ? calcularIdade(p.data_nascimento) : 'N/I';
    
    const html = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg"><label class="text-xs text-gray-500">Nome Completo</label><p class="font-semibold">${escapeHtml(p.nome)}</p></div>
            <div class="bg-gray-50 p-4 rounded-lg"><label class="text-xs text-gray-500">Idade</label><p class="font-semibold">${idade} anos</p></div>
            <div class="bg-gray-50 p-4 rounded-lg"><label class="text-xs text-gray-500">Data Nascimento</label><p class="font-semibold">${p.data_nascimento ? formatarData(p.data_nascimento) : '-'}</p></div>
            <div class="bg-gray-50 p-4 rounded-lg"><label class="text-xs text-gray-500">CPF</label><p class="font-semibold">${p.cpf || '-'}</p></div>
            <div class="bg-gray-50 p-4 rounded-lg"><label class="text-xs text-gray-500">RG</label><p class="font-semibold">${p.rg || '-'}</p></div>
            <div class="bg-gray-50 p-4 rounded-lg"><label class="text-xs text-gray-500">Celular</label><p class="font-semibold">${p.celular || '-'}</p></div>
            <div class="bg-gray-50 p-4 rounded-lg"><label class="text-xs text-gray-500">Telefone</label><p class="font-semibold">${p.telefone || '-'}</p></div>
            <div class="bg-gray-50 p-4 rounded-lg"><label class="text-xs text-gray-500">E-mail</label><p class="font-semibold">${p.email || '-'}</p></div>
            <div class="bg-gray-50 p-4 rounded-lg"><label class="text-xs text-gray-500">Convênio</label><p class="font-semibold">${p.convenio || '-'}</p></div>
            <div class="bg-gray-50 p-4 rounded-lg"><label class="text-xs text-gray-500">Nº Carteirinha</label><p class="font-semibold">${p.numero_carteirinha || '-'}</p></div>
            <div class="bg-gray-50 p-4 rounded-lg"><label class="text-xs text-gray-500">Contato Emergência</label><p class="font-semibold">${p.contato_emergencia || '-'}</p></div>
            <div class="bg-gray-50 p-4 rounded-lg"><label class="text-xs text-gray-500">Endereço</label><p class="font-semibold">${p.endereco ? `${p.endereco}, ${p.cidade || ''} - ${p.estado || ''}` : '-'}</p></div>
        </div>
        <div class="mt-4"><button onclick="editarPaciente(${p.id})" class="bg-indigo-600 text-white px-4 py-2 rounded-lg"><i class="fas fa-edit mr-2"></i>Editar Dados</button></div>
    `;
    document.getElementById('tab-dados-content').innerHTML = html;
}

function carregarTabClinico(dados) {
    const h = dados.historico_clinico || {};
    
    const html = `
        <form id="form-historico-clinico" onsubmit="salvarHistoricoClinico(event)">
            <input type="hidden" id="clinico-paciente-id" value="${dados.paciente.id}">
            <div class="grid grid-cols-1 gap-4">
                <div><label class="block text-sm font-bold mb-2">Doenças Pré-existentes</label><textarea id="clinico-doencas" rows="2" class="w-full px-3 py-2 border rounded-lg">${escapeHtml(h.doencas || '')}</textarea></div>
                <div><label class="block text-sm font-bold mb-2">Alergias</label><textarea id="clinico-alergias" rows="2" class="w-full px-3 py-2 border rounded-lg">${escapeHtml(h.alergias || '')}</textarea></div>
                <div><label class="block text-sm font-bold mb-2">Medicamentos em Uso</label><textarea id="clinico-medicamentos" rows="2" class="w-full px-3 py-2 border rounded-lg">${escapeHtml(h.medicamentos || '')}</textarea></div>
                <div><label class="block text-sm font-bold mb-2">Cirurgias/Internações</label><textarea id="clinico-cirurgias" rows="2" class="w-full px-3 py-2 border rounded-lg">${escapeHtml(h.cirurgias || '')}</textarea></div>
                <div><label class="block text-sm font-bold mb-2">Gestante?</label><input type="text" id="clinico-gestante" class="w-full px-3 py-2 border rounded-lg" value="${escapeHtml(h.gestante || '')}" placeholder="Sim/Não + semanas"></div>
                <div><label class="block text-sm font-bold mb-2">Hábitos (tabagismo, bruxismo, etc)</label><textarea id="clinico-habitos" rows="2" class="w-full px-3 py-2 border rounded-lg">${escapeHtml(h.habitos || '')}</textarea></div>
                <div><label class="block text-sm font-bold mb-2">Última Visita ao Dentista</label><input type="text" id="clinico-ultima-visita" class="w-full px-3 py-2 border rounded-lg" value="${escapeHtml(h.ultima_visita || '')}"></div>
                <div><label class="block text-sm font-bold mb-2">Anamnese/Observações</label><textarea id="clinico-anamnese" rows="3" class="w-full px-3 py-2 border rounded-lg">${escapeHtml(h.anamnese || '')}</textarea></div>
            </div>
            <div class="mt-4"><button type="submit" class="bg-green-600 text-white px-4 py-2 rounded-lg"><i class="fas fa-save mr-2"></i>Salvar Histórico</button></div>
        </form>
    `;
    document.getElementById('tab-clinico-content').innerHTML = html;
}

async function salvarHistoricoClinico(event) {
    event.preventDefault();
    const paciente_id = document.getElementById('clinico-paciente-id').value;
    
    const dados = {
        paciente_id: parseInt(paciente_id),
        doencas: document.getElementById('clinico-doencas').value,
        alergias: document.getElementById('clinico-alergias').value,
        medicamentos: document.getElementById('clinico-medicamentos').value,
        cirurgias: document.getElementById('clinico-cirurgias').value,
        gestante: document.getElementById('clinico-gestante').value,
        habitos: document.getElementById('clinico-habitos').value,
        ultima_visita: document.getElementById('clinico-ultima-visita').value,
        anamnese: document.getElementById('clinico-anamnese').value
    };
    
    try {
        const response = await fetch(`${window.API_URL}/historico_clinico`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        if (response.ok) {
            alert('✅ Histórico clínico salvo com sucesso!');
        } else {
            alert('Erro ao salvar histórico');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar histórico');
    }
}

function carregarOdontograma(dados) {
    odontogramaAtual = {};
    dados.odontograma.forEach(o => { odontogramaAtual[o.dente_numero] = o; });
    
    const statusColors = {
        'saudavel': '🟢 Saudável',
        'carie': '🟡 Cárie',
        'tratamento': '🔴 Tratamento Necessário',
        'extraido': '⚫ Extraído',
        'tratado': '🔵 Tratado'
    };
    
    let html = `<div class="mb-4 flex gap-2 flex-wrap"><div class="text-xs"><span class="inline-block w-3 h-3 bg-green-500 rounded-full"></span> Saudável</div>
                <div class="text-xs"><span class="inline-block w-3 h-3 bg-yellow-500 rounded-full"></span> Cárie</div>
                <div class="text-xs"><span class="inline-block w-3 h-3 bg-red-500 rounded-full"></span> Tratamento</div>
                <div class="text-xs"><span class="inline-block w-3 h-3 bg-gray-700 rounded-full"></span> Extraído</div>
                <div class="text-xs"><span class="inline-block w-3 h-3 bg-blue-500 rounded-full"></span> Tratado</div></div>`;
    
    // Dentes superiores
    html += `<div class="flex justify-center gap-1 mb-4">`;
    for(let i = 18; i >= 11; i--) {
        const status = odontogramaAtual[i]?.status || 'saudavel';
        const color = status === 'saudavel' ? 'bg-green-500' : status === 'carie' ? 'bg-yellow-500' : status === 'tratamento' ? 'bg-red-500' : status === 'extraido' ? 'bg-gray-700' : 'bg-blue-500';
        html += `<button onclick="editarDente(${i})" class="w-10 h-10 ${color} text-white rounded-lg text-sm font-bold hover:opacity-75">${i}</button>`;
    }
    html += `</div><div class="flex justify-center gap-1 mb-4">`;
    for(let i = 21; i <= 28; i++) {
        const status = odontogramaAtual[i]?.status || 'saudavel';
        const color = status === 'saudavel' ? 'bg-green-500' : status === 'carie' ? 'bg-yellow-500' : status === 'tratamento' ? 'bg-red-500' : status === 'extraido' ? 'bg-gray-700' : 'bg-blue-500';
        html += `<button onclick="editarDente(${i})" class="w-10 h-10 ${color} text-white rounded-lg text-sm font-bold hover:opacity-75">${i}</button>`;
    }
    html += `</div><div class="flex justify-center gap-1">`;
    for(let i = 48; i >= 41; i--) {
        const status = odontogramaAtual[i]?.status || 'saudavel';
        const color = status === 'saudavel' ? 'bg-green-500' : status === 'carie' ? 'bg-yellow-500' : status === 'tratamento' ? 'bg-red-500' : status === 'extraido' ? 'bg-gray-700' : 'bg-blue-500';
        html += `<button onclick="editarDente(${i})" class="w-10 h-10 ${color} text-white rounded-lg text-sm font-bold hover:opacity-75">${i}</button>`;
    }
    html += `</div><div class="flex justify-center gap-1 mt-4">`;
    for(let i = 31; i <= 38; i++) {
        const status = odontogramaAtual[i]?.status || 'saudavel';
        const color = status === 'saudavel' ? 'bg-green-500' : status === 'carie' ? 'bg-yellow-500' : status === 'tratamento' ? 'bg-red-500' : status === 'extraido' ? 'bg-gray-700' : 'bg-blue-500';
        html += `<button onclick="editarDente(${i})" class="w-10 h-10 ${color} text-white rounded-lg text-sm font-bold hover:opacity-75">${i}</button>`;
    }
    html += `</div>`;
    
    document.getElementById('tab-odontograma-content').innerHTML = html;
}

function editarDente(numero) {
    const atual = odontogramaAtual[numero] || { status: 'saudavel', observacao: '' };
    const novoStatus = prompt(`Dente ${numero}\n\nStatus atual: ${atual.status}\n\nEscolha o novo status:\n- saudavel\n- carie\n- tratamento\n- extraido\n- tratado\n\nObservação atual: ${atual.observacao || 'nenhuma'}`, atual.status);
    
    if (novoStatus && ['saudavel', 'carie', 'tratamento', 'extraido', 'tratado'].includes(novoStatus)) {
        const observacao = prompt(`Dente ${numero} - Observação (opcional):`, atual.observacao || '');
        
        fetch(`${window.API_URL}/odontograma`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paciente_id: pacienteAtualId,
                dente_numero: numero,
                status: novoStatus,
                observacao: observacao || ''
            })
        }).then(async (response) => {
            if (response.ok) {
                alert(`✅ Dente ${numero} atualizado para ${novoStatus}`);
                const resp = await fetch(`${window.API_URL}/pacientes/${pacienteAtualId}`);
                dadosPacienteCompleto = await resp.json();
                carregarOdontograma(dadosPacienteCompleto);
            } else {
                alert('Erro ao atualizar dente');
            }
        });
    }
}

function carregarTabConsultas(dados) {
    let html = `<div class="overflow-x-auto"><table class="min-w-full"><thead class="bg-gray-50"><tr><th class="px-4 py-2 text-left">Data</th><th class="px-4 py-2 text-left">Hora</th><th class="px-4 py-2 text-left">Status</th><th class="px-4 py-2 text-left">Valor</th></tr></thead><tbody>`;
    
    dados.consultas.forEach(c => {
        let statusClass = c.status === 'concluida' ? 'text-green-600' : c.status === 'em andamento' ? 'text-blue-600' : 'text-yellow-600';
        html += `<tr><td class="px-4 py-2">${formatarData(c.data)}</td><td class="px-4 py-2">${c.hora}</td><td class="px-4 py-2 ${statusClass}">${c.status}</td><td class="px-4 py-2">R$ ${(c.valor_total || 0).toFixed(2)}</td></tr>`;
    });
    
    html += `</tbody></table></div>`;
    document.getElementById('tab-consultas-content').innerHTML = html;
}

function carregarTabAnotacoes(dados) {
    let html = `<div class="mb-4"><textarea id="nova-anotacao" rows="3" class="w-full px-3 py-2 border rounded-lg" placeholder="Digite uma nova anotação..."></textarea>
                <button onclick="adicionarAnotacao()" class="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg"><i class="fas fa-plus mr-2"></i>Adicionar Anotação</button></div>
                <div id="lista-anotacoes">`;
    
    dados.anotacoes.forEach(a => {
        html += `<div class="bg-gray-50 p-3 rounded-lg mb-2"><div class="flex justify-between"><span class="text-xs text-gray-500">${formatarDataHora(a.data_anotacao)}</span>
                <button onclick="excluirAnotacao(${a.id})" class="text-red-500"><i class="fas fa-trash"></i></button></div><p class="mt-1">${escapeHtml(a.texto)}</p></div>`;
    });
    
    html += `</div>`;
    document.getElementById('tab-anotacoes-content').innerHTML = html;
}

async function adicionarAnotacao() {
    const texto = document.getElementById('nova-anotacao').value;
    if (!texto.trim()) {
        alert('Digite uma anotação');
        return;
    }
    
    try {
        const response = await fetch(`${window.API_URL}/anotacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paciente_id: pacienteAtualId, texto: texto })
        });
        
        if (response.ok) {
            document.getElementById('nova-anotacao').value = '';
            const resp = await fetch(`${window.API_URL}/pacientes/${pacienteAtualId}`);
            dadosPacienteCompleto = await resp.json();
            carregarTabAnotacoes(dadosPacienteCompleto);
        } else {
            alert('Erro ao adicionar anotação');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar anotação');
    }
}

async function excluirAnotacao(id) {
    if (!confirm('Excluir esta anotação?')) return;
    
    try {
        const response = await fetch(`${window.API_URL}/anotacoes/${id}`, { method: 'DELETE' });
        if (response.ok) {
            const resp = await fetch(`${window.API_URL}/pacientes/${pacienteAtualId}`);
            dadosPacienteCompleto = await resp.json();
            carregarTabAnotacoes(dadosPacienteCompleto);
        } else {
            alert('Erro ao excluir anotação');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir anotação');
    }
}

function carregarTabArquivos(dados) {
    let html = `<form id="form-upload" enctype="multipart/form-data"><input type="file" id="arquivo-upload" accept="image/*,application/pdf"><button type="submit" class="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg"><i class="fas fa-upload mr-2"></i>Enviar Arquivo</button></form>
                <div id="lista-arquivos" class="mt-4">`;
    
    dados.arquivos.forEach(a => {
        const isImage = a.tipo.startsWith('image/');
        html += `<div class="bg-gray-50 p-3 rounded-lg mb-2 flex justify-between items-center">
                    <div><i class="fas ${isImage ? 'fa-image' : 'fa-file-pdf'} mr-2"></i>${escapeHtml(a.nome_arquivo)}<br><span class="text-xs text-gray-500">${formatarDataHora(a.data_upload)}</span></div>
                    <div><a href="${a.caminho}" target="_blank" class="text-blue-600 mr-2"><i class="fas fa-download"></i></a>
                    <button onclick="excluirArquivo(${a.id})" class="text-red-600"><i class="fas fa-trash"></i></button></div>
                </div>`;
    });
    
    html += `</div>`;
    document.getElementById('tab-arquivos-content').innerHTML = html;
    
    document.getElementById('form-upload')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('arquivo-upload');
        const file = fileInput.files[0];
        if (!file) { alert('Selecione um arquivo'); return; }
        
        const formData = new FormData();
        formData.append('arquivo', file);
        
        try {
            const response = await fetch(`${window.API_URL}/upload/${pacienteAtualId}`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                alert('Arquivo enviado com sucesso!');
                fileInput.value = '';
                const resp = await fetch(`${window.API_URL}/pacientes/${pacienteAtualId}`);
                dadosPacienteCompleto = await resp.json();
                carregarTabArquivos(dadosPacienteCompleto);
            } else {
                alert('Erro ao enviar arquivo');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar arquivo');
        }
    });
}

async function excluirArquivo(id) {
    if (!confirm('Excluir este arquivo?')) return;
    
    try {
        const response = await fetch(`${window.API_URL}/arquivos/${id}`, { method: 'DELETE' });
        if (response.ok) {
            const resp = await fetch(`${window.API_URL}/pacientes/${pacienteAtualId}`);
            dadosPacienteCompleto = await resp.json();
            carregarTabArquivos(dadosPacienteCompleto);
        } else {
            alert('Erro ao excluir arquivo');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir arquivo');
    }
}

function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
}

function formatarDataHora(data) {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR');
}

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