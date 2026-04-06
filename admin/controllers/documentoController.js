// controllers/documentoController.js (mock)
exports.validarDocumento = async (req, res) => {
  try {
    const { frente, verso } = req.body;
    if (!frente || !verso) {
      return res.status(400).json({ error: 'Imagens da frente e verso são obrigatórias' });
    }

    console.log('Imagens recebidas (tamanhos aproximados):', frente.length, verso.length);

    // Simula extração de dados
    const dados = {
      numero_bi: '123456789LA045',
      nome_completo: 'USUÁRIO TESTE',
      data_nascimento: '1990-01-01',
      genero: 'Masculino',
      nacionalidade: 'Angolano',
      local_emissao: 'Luanda'
    };

    // Opcional: salvar na sessão
    req.session.documento = dados;

    return res.status(200).json({ success: true, dados });
  } catch (error) {
    console.error('Erro no mock:', error);
    return res.status(500).json({ error: 'Erro interno no servidor (mock)' });
  }
};