import jwt from "jsonwebtoken";
import { db } from "../database/postgres.js";
import rateLimit from "express-rate-limit"
import schemas from "../helpers/schemas.js";
import natureza from "../helpers/natureza.js";



const authenticateToken = async (req, res, next) => {
  const user = await natureza.getUser(req)

  if (!user) return res.status(401).json({message: "Token inválido ou ausente."})

  next();
};

// Rate limiter for endpoints that use `normalUserPerm`.
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: "Muitas tentativas de acesso, tente novamente mais tarde.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    // Prefer userId parsed from token (set by `attachUser`) otherwise fallback
    // to refreshToken cookie or IP.
    return req.user?.userId || req.cookies?.refreshToken || req.ip;
  }
});

// Middleware that verifies the token and attaches decoded payload to `req.user`.
const attachUser = async (req, res, next) => {
  const token = req?.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  try {
    const user = await natureza.getUser(req)
    req.user = user;
    return next();
  } catch (err) {
    console.error("Erro ao anexar usuário:", err.message || err);
    return res.status(403).json({ message: "Token inválido" });
  }
};

const onlyAdmins = async (req, res, next) => {
  try {
    const user = await natureza.getUser(req)
    
    if (!user || !user.ativo) {
      return res.status(403).json({ message: "Usuário não encontrado ou inativo." });
    }

    const isAdmin = user.permissoes.includes("admin");
    if (!isAdmin) {
      console.warn(`Tentativa de acesso não autorizado: usuário ${user.id_usuario}`);
      return res.status(403).json({ message: "Acesso negado." });
    }
    next();
  } catch (err) {
    console.error("Erro ao verificar o token:", err.message || err);
    return res.status(403).json({ message: "Token inválido" });
  }
}

const normalUserPerm = async (req, res, next) => {

  try {
    const user = await natureza.getUser(req)

    if (!user || !user.ativo) {
      return res.status(403).json({ message: "Usuário não encontrado ou inativo." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Erro ao verificar token:", err.message || err);
    return res.status(403).json({ message: "Token inválido" });
  }
};

const checkSchema = async (req, res, next) => {
  try {
    const user = await natureza.getUser(req)
    await schemas.createNew(user.schema.substring(4))
    next()
  } catch (err) {
    console.error("Erro ao checar schema:", err.message || err);
    return res.status(403).json({ message: "Token inválido" });
  }
}

export default { authenticateToken, onlyAdmins, normalUserPerm, attachUser, checkSchema, normalUserPermLimiter: rateLimiter };
