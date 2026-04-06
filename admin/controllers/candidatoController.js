const db = require('../models');

module.exports = {
  // GET /candidatos
  async listar(req, res) {
    try {
      // Usa o modelo candidatos (definido no arquivo candidatos.js)
      const candidatos = await db.candidatos.findAll();
      return res.json(candidatos);
    } catch (error) {
      console.error('Erro ao listar candidatos:', error);
      return res.status(500).json({ erro: 'Erro ao listar candidatos' });
    }
  },

  // GET /candidatos/:id
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const candidato = await db.candidatos.findByPk(id);
      if (!candidato) {
        return res.status(404).json({ erro: 'Candidato não encontrado' });
      }
      return res.json(candidato);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao buscar candidato' });
    }
  },

  // POST /candidatos
  async criar(req, res) {
    try {
      const { nome, idade, descricao, partido, abrevpartido, cor, foto } = req.body;
      const novoCandidato = await db.candidatos.create({
        nome,
        idade,
        descricao,
        partido,
        abrevpartido,
        cor,
        foto
        // total_votos começa com 0 por padrão
      });
      return res.status(201).json(novoCandidato);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao criar candidato' });
    }
  },

  // PUT /candidatos/:id
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, idade, descricao, partido, abrevpartido, cor, foto } = req.body;

      const candidato = await db.candidatos.findByPk(id);
      if (!candidato) {
        return res.status(404).json({ erro: 'Candidato não encontrado' });
      }

      await candidato.update({
        nome: nome !== undefined ? nome : candidato.nome,
        idade: idade !== undefined ? idade : candidato.idade,
        descricao: descricao !== undefined ? descricao : candidato.descricao,
        partido: partido !== undefined ? partido : candidato.partido,
        abrevpartido: abrevpartido !== undefined ? abrevpartido : candidato.abrevpartido,
        cor: cor !== undefined ? cor : candidato.cor,
        foto: foto !== undefined ? foto : candidato.foto
      });

      return res.json(candidato);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao atualizar candidato' });
    }
  },

  // DELETE /candidatos/:id
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const candidato = await db.candidatos.findByPk(id);
      if (!candidato) {
        return res.status(404).json({ erro: 'Candidato não encontrado' });
      }
      await candidato.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao deletar candidato' });
    }
  },

  // POST /votar
  async votar(req, res) {
    try {
      const { candidato_id } = req.body;
      if (!candidato_id) {
        return res.status(400).json({ erro: 'candidato_id é obrigatório' });
      }

      const candidato = await db.candidatos.findByPk(candidato_id);
      if (!candidato) {
        return res.status(404).json({ erro: 'Candidato não encontrado' });
      }

      // Incrementa o campo total_votos (definido no modelo)
      candidato.total_votos += 1;
      await candidato.save();

      return res.json({ message: 'Voto registrado com sucesso', votos: candidato.total_votos });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao registrar voto' });
    }
  }
};