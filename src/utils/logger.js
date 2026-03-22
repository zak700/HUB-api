import winston from "winston";
import path from "path";
import "winston-daily-rotate-file";

// Configuração dos formatos de log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Configuração do logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports: [
    // Logs de erro serão salvos em error.log
    new winston.transports.DailyRotateFile({
      filename: path.join("logs", "error-%DATE%.log"),
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d", // Limita os arquivos de log a 14 dias
    }),
    // Todos os logs serão salvos em combined.log
    new winston.transports.DailyRotateFile({
      filename: path.join("logs", "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d", // Limita os arquivos de log a 30 dias
    }),
  ],
});

// Se não estiver em produção, também loga no console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Função para log de requisições HTTP
const httpLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("HTTP Request", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("user-agent") || "",
      ip: req.ip,
      requestId: req.id || "não definido", // Se você tiver um ID de requisição
    });
  });
  next();
};

// Função para log de erros
const errorLogger = (err, req, res, next) => {
  logger.error("Error", {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    user: req.id_user || "não autenticado",
    requestId: req.id || "não definido", // ID de requisição, se disponível
  });
  next(err);
};

export { logger, httpLogger, errorLogger };
