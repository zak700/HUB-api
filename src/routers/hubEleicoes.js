import { Router } from "express";
import controllerEntidade from "../controllers/controller.entidade.js";
import { validateRequest } from "../middlewares/security.js";
import { validateUsuarioRegistration } from "../middlewares/validators.js";
import controllerUsuario from "../controllers/controller.usuario.js";
import multer from "multer";
import validateToken from "../middlewares/validateToken.js";
import controllerPost from "../controllers/controller.posts.js";

import entry from "../controllers/eleicoes/userHandling/entry.js";

// --------------------------------------------------
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB limit for ZIP packages
});

const hubEleicoes = Router();

// Rota para a raiz da API

hubEleicoes.post("/eleicoes/register/candidato", upload.fields([
  { name: "img", maxCount: 1 },
  { name: "data", maxCount: 1 }
]), entry.registerCandidato);
hubEleicoes.post("/eleicoes/register/contador", validateToken.normalUserPermLimiter, entry.registerContador);
hubEleicoes.post("/eleicoes/register/pessoa", validateToken.normalUserPermLimiter, entry.registerPessoa);

hubEleicoes.post("/eleicoes/login", validateToken.normalUserPermLimiter, entry.login);
hubEleicoes.post("/eleicoes/usuarios/refreshToken", validateToken.normalUserPermLimiter, entry.refreshToken);
hubEleicoes.get("/eleicoes/usuarios/logout", validateToken.normalUserPermLimiter, entry.logoutUser);
hubEleicoes.get("/eleicoes/pessoa", validateToken.normalUserPermLimiter, entry.getAllPessoas);
hubEleicoes.delete("/eleicoes/pessoa/:id", validateToken.normalUserPermLimiter, entry.deletePessoa);
hubEleicoes.get("/eleicoes/get-user", validateToken.normalUserPermLimiter, entry.getUser);

export default hubEleicoes;
