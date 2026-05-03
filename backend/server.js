const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// PORTA DINÂMICA PARA O RENDER
const PORT = process.env.PORT || 3000;

// Importar rotas
const routes = require('./routes');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Garantir que a pasta database existe
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

// Criar/Carregar banco de dados
const db = new sqlite3.Database('./database/consultorio.db');

// ============= TABELAS DO SISTEMA =============

// 1. Tabela de consultas (agenda)
db.run(`
  CREATE TABLE IF NOT EXISTS consultas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER,
    paciente_nome TEXT NOT NULL,
    paciente_telefone TEXT NOT NULL,
    data TEXT NOT NULL,
    hora TEXT NOT NULL,
    status TEXT DEFAULT 'agendada',
    valor_total REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Adicionar coluna paciente_id se não existir
db.run(`ALTER TABLE consultas ADD COLUMN paciente_id INTEGER`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
        // Coluna já existe
    }
});

// 2. Tabela de recebimentos (financeiro)
db.run(`
  CREATE TABLE IF NOT EXISTS recebimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consulta_id INTEGER,
    valor REAL NOT NULL,
    forma_pagamento TEXT NOT NULL,
    data_pagamento TEXT NOT NULL,
    status TEXT DEFAULT 'pago',
    descricao TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(consulta_id) REFERENCES consultas(id)
  )
`);

// ============= TABELAS DO PRONTUÁRIO =============

// 3. Tabela de pacientes (dados completos)
db.run(`
  CREATE TABLE IF NOT EXISTS pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 4. Tabela de histórico clínico
db.run(`
  CREATE TABLE IF NOT EXISTS historico_clinico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    doencas TEXT,
    alergias TEXT,
    medicamentos TEXT,
    cirurgias TEXT,
    gestante TEXT,
    habitos TEXT,
    ultima_visita TEXT,
    anamnese TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
  )
`);

// 5. Tabela de odontograma
db.run(`
  CREATE TABLE IF NOT EXISTS odontograma (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    dente_numero INTEGER NOT NULL,
    status TEXT DEFAULT 'saudavel',
    observacao TEXT,
    data_alteracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    UNIQUE(paciente_id, dente_numero)
  )
`);

// 6. Tabela de arquivos
db.run(`
  CREATE TABLE IF NOT EXISTS arquivos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    nome_arquivo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    caminho TEXT NOT NULL,
    data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
  )
`);

// 7. Tabela de anotações
db.run(`
  CREATE TABLE IF NOT EXISTS anotacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    texto TEXT NOT NULL,
    data_anotacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
  )
`);

console.log('✅ Todas as tabelas do sistema foram criadas/verificadas!');

// Rota de teste
app.get('/api/teste', (req, res) => {
  res.json({ mensagem: 'API funcionando! 🚀' });
});

// Rota para verificar saúde do servidor (útil para o Render)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor - IMPORTANTE: usar 0.0.0.0 para o Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📱 Acesse no celular: http://SEU_IP:${PORT} (mesma rede WiFi)`);
  console.log(`\nPara encerrar o servidor: Ctrl + C`);
});