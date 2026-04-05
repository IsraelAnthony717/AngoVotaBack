const models = require('../models');
console.log('models:', models); // veja o que aparece no terminal do backend
const Candidato = models.candidatos || models.Candidato; // tenta ambas as formas
console.log('Candidato:', Candidato);


module.exports = {
  // GET /candidatos
  async listar(req, res) {
    try {
      const candidatos = await Candidato.findAll();
      return res.json(candidatos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao listar candidatos' });
    }
  },

  // GET /candidatos/:id
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const candidato = await Candidato.findByPk(id);
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
      // Extrai apenas os campos permitidos (evita injeção de campos não desejados)
      const { nome, idade, descricao, partido, abrevpartido, cor, foto } = req.body;
      const novoCandidato = await Candidato.create({
        nome,
        idade,
        descricao,
        partido,
        abrevpartido,
        cor,
        foto
        // slogan e backgroundurl podem ser ignorados ou receber valores padrão
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

      const candidato = await Candidato.findByPk(id);
      if (!candidato) {
        return res.status(404).json({ erro: 'Candidato não encontrado' });
      }

      // Atualiza apenas os campos enviados
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
      const candidato = await Candidato.findByPk(id);
      if (!candidato) {
        return res.status(404).json({ erro: 'Candidato não encontrado' });
      }
      await candidato.destroy();
      return res.status(204).send(); // sem conteúdo
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

      const candidato = await Candidato.findByPk(candidato_id);
      if (!candidato) {
        return res.status(404).json({ erro: 'Candidato não encontrado' });
      }

      candidato.votos += 1;
      await candidato.save();

      return res.json({ message: 'Voto registrado com sucesso', votos: candidato.votos });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao registrar voto' });
    }
  }
};