import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet"; // Para segurança adicional
import routerCampos from "./routers/routersCampos.js";
import routerRelatorios from "./routers/relatoriosRouter.js";
import { errorLogger } from "./utils/logger.js"; // Middleware de log de erro
import cookieParser from "cookie-parser";
import papelFreeRouter from "./routers/papelFreeRouter.js";
import usersRouter from "./routers/usersRouter.js";

dotenv.config();

const app = express();

app.use(express.json({ type: "application/json", limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Middleware para segurança
app.use(helmet());

app.use(cookieParser()); // Middleware para analisar cookies

// Configuração do CORS (permitir apenas domínios específicos)
app.use(
  cors({
    origin: "https://hubmain.com.br",
    credentials: true, // se for usar cookies/autenticação no futuro
  })
);

// Roteamento principal
app.use(routerCampos);
app.use(routerRelatorios);
app.use(papelFreeRouter);
app.use(usersRouter);

// Middleware para log de erros (caso o código de erro não tenha sido tratado em rotas específicas)
app.use(errorLogger);

// Captura de erro de forma global (não detectado por rotas específicas)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Algo deu errado. Tente novamente mais tarde." });
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});
