const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializa o Gemini com sua chave (use variável de ambiente)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.validarDocumento = async (req, res) => {
  try {
    const { frente, verso } = req.body;
    if (!frente || !verso) {
      return res.status(400).json({ error: 'Imagens da frente e verso são obrigatórias' });
    }

    // Remove o prefixo "data:image/png;base64," para obter apenas o base64
    const base64Frente = frente.split(',')[1];
    const base64Verso = verso.split(',')[1];

    // Chama o modelo Gemini para extrair informações do documento
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Você é um extrator de dados de Bilhete de Identidade angolano.
      Analise a imagem da FRENTE do BI e extraia os seguintes campos:
      - Número do BI (formato: números + letras da província + números)
      - Nome completo
      - Data de nascimento (formato YYYY-MM-DD)
      - Gênero (Masculino/Feminino)
      - Nacionalidade
      - Local de emissão
      
      Analise também a imagem do VERSO (caso contenha informações adicionais, como data de validade, etc.)
      Retorne APENAS um JSON válido com esses campos.
    `;

    // Envia a imagem da frente (e opcionalmente a do verso) para o Gemini
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: "image/png", data: base64Frente } }
    ]);

    const response = await result.response;
    const text = response.text();
    // Extrai o JSON da resposta (pode vir com marcações)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const dados = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Não foi possível extrair os dados' };

    // Opcional: salvar os dados no banco ou na sessão
    req.session.documento = dados;

    return res.status(200).json({ success: true, dados });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao processar o documento' });
  }
};