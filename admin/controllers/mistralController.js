const fs = require('fs');
const path = require('path');
const os = require('os');
const modeloGemini = require('../service/modeloGemini'); // aponta para o arquivo do colega

exports.validarDocumento = async (req, res) => {
  let tempFile = null;
  try {
    console.log('📥 Requisição recebida em /validar-documento (Mistral)');
    const { frente } = req.body;
    if (!frente) {
      return res.status(400).json({ error: 'Imagem da frente é obrigatória' });
    }

    if (!process.env.KeyMISTRAL) {
      console.error('❌ Chave KeyMISTRAL não encontrada');
      return res.status(500).json({ error: 'Chave da API não configurada' });
    }

    const base64Data = frente.replace(/^data:image\/\w+;base64,/, '');
    tempFile = path.join(os.tmpdir(), `bi_${Date.now()}.jpg`);
    fs.writeFileSync(tempFile, base64Data, 'base64');

    const resultado = await modeloGemini.VerificarBI(tempFile);
    console.log('Resultado Mistral:', JSON.stringify(resultado, null, 2));

    if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

    if (resultado.e_bi_Angolano && !resultado.foto_copia) {
      const numeroBI = resultado.numero_bi || '000000000LA000';
      return res.status(200).json({
        success: true,
        dados: {
          numero_bi: numeroBI,
          nome_completo: 'Extraído do BI',
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
    console.error('❌ Erro no processamento:', error);
    if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    return res.status(500).json({ error: 'Erro interno ao validar documento', detalhe: error.message });
  }
};