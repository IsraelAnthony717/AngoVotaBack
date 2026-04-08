const fs = require('fs');
const path = require('path');
const modeloGemini = require('../service/modeloGemini'); // caminho correto

exports.validarDocumento = async (req, res) => {
  try {
    const { frente } = req.body;
    if (!frente) {
      return res.status(400).json({ error: 'Imagem da frente é obrigatória' });
    }

    // Converte base64 para arquivo temporário
    const base64Data = frente.replace(/^data:image\/\w+;base64,/, '');
    const tempFile = path.join(__dirname, '../temp_image.jpg');
    fs.writeFileSync(tempFile, base64Data, 'base64');

    // Chama o método do colega
    const resultado = await modeloGemini.VerificarBI(tempFile);

    // Remove o arquivo temporário
    fs.unlinkSync(tempFile);

    if (resultado.e_bi_Angolano && !resultado.foto_copia) {
      // Extrai o número do BI se existir
      const numeroBI = resultado.numero_bi || '000000000LA000';
      return res.status(200).json({
        success: true,
        dados: {
          numero_bi: numeroBI,
          nome_completo: 'Extraído do BI', // o modelo não extrai nome
          data_nascimento: null,
          genero: null,
          nacionalidade: 'Angolano',
          local_emissao: null
        },
        detalhes: resultado
      });
    } else {
      return res.status(400).json({
        error: 'Documento inválido',
        motivo: resultado.motivo || 'Não é um Bilhete de Identidade angolano original'
      });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    return res.status(500).json({ error: 'Erro interno ao validar documento' });
  }
};