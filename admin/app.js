//Importações necessárias
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const session = require('express-session');
const http = require('http');
const routes = require('./routes');
const { Server } = require('socket.io');
const path = require('path');

const app = express();

app.set('trust proxy', 1);

// Lista de origens permitidas (inclui a do frontend no Vercel)
const allowedOrigins = [
  process.env.CONEXAO,
  'http://localhost:4200',
  'https://ango-vota-front-du9s.vercel.app'
].filter(Boolean);

// Configuração CORS robusta (já lida com OPTIONS)
app.use(cors({
  origin: function(origin, callback) {
    // Permite requisições sem origin (ex: Postman, ferramentas locais)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueou origem: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middlewares padrão
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração da sessão (essencial para cross-origin)
app.use(session({
  secret: process.env.KeySession,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true em produção (HTTPS)
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 // 1 hora
  }
}));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use(routes);

// Criar servidor HTTP e configurar Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.set('io', io);

module.exports = { server, io };