import knex from "knex";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

// Configurar a conexão com PostgreSQL
const db = knex({
  client: "pg",
  connection: {
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    charset: "utf8",
    ssl: "false"
  },
  pool: {
    min: 0,
    max: 2,
  },
  acquireConnectionTimeout: 10000,
});

// Função para auxiliar nas consultas SQL com async/await
async function query(command, params = [], method = "raw") {
  try {
    if (!command) {
      throw new Error("Comando SQL não fornecido");
    }

    const result = await db.raw(command, params);
    return result;
  } catch (error) {
    console.error("Erro ao executar consulta SQL:", error.message);
    throw error;
  }
}

// Verificar se a conexão foi bem-sucedida
async function testConnection() {
  try {
    await db.raw("SELECT 1");
    // console.log("Conexão com o PostgreSQL bem-sucedida!");
  } catch (error) {
    console.error("Erro ao conectar ao PostgreSQL:", error.message);
  }
}

// Testando a conexão
testConnection();

export { db, query };