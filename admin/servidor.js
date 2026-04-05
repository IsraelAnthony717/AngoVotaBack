const { server } = require('./app');
const db = require('./models');

async function enableCrypto() {
  try {
    await db.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log('✅ Extensão pgcrypto habilitada');
  } catch (err) {
    console.error('❌ Erro ao habilitar pgcrypto:', err.message);
  }
}

async function syncTables() {
  // Ordem correta baseada nas dependências
  const ordem = [
    'perfil',
    'bilhetes_identidade',
    'candidatos',
    'credenciais',
    'eleitores',
    'perfil_oficial_cne',
    'votos',
    'utilizador',
    'log_acesso'
  ];
  
  const models = db.sequelize.models;
  
  // Desabilita temporariamente a verificação de chaves estrangeiras
  await db.sequelize.query('SET CONSTRAINTS ALL DEFERRED;');
  
  for (const nome of ordem) {
    const model = models[nome];
    if (!model) {
      console.warn(`⚠️ Modelo ${nome} não encontrado`);
      continue;
    }
    try {
      await model.sync({ alter: true });
      console.log(`✅ Tabela ${nome} sincronizada`);
    } catch (err) {
      console.error(`❌ Erro ao sincronizar ${nome}:`, err.message);
      // Tenta criar sem constraints (fallback)
      try {
        await db.sequelize.query(`DROP TABLE IF EXISTS "${nome}" CASCADE;`);
        await model.sync({ force: true });
        console.log(`✅ Tabela ${nome} recriada sem constraints`);
      } catch (fallbackErr) {
        console.error(`❌ Falha total ao criar ${nome}:`, fallbackErr.message);
        throw fallbackErr;
      }
    }
  }
  
  // Reabilita constraints (não necessário, mas bom)
  await db.sequelize.query('SET CONSTRAINTS ALL IMMEDIATE;');
  console.log('✅ Sincronização concluída');
}

async function init() {
  await enableCrypto();
  await syncTables();
  server.listen(process.env.PORT || 3003, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${process.env.PORT || 3003}`);
  });
}

init().catch(err => {
  console.error('❌ Falha na configuração do banco de dados:', err);
  process.exit(1);
});