//Importações necessárias
const express = require('express');

require('dotenv').config();

const cors = require('cors');

const session = require('express-session');

const http = require('http');

const routes = require('./routes');

const { Server } = require('socket.io');

const app = express();




app.set('trust proxy', 1);

//Middleware necessários
app.use(cors({
  origin: process.env.CONEXAO ? [process.env.CONEXAO, 'http://localhost:4200'] : 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));// conexão com o frontend
app.use(express.json()); //trata toda estrutura em json
app.use(express.urlencoded({ extended: true }));
// Configurações da sessão
app.use(session({
  secret: process.env.KeySession,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true apenas em produção (HTTPS)
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' para cross-site
    maxAge: 1000 * 60 * 60 // 1 hora
  }
}));




const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(routes);





const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CONEXAO ? [process.env.CONEXAO, 'http://localhost:4200'] : 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.set('io', io);







module.exports = { server, io };



