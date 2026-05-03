const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const app = express();

const PORT = process.env.PORT || 3000;

// Configuração do PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Importar rotas
const routes = require('./routes');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Garantir que a pasta database existe (para uploads)
const dbDir = './database';
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Usar rotas
app.use('/api', routes);
app.use('/uploads', express.static('public/uploads'));

// Criar pasta para uploads se não existir
const uploadDir = './public/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Tornar o pool acessível nas rotas
app.set('db', pool);

// ============= CRIAÇÃO DAS TABELAS =============

async function initDatabase() {
    try {
        // 1. Tabela de pacientes
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pacientes (
                id SERIAL PRIMARY KEY,
                nome TEXT NOT NULL,
                data_nascimento TEXT,
                cpf TEXT,
                rg TEXT,
                endereco TEXT,
                cidade TEXT,
                estado TEXT,
                cep TEXT,
                telefone TEXT,
                celular TEXT,
                email TEXT,
                contato_emergencia TEXT,
                convenio TEXT,
                numero_carteirinha TEXT,
                foto TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Tabela de consultas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS consultas (
                id SERIAL PRIMARY KEY,
                paciente_id INTEGER,
                paciente_nome TEXT NOT NULL,
                paciente_telefone TEXT NOT NULL,
                data TEXT NOT NULL,
                hora TEXT NOT NULL,
                status TEXT DEFAULT 'agendada',
                valor_total REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL
            )
        `);

        // 3. Tabela de recebimentos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS recebimentos (
                id SERIAL PRIMARY KEY,
                consulta_id INTEGER,
                valor REAL NOT NULL,
                forma_pagamento TEXT NOT NULL,
                data_pagamento TEXT NOT NULL,
                status TEXT DEFAULT 'pago',
                descricao TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(consulta_id) REFERENCES consultas(id) ON DELETE SET NULL
            )
        `);

        // 4. Tabela de histórico clínico
        await pool.query(`
            CREATE TABLE IF NOT EXISTS historico_clinico (
                id SERIAL PRIMARY KEY,
                paciente_id INTEGER NOT NULL,
                doencas TEXT,
                alergias TEXT,
                medicamentos TEXT,
                cirurgias TEXT,
                gestante TEXT,
                habitos TEXT,
                ultima_visita TEXT,
                anamnese TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
            )
        `);

        // 5. Tabela de odontograma
        await pool.query(`
            CREATE TABLE IF NOT EXISTS odontograma (
                id SERIAL PRIMARY KEY,
                paciente_id INTEGER NOT NULL,
                dente_numero INTEGER NOT NULL,
                status TEXT DEFAULT 'saudavel',
                observacao TEXT,
                data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
                UNIQUE(paciente_id, dente_numero)
            )
        `);

        // 6. Tabela de arquivos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS arquivos (
                id SERIAL PRIMARY KEY,
                paciente_id INTEGER NOT NULL,
                nome_arquivo TEXT NOT NULL,
                tipo TEXT NOT NULL,
                caminho TEXT NOT NULL,
                data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
            )
        `);

        // 7. Tabela de anotações
        await pool.query(`
            CREATE TABLE IF NOT EXISTS anotacoes (
                id SERIAL PRIMARY KEY,
                paciente_id INTEGER NOT NULL,
                texto TEXT NOT NULL,
                data_anotacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Todas as tabelas do PostgreSQL foram criadas/verificadas!');
    } catch (error) {
        console.error('Erro ao criar tabelas:', error);
    }
}

initDatabase();

// Rota de teste
app.get('/api/teste', (req, res) => {
    res.json({ mensagem: 'API funcionando com PostgreSQL! 🚀' });
});

// Rota para verificar saúde do servidor
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📱 Acesse no celular: http://SEU_IP:${PORT}`);
});