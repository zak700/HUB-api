import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { validationResult } from "express-validator";
import hpp from "hpp";

// Rate limiting - limita o número de requisições por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.RATE_LIMIT_MAX || 200, // limite de requisições por windowMs, configurável por variável de ambiente
  message: {
    error: true,
    message:
      "Muitas requisições deste IP, por favor tente novamente após 15 minutos",
  },
});

// Middleware para validação de dados
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      message: "Dados inválidos",
      errors: errors.array(),
    });
  }
  next();
};

// Middleware para logging
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  next();
};

// Middleware para tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.stack}`);

  // Trata erros específicos de uma forma mais clara
  if (err.isValidationError) {
    return res.status(400).json({
      error: true,
      message: "Erro de validação",
      details: err.details,
    });
  }

  // Erro genérico
  res.status(500).json({
    error: true,
    message: "Erro interno do servidor",
  });
};

// Configurações do Helmet
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true,
});

// CORS configuração mais restritiva
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  credentials: true,
  maxAge: 600, // 10 minutos
};

export {
  limiter,
  validateRequest,
  requestLogger,
  errorHandler,
  helmetConfig,
  corsOptions,
  hpp as preventParameterPollution,
};
