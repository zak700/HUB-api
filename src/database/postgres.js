import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const db = knex({
  client: "pg",
  connection: {
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    charset: "utf8",
    ssl: false,
  },
  pool: {
    min: 0,
    max: 2,
  },
  acquireConnectionTimeout: 10000,
});

// ⏳ função de delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// 🔁 retry de conexão
async function connectWithRetry(retries = 10, wait = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await db.raw("SELECT 1");
      console.log("✅ Conectado ao PostgreSQL!");
      return;
    } catch (error) {
      console.log(`❌ Tentativa ${i} falhou: ${error.code || error.message}`);
      
      if (i === retries) {
        console.error("💥 Não foi possível conectar ao banco.");
        throw error;
      }

      console.log(`⏳ Tentando novamente em ${wait / 1000}s...`);
      await delay(wait);
    }
  }
}

// 🚀 inicia conexão (IMPORTANTE aguardar isso no app)
await connectWithRetry();


// Função de query (mantive igual)
async function query(command, params = []) {
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

export { db, query };