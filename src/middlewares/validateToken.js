import jwt from "jsonwebtoken";
import { db } from "../database/postgres.js";
import rateLimit from "express-rate-limit"



const authenticateToken = async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    req.user = decoded;
  } catch (err) {
    console.error("Erro ao verificar o token:", err.message || err);
    return res.status(403).json({ message: "Token inválido" });
  }

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
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("Erro ao anexar usuário:", err.message || err);
    return res.status(403).json({ message: "Token inválido" });
  }
};

const onlyAdmins = async (req, res, next) => {
  try {
    const decoded = req.user || jwt.verify(req.cookies?.refreshToken || "", process.env.REFRESH_TOKEN_SECRET);

    const user = await db("usuarios")
      .select("permissoes", "ativo")
      .where({ id_usuario: decoded.userId })
      .first();

      // console.log(decoded)

    if (!user || !user.ativo) {
      return res.status(403).json({ message: "Usuário não encontrado ou inativo." });
    }

    const isAdmin = user.permissoes.includes("admin");
    if (!isAdmin) {
      console.warn(`Tentativa de acesso não autorizado: usuário ${decoded.userId}`);
      return res.status(403).json({ message: "Acesso negado." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Erro ao verificar o token:", err.message || err);
    return res.status(403).json({ message: "Token inválido" });
  }
}

const normalUserPerm = async (req, res, next) => {
  const id = req.body?.id || req.params?.id;

  if (!id) return res.status(400).json({ message: "ID ausente." });
  if (!/^\d+$/.test(String(id))) return res.status(400).json({ message: "ID inválido." });

  try {
    const decoded = req.user || jwt.verify(req.cookies?.refreshToken || "", process.env.REFRESH_TOKEN_SECRET);

    const user = await db("usuarios")
      .select("permissoes", "ativo")
      .where({ id_usuario: decoded.userId })
      .first();

    if (!user || !user.ativo) {
      return res.status(403).json({ message: "Usuário não encontrado ou inativo." });
    }

    const isAdmin = user.permissoes?.includes("admin");
    const isOwnData = Number(id) === Number(decoded.userId);

    if (!isAdmin && !isOwnData) {
      console.warn(`Tentativa de acesso não autorizado: usuário ${decoded.userId} acessando ${id}`);
      return res.status(403).json({ message: "Acesso negado." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Erro ao verificar token:", err.message || err);
    return res.status(403).json({ message: "Token inválido" });
  }
};

export default { authenticateToken, onlyAdmins, normalUserPerm, attachUser, normalUserPermLimiter: rateLimiter };
