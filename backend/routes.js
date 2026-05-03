const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './public/uploads';
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Função para obter o pool do app
function getDb(req) {
    return req.app.get('db');
}

// ============= ROTAS DE AGENDA =============

// Listar todas as consultas
router.get('/consultas', async (req, res) => {
    const db = getDb(req);
    try {
        const result = await db.query('SELECT * FROM consultas ORDER BY data DESC, hora ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Criar nova consulta
router.post('/consultas', async (req, res) => {
    const db = getDb(req);
    const { paciente_id, paciente_nome, paciente_telefone, data, hora, status, valor_total } = req.body;
    
    try {
        const result = await db.query(
            'INSERT INTO consultas (paciente_id, paciente_nome, paciente_telefone, data, hora, status, valor_total) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [paciente_id || null, paciente_nome, paciente_telefone, data, hora, status || 'agendada', valor_total || 0]
        );
        res.json({ id: result.rows[0].id, mensagem: 'Consulta criada com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Atualizar consulta
router.put('/consultas/:id', async (req, res) => {
    const db = getDb(req);
    const { paciente_id, paciente_nome, paciente_telefone, data, hora, status, valor_total } = req.body;
    const { id } = req.params;
    
    try {
        await db.query(
            'UPDATE consultas SET paciente_id = $1, paciente_nome = $2, paciente_telefone = $3, data = $4, hora = $5, status = $6, valor_total = $7 WHERE id = $8',
            [paciente_id || null, paciente_nome, paciente_telefone, data, hora, status, valor_total || 0, id]
        );
        res.json({ mensagem: 'Consulta atualizada com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Deletar consulta
router.delete('/consultas/:id', async (req, res) => {
    const db = getDb(req);
    const { id } = req.params;
    
    try {
        await db.query('DELETE FROM consultas WHERE id = $1', [id]);
        res.json({ mensagem: 'Consulta removida com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ============= ROTAS DE PACIENTES =============

// Listar todos os pacientes
router.get('/pacientes', async (req, res) => {
    const db = getDb(req);
    try {
        const result = await db.query('SELECT * FROM pacientes ORDER BY nome ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Buscar paciente por ID (completo)
router.get('/pacientes/:id', async (req, res) => {
    const db = getDb(req);
    const { id } = req.params;
    
    try {
        const pacienteResult = await db.query('SELECT * FROM pacientes WHERE id = $1', [id]);
        if (pacienteResult.rows.length === 0) {
            res.status(404).json({ erro: 'Paciente não encontrado' });
            return;
        }
        const paciente = pacienteResult.rows[0];
        
        const historicoResult = await db.query('SELECT * FROM historico_clinico WHERE paciente_id = $1', [id]);
        const odontogramaResult = await db.query('SELECT * FROM odontograma WHERE paciente_id = $1', [id]);
        const consultasResult = await db.query('SELECT * FROM consultas WHERE paciente_id = $1 ORDER BY data DESC', [id]);
        const anotacoesResult = await db.query('SELECT * FROM anotacoes WHERE paciente_id = $1 ORDER BY data_anotacao DESC', [id]);
        const arquivosResult = await db.query('SELECT * FROM arquivos WHERE paciente_id = $1 ORDER BY data_upload DESC', [id]);
        
        res.json({
            paciente,
            historico_clinico: historicoResult.rows[0] || {},
            odontograma: odontogramaResult.rows,
            consultas: consultasResult.rows,
            anotacoes: anotacoesResult.rows,
            arquivos: arquivosResult.rows
        });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Criar novo paciente
router.post('/pacientes', async (req, res) => {
    const db = getDb(req);
    const { nome, data_nascimento, cpf, rg, endereco, cidade, estado, cep, telefone, celular, email, contato_emergencia, convenio, numero_carteirinha } = req.body;
    
    try {
        const result = await db.query(
            `INSERT INTO pacientes (nome, data_nascimento, cpf, rg, endereco, cidade, estado, cep, telefone, celular, email, contato_emergencia, convenio, numero_carteirinha) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
            [nome, data_nascimento, cpf, rg, endereco, cidade, estado, cep, telefone, celular, email, contato_emergencia, convenio, numero_carteirinha]
        );
        res.json({ id: result.rows[0].id, mensagem: 'Paciente criado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Atualizar paciente
router.put('/pacientes/:id', async (req, res) => {
    const db = getDb(req);
    const { nome, data_nascimento, cpf, rg, endereco, cidade, estado, cep, telefone, celular, email, contato_emergencia, convenio, numero_carteirinha } = req.body;
    const { id } = req.params;
    
    try {
        await db.query(
            `UPDATE pacientes SET nome = $1, data_nascimento = $2, cpf = $3, rg = $4, endereco = $5, cidade = $6, estado = $7, cep = $8, telefone = $9, celular = $10, email = $11, contato_emergencia = $12, convenio = $13, numero_carteirinha = $14 WHERE id = $15`,
            [nome, data_nascimento, cpf, rg, endereco, cidade, estado, cep, telefone, celular, email, contato_emergencia, convenio, numero_carteirinha, id]
        );
        res.json({ mensagem: 'Paciente atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Deletar paciente
router.delete('/pacientes/:id', async (req, res) => {
    const db = getDb(req);
    const { id } = req.params;
    
    try {
        await db.query('DELETE FROM pacientes WHERE id = $1', [id]);
        res.json({ mensagem: 'Paciente removido com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ============= ROTAS DE HISTÓRICO CLÍNICO =============

router.post('/historico_clinico', async (req, res) => {
    const db = getDb(req);
    const { paciente_id, doencas, alergias, medicamentos, cirurgias, gestante, habitos, ultima_visita, anamnese } = req.body;
    
    try {
        const existing = await db.query('SELECT * FROM historico_clinico WHERE paciente_id = $1', [paciente_id]);
        
        if (existing.rows.length > 0) {
            await db.query(
                `UPDATE historico_clinico SET doencas = $1, alergias = $2, medicamentos = $3, cirurgias = $4, gestante = $5, habitos = $6, ultima_visita = $7, anamnese = $8, updated_at = CURRENT_TIMESTAMP WHERE paciente_id = $9`,
                [doencas, alergias, medicamentos, cirurgias, gestante, habitos, ultima_visita, anamnese, paciente_id]
            );
        } else {
            await db.query(
                `INSERT INTO historico_clinico (paciente_id, doencas, alergias, medicamentos, cirurgias, gestante, habitos, ultima_visita, anamnese) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [paciente_id, doencas, alergias, medicamentos, cirurgias, gestante, habitos, ultima_visita, anamnese]
            );
        }
        res.json({ mensagem: 'Histórico clínico salvo com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ============= ROTAS DE ODONTOGRAMA =============

router.post('/odontograma', async (req, res) => {
    const db = getDb(req);
    const { paciente_id, dente_numero, status, observacao } = req.body;
    
    try {
        await db.query(
            `INSERT INTO odontograma (paciente_id, dente_numero, status, observacao, data_alteracao) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
             ON CONFLICT (paciente_id, dente_numero) DO UPDATE SET status = $3, observacao = $4, data_alteracao = CURRENT_TIMESTAMP`,
            [paciente_id, dente_numero, status, observacao]
        );
        res.json({ mensagem: 'Odontograma atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.get('/odontograma/:paciente_id', async (req, res) => {
    const db = getDb(req);
    const { paciente_id } = req.params;
    
    try {
        const result = await db.query('SELECT * FROM odontograma WHERE paciente_id = $1', [paciente_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ============= ROTAS DE ANOTAÇÕES =============

router.post('/anotacoes', async (req, res) => {
    const db = getDb(req);
    const { paciente_id, texto } = req.body;
    
    try {
        const result = await db.query(
            'INSERT INTO anotacoes (paciente_id, texto) VALUES ($1, $2) RETURNING id',
            [paciente_id, texto]
        );
        res.json({ id: result.rows[0].id, mensagem: 'Anotação adicionada com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.delete('/anotacoes/:id', async (req, res) => {
    const db = getDb(req);
    const { id } = req.params;
    
    try {
        await db.query('DELETE FROM anotacoes WHERE id = $1', [id]);
        res.json({ mensagem: 'Anotação removida com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ============= ROTAS DE ARQUIVOS =============

router.post('/upload/:paciente_id', upload.single('arquivo'), async (req, res) => {
    const db = getDb(req);
    const { paciente_id } = req.params;
    const file = req.file;
    
    if (!file) {
        res.status(400).json({ erro: 'Nenhum arquivo enviado' });
        return;
    }
    
    try {
        const result = await db.query(
            'INSERT INTO arquivos (paciente_id, nome_arquivo, tipo, caminho) VALUES ($1, $2, $3, $4) RETURNING id',
            [paciente_id, file.originalname, file.mimetype, `/uploads/${file.filename}`]
        );
        res.json({ id: result.rows[0].id, mensagem: 'Arquivo enviado com sucesso!', caminho: `/uploads/${file.filename}` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.delete('/arquivos/:id', async (req, res) => {
    const db = getDb(req);
    const { id } = req.params;
    
    try {
        const arquivoResult = await db.query('SELECT * FROM arquivos WHERE id = $1', [id]);
        if (arquivoResult.rows.length > 0) {
            const filePath = `./public${arquivoResult.rows[0].caminho}`;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        await db.query('DELETE FROM arquivos WHERE id = $1', [id]);
        res.json({ mensagem: 'Arquivo removido com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ============= ROTAS DE FINANCEIRO =============

router.get('/recebimentos', async (req, res) => {
    const db = getDb(req);
    try {
        const result = await db.query(`
            SELECT r.*, c.paciente_nome, c.valor_total 
            FROM recebimentos r
            LEFT JOIN consultas c ON r.consulta_id = c.id
            ORDER BY r.data_pagamento DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.get('/recebimentos/:id', async (req, res) => {
    const db = getDb(req);
    const { id } = req.params;
    
    try {
        const result = await db.query(`
            SELECT r.*, c.paciente_nome, c.valor_total 
            FROM recebimentos r
            LEFT JOIN consultas c ON r.consulta_id = c.id
            WHERE r.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            res.status(404).json({ erro: 'Recebimento não encontrado' });
            return;
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.post('/recebimentos', async (req, res) => {
    const db = getDb(req);
    const { consulta_id, valor, forma_pagamento, data_pagamento, descricao } = req.body;
    
    try {
        const result = await db.query(
            'INSERT INTO recebimentos (consulta_id, valor, forma_pagamento, data_pagamento, descricao, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [consulta_id || null, valor, forma_pagamento, data_pagamento, descricao, 'pago']
        );
        res.json({ id: result.rows[0].id, mensagem: 'Recebimento registrado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.put('/recebimentos/:id', async (req, res) => {
    const db = getDb(req);
    const { consulta_id, valor, forma_pagamento, data_pagamento, descricao } = req.body;
    const { id } = req.params;
    
    try {
        await db.query(
            'UPDATE recebimentos SET consulta_id = $1, valor = $2, forma_pagamento = $3, data_pagamento = $4, descricao = $5 WHERE id = $6',
            [consulta_id || null, valor, forma_pagamento, data_pagamento, descricao, id]
        );
        res.json({ mensagem: 'Recebimento atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.delete('/recebimentos/:id', async (req, res) => {
    const db = getDb(req);
    const { id } = req.params;
    
    try {
        await db.query('DELETE FROM recebimentos WHERE id = $1', [id]);
        res.json({ mensagem: 'Recebimento removido com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;