const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/consultorio.db');

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

// ============= ROTAS DE AGENDA =============

// Listar todas as consultas
router.get('/consultas', (req, res) => {
  db.all('SELECT * FROM consultas ORDER BY data DESC, hora ASC', (err, rows) => {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json(rows);
  });
});

// Criar nova consulta (com paciente_id)
router.post('/consultas', (req, res) => {
  const { paciente_id, paciente_nome, paciente_telefone, data, hora, status, valor_total } = req.body;
  
  db.run(
    'INSERT INTO consultas (paciente_id, paciente_nome, paciente_telefone, data, hora, status, valor_total) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [paciente_id || null, paciente_nome, paciente_telefone, data, hora, status || 'agendada', valor_total || 0],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
        return;
      }
      res.json({ id: this.lastID, mensagem: 'Consulta criada com sucesso!' });
    }
  );
});

// Atualizar consulta
router.put('/consultas/:id', (req, res) => {
  const { paciente_id, paciente_nome, paciente_telefone, data, hora, status, valor_total } = req.body;
  const { id } = req.params;
  
  db.run(
    'UPDATE consultas SET paciente_id = ?, paciente_nome = ?, paciente_telefone = ?, data = ?, hora = ?, status = ?, valor_total = ? WHERE id = ?',
    [paciente_id || null, paciente_nome, paciente_telefone, data, hora, status, valor_total || 0, id],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
        return;
      }
      res.json({ mensagem: 'Consulta atualizada com sucesso!' });
    }
  );
});

// Deletar consulta
router.delete('/consultas/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM consultas WHERE id = ?', id, function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json({ mensagem: 'Consulta removida com sucesso!' });
  });
});

// ============= ROTAS DE PACIENTES =============

// Listar todos os pacientes
router.get('/pacientes', (req, res) => {
  db.all('SELECT * FROM pacientes ORDER BY nome ASC', (err, rows) => {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json(rows);
  });
});

// Buscar paciente por ID (completo)
router.get('/pacientes/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM pacientes WHERE id = ?', [id], (err, paciente) => {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    if (!paciente) {
      res.status(404).json({ erro: 'Paciente não encontrado' });
      return;
    }
    
    // Buscar histórico clínico
    db.get('SELECT * FROM historico_clinico WHERE paciente_id = ?', [id], (err, historico) => {
      if (err) {
        res.status(500).json({ erro: err.message });
        return;
      }
      
      // Buscar odontograma
      db.all('SELECT * FROM odontograma WHERE paciente_id = ?', [id], (err, odontograma) => {
        if (err) {
          res.status(500).json({ erro: err.message });
          return;
        }
        
        // Buscar consultas do paciente
        db.all('SELECT * FROM consultas WHERE paciente_id = ? ORDER BY data DESC', [id], (err, consultas) => {
          if (err) {
            res.status(500).json({ erro: err.message });
            return;
          }
          
          // Buscar anotações
          db.all('SELECT * FROM anotacoes WHERE paciente_id = ? ORDER BY data_anotacao DESC', [id], (err, anotacoes) => {
            if (err) {
              res.status(500).json({ erro: err.message });
              return;
            }
            
            // Buscar arquivos
            db.all('SELECT * FROM arquivos WHERE paciente_id = ? ORDER BY data_upload DESC', [id], (err, arquivos) => {
              if (err) {
                res.status(500).json({ erro: err.message });
                return;
              }
              
              res.json({
                paciente,
                historico_clinico: historico || {},
                odontograma: odontograma || [],
                consultas: consultas || [],
                anotacoes: anotacoes || [],
                arquivos: arquivos || []
              });
            });
          });
        });
      });
    });
  });
});

// Criar novo paciente
router.post('/pacientes', (req, res) => {
  const { nome, data_nascimento, cpf, rg, endereco, cidade, estado, cep, telefone, celular, email, contato_emergencia, convenio, numero_carteirinha } = req.body;
  
  db.run(
    `INSERT INTO pacientes (nome, data_nascimento, cpf, rg, endereco, cidade, estado, cep, telefone, celular, email, contato_emergencia, convenio, numero_carteirinha) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nome, data_nascimento, cpf, rg, endereco, cidade, estado, cep, telefone, celular, email, contato_emergencia, convenio, numero_carteirinha],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
        return;
      }
      res.json({ id: this.lastID, mensagem: 'Paciente criado com sucesso!' });
    }
  );
});

// Atualizar paciente
router.put('/pacientes/:id', (req, res) => {
  const { nome, data_nascimento, cpf, rg, endereco, cidade, estado, cep, telefone, celular, email, contato_emergencia, convenio, numero_carteirinha } = req.body;
  const { id } = req.params;
  
  db.run(
    `UPDATE pacientes SET nome = ?, data_nascimento = ?, cpf = ?, rg = ?, endereco = ?, cidade = ?, estado = ?, cep = ?, telefone = ?, celular = ?, email = ?, contato_emergencia = ?, convenio = ?, numero_carteirinha = ? WHERE id = ?`,
    [nome, data_nascimento, cpf, rg, endereco, cidade, estado, cep, telefone, celular, email, contato_emergencia, convenio, numero_carteirinha, id],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
        return;
      }
      res.json({ mensagem: 'Paciente atualizado com sucesso!' });
    }
  );
});

// Deletar paciente
router.delete('/pacientes/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM pacientes WHERE id = ?', id, function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json({ mensagem: 'Paciente removido com sucesso!' });
  });
});

// ============= ROTAS DE HISTÓRICO CLÍNICO =============

// Salvar/Atualizar histórico clínico
router.post('/historico_clinico', (req, res) => {
  const { paciente_id, doencas, alergias, medicamentos, cirurgias, gestante, habitos, ultima_visita, anamnese } = req.body;
  
  db.get('SELECT * FROM historico_clinico WHERE paciente_id = ?', [paciente_id], (err, existing) => {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    
    if (existing) {
      db.run(
        `UPDATE historico_clinico SET doencas = ?, alergias = ?, medicamentos = ?, cirurgias = ?, gestante = ?, habitos = ?, ultima_visita = ?, anamnese = ?, updated_at = CURRENT_TIMESTAMP WHERE paciente_id = ?`,
        [doencas, alergias, medicamentos, cirurgias, gestante, habitos, ultima_visita, anamnese, paciente_id],
        function(err) {
          if (err) {
            res.status(500).json({ erro: err.message });
            return;
          }
          res.json({ mensagem: 'Histórico clínico atualizado com sucesso!' });
        }
      );
    } else {
      db.run(
        `INSERT INTO historico_clinico (paciente_id, doencas, alergias, medicamentos, cirurgias, gestante, habitos, ultima_visita, anamnese) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [paciente_id, doencas, alergias, medicamentos, cirurgias, gestante, habitos, ultima_visita, anamnese],
        function(err) {
          if (err) {
            res.status(500).json({ erro: err.message });
            return;
          }
          res.json({ mensagem: 'Histórico clínico salvo com sucesso!' });
        }
      );
    }
  });
});

// ============= ROTAS DE ODONTOGRAMA =============

// Salvar odontograma
router.post('/odontograma', (req, res) => {
  const { paciente_id, dente_numero, status, observacao } = req.body;
  
  db.run(
    `INSERT OR REPLACE INTO odontograma (paciente_id, dente_numero, status, observacao, data_alteracao) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [paciente_id, dente_numero, status, observacao],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
        return;
      }
      res.json({ mensagem: 'Odontograma atualizado com sucesso!' });
    }
  );
});

// Buscar odontograma do paciente
router.get('/odontograma/:paciente_id', (req, res) => {
  const { paciente_id } = req.params;
  
  db.all('SELECT * FROM odontograma WHERE paciente_id = ?', [paciente_id], (err, rows) => {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json(rows);
  });
});

// ============= ROTAS DE ANOTAÇÕES =============

// Adicionar anotação
router.post('/anotacoes', (req, res) => {
  const { paciente_id, texto } = req.body;
  
  db.run(
    'INSERT INTO anotacoes (paciente_id, texto) VALUES (?, ?)',
    [paciente_id, texto],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
        return;
      }
      res.json({ id: this.lastID, mensagem: 'Anotação adicionada com sucesso!' });
    }
  );
});

// Deletar anotação
router.delete('/anotacoes/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM anotacoes WHERE id = ?', id, function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json({ mensagem: 'Anotação removida com sucesso!' });
  });
});

// ============= ROTAS DE ARQUIVOS =============

// Upload de arquivo
router.post('/upload/:paciente_id', upload.single('arquivo'), (req, res) => {
  const { paciente_id } = req.params;
  const file = req.file;
  
  if (!file) {
    res.status(400).json({ erro: 'Nenhum arquivo enviado' });
    return;
  }
  
  db.run(
    'INSERT INTO arquivos (paciente_id, nome_arquivo, tipo, caminho) VALUES (?, ?, ?, ?)',
    [paciente_id, file.originalname, file.mimetype, `/uploads/${file.filename}`],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
        return;
      }
      res.json({ id: this.lastID, mensagem: 'Arquivo enviado com sucesso!', caminho: `/uploads/${file.filename}` });
    }
  );
});

// Deletar arquivo
router.delete('/arquivos/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM arquivos WHERE id = ?', [id], (err, arquivo) => {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    
    if (arquivo) {
      const filePath = `./public${arquivo.caminho}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    db.run('DELETE FROM arquivos WHERE id = ?', id, function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
        return;
      }
      res.json({ mensagem: 'Arquivo removido com sucesso!' });
    });
  });
});

// ============= ROTAS DE FINANCEIRO =============

// Listar recebimentos
router.get('/recebimentos', (req, res) => {
  db.all(`
    SELECT r.*, c.paciente_nome, c.valor_total 
    FROM recebimentos r
    LEFT JOIN consultas c ON r.consulta_id = c.id
    ORDER BY r.data_pagamento DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json(rows);
  });
});

// Buscar recebimento por ID
router.get('/recebimentos/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT r.*, c.paciente_nome, c.valor_total 
    FROM recebimentos r
    LEFT JOIN consultas c ON r.consulta_id = c.id
    WHERE r.id = ?
  `, [id], (err, row) => {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ erro: 'Recebimento não encontrado' });
      return;
    }
    res.json(row);
  });
});

// Registrar recebimento
router.post('/recebimentos', (req, res) => {
  const { consulta_id, valor, forma_pagamento, data_pagamento, descricao } = req.body;
  
  db.run(
    'INSERT INTO recebimentos (consulta_id, valor, forma_pagamento, data_pagamento, descricao, status) VALUES (?, ?, ?, ?, ?, ?)',
    [consulta_id || null, valor, forma_pagamento, data_pagamento, descricao, 'pago'],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
        return;
      }
      res.json({ id: this.lastID, mensagem: 'Recebimento registrado com sucesso!' });
    }
  );
});

// Atualizar recebimento
router.put('/recebimentos/:id', (req, res) => {
  const { consulta_id, valor, forma_pagamento, data_pagamento, descricao } = req.body;
  const { id } = req.params;
  
  db.run(
    'UPDATE recebimentos SET consulta_id = ?, valor = ?, forma_pagamento = ?, data_pagamento = ?, descricao = ? WHERE id = ?',
    [consulta_id || null, valor, forma_pagamento, data_pagamento, descricao, id],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
        return;
      }
      res.json({ mensagem: 'Recebimento atualizado com sucesso!' });
    }
  );
});

// Deletar recebimento
router.delete('/recebimentos/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM recebimentos WHERE id = ?', id, function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json({ mensagem: 'Recebimento removido com sucesso!' });
  });
});

module.exports = router;