const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializa o Gemini com a chave da variável de ambiente
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.validarDocumento = async (req, res) => {
  try {
    const { frente, verso } = req.body;
    if (!frente || !verso) {
      return res.status(400).json({ error: 'Imagens da frente e verso são obrigatórias' });
    }

    // Remove o prefixo "data:image/jpeg;base64," ou "data:image/png;base64,"
    const base64Frente = frente.split(',')[1];
    const base64Verso = verso.split(',')[1];

    if (!base64Frente || !base64Verso) {
      return res.status(400).json({ error: 'Formato de imagem inválido' });
    }

    // Escolhe o modelo Gemini (1.5 Flash é rápido e bom para OCR)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Você é um extrator de dados de Bilhete de Identidade angolano.
      Analise a imagem da FRENTE do BI e extraia os seguintes campos:
      - numero_bi (formato: números + letras da província + números, exemplo: "123456789LA045")
      - nome_completo
      - data_nascimento (formato YYYY-MM-DD)
      - genero (Masculino/Feminino)
      - nacionalidade (ex: Angolano)
      - local_emissao (cidade ou província de emissão)

      Se algum campo não for encontrado, use null.
      Retorne APENAS um JSON válido, sem formatação adicional, seguindo o exemplo:
      {
        "numero_bi": "123456789LA045",
        "nome_completo": "João da Silva",
        "data_nascimento": "1990-01-01",
        "genero": "Masculino",
        "nacionalidade": "Angolano",
        "local_emissao": "Luanda"
      }
    `;

    // Envia a imagem da frente (e opcionalmente a do verso) para o Gemini
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: "image/jpeg", data: base64Frente } }
    ]);

    const response = await result.response;
    const text = response.text();

    // Extrai o JSON da resposta (remove possíveis marcações como ```json ... ```)
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta do Gemini não contém JSON válido');
    }
    const dados = JSON.parse(jsonMatch[0]);

    // Opcional: valida se os campos essenciais existem
    if (!dados.numero_bi || !dados.nome_completo) {
      console.warn('Campos essenciais ausentes:', dados);
      // Ainda assim retorna o que conseguiu extrair
    }

    // Salva os dados na sessão para uso posterior
    req.session.documento = dados;

    return res.status(200).json({ success: true, dados });
  } catch (error) {
    console.error('Erro no processamento do documento:', error);
    return res.status(500).json({ error: 'Erro interno ao processar o documento' });
  }
};