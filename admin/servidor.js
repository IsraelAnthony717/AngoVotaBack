const { server } = require('./app');

const db = require('./models');
db.sequelize.sync({ alter: false })  // cuidado: alter: true modifica colunas existentes
  .then(() => console.log('✅ Tabelas sincronizadas'))
  .catch(err => console.error('❌ Erro ao sincronizar:', err));

server.listen(process.env.PORT || 3003, "0.0.0.0", ()=>{
    console.log(`Servidor rodando na porta ${process.env.PORT}`);
});

