const { server } = require('./app');

const db = require('./models');
console.log('Modelos carregados:', Object.keys(db));

server.listen(process.env.PORT || 3003, "0.0.0.0", ()=>{
    console.log(`Servidor rodando na porta ${process.env.PORT}`);
});

