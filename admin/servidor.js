const { server } = require('./app');
const db = require('./models');

async function syncTables() {
  // Ordem manual das tabelas (respeitando dependências de chaves estrangeiras)
  const order = [
    'perfil',                   // utilizado por utilizador
    'bilhetes_identidade',      // utilizado por utilizador
    'perfil_oficial_cne',       // independente
    'candidatos',               // independente
    'credenciais',              // independente
    'eleitores',                // independente
    'votos',                    // independente
    'utilizador',               // depende de perfil e bilhetes_identidade
    'log_acesso'                // depende de utilizador
  ];
  
  const models = db.sequelize.models;
  
  for (const modelName of order) {
    const model = models[modelName];
    if (model) {
      try {
        await model.sync({ alter: true });
        console.log(`✅ Tabela ${modelName} sincronizada`);
      } catch (err) {
        console.error(`❌ Erro ao sincronizar ${modelName}:`, err.message);
        throw err; // Interrompe se falhar
      }
    } else {
      console.warn(`⚠️ Modelo ${modelName} não encontrado`);
    }
  }
  console.log('✅ Todas as tabelas sincronizadas com sucesso');
}

syncTables()
  .then(() => {
    server.listen(process.env.PORT || 3003, "0.0.0.0", () => {
      console.log(`Servidor rodando na porta ${process.env.PORT || 3003}`);
    });
  })
  .catch(err => {
    console.error('Falha na sincronização, servidor não iniciado:', err);
    process.exit(1);
  });