const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.validarDocumento = async (req, res) => {
  try {
    const { frente, verso } = req.body;
    if (!frente || !verso) {
      return res.status(400).json({ error: 'Imagens da frente e verso são obrigatórias' });
    }

    const base64Frente = frente.split(',')[1];
    const base64Verso = verso.split(',')[1];

    if (!base64Frente || !base64Verso) {
      return res.status(400).json({ error: 'Formato de imagem inválido' });
    }

    // Usar modelo estável e amplamente disponível
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" }); // ou "gemini-pro"

    const prompt = `
      Você é um extrator de dados de Bilhete de Identidade angolano.
      Analise a imagem da FRENTE do BI e extraia os seguintes campos:
      - numero_bi (formato: números + letras da província + números)
      - nome_completo
      - data_nascimento (formato YYYY-MM-DD)
      - genero (Masculino/Feminino)
      - nacionalidade
      - local_emissao
      Retorne APENAS um JSON válido.
    `;

    // O modelo gemini-1.0-pro aceita apenas texto, não imagem inline?
    // Na verdade, gemini-1.0-pro não suporta visão. Precisamos de um modelo com visão.
    // O erro original era de modelo não encontrado. Vamos tentar "gemini-1.5-pro" que suporta visão.
    // Mas se não funcionar, usaremos um mock com OCR simples.

    // Alternativa: usar modelo com visão disponível
    const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await visionModel.generateContent([
      { text: prompt },
      { inlineData: { mimeType: "image/jpeg", data: base64Frente } }
    ]);

    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const dados = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Não foi possível extrair os dados' };

    req.session.documento = dados;

    return res.status(200).json({ success: true, dados });
  } catch (error) {
    console.error('Erro no processamento do documento:', error);
    return res.status(500).json({ error: 'Erro interno ao processar o documento' });
  }
};