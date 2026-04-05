const { server } = require('./app');
const db = require('./models');

async function syncTables() {
  try {
    // Primeiro, sincroniza a tabela utilizador (pois outras dependem dela)
    await db.utilizador.sync({ alter: true });
    console.log('✅ Tabela utilizador criada/atualizada');

    // Depois, sincroniza todas as outras tabelas (incluindo log_acesso, etc.)
    await db.sequelize.sync({ alter: true });
    console.log('✅ Todas as tabelas sincronizadas');
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}

// Executa a sincronização antes de iniciar o servidor
syncTables().then(() => {
  server.listen(process.env.PORT || 3003, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${process.env.PORT || 3003}`);
  });
});