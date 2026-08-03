import { db } from "../../../database/postgres.js";
import bcrypt from "bcrypt";
import tokenHelper from "../../../helpers/tokens.js";
import checker from "../../../../helpers/checker.js";
import { StatusCodes } from "http-status-codes";
const checkTable = async () => {
  await db.schema.createSchemaIfNotExists("public");
  const usuarios = await db.schema.withSchema("public").hasTable("usuarios")
  if (!usuarios) {
    await db.raw(`
      CREATE TABLE IF NOT EXISTS public.usuarios (
        id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nome character varying(50) NOT NULL,
        email character varying(100) NOT NULL,
        password character varying(100) NOT NULL,
        pfp_image bytea,
        cpf character varying(11) NOT NULL,
        telefone character varying(20) NOT NULL,
        enderecos jsonb NOT NULL,
        endereco_edit jsonb,
        ativo boolean DEFAULT true NOT NULL,
        permissoes character varying[] NOT NULL
      );
    `)
  }
}

const checkPessoaTable = async () => {
  const hasTable = await db.schema.hasTable("eleicaoPessoa")
  if (!hasTable) {
    await db.schema.createTable("eleicaoPessoa", (table) => {
      table.increments("id", { primaryKey: true });
      table.integer("idAdded").notNullable();
      table.jsonb("data").notNullable();
    })
    return
  }
}

const getUserFromReq = async (req) => {
  try {
    const cookies = req.cookies
    const { userId } = tokenHelper.verifyRefreshToken(cookies.refreshToken);
    const user = await db("eleicaoUsers").select("data", "type", "image", "email", "id").where({ id: userId }).first()
    return user
  } catch {
    return null
  }
}

const checkEleicaoUsersTable = async () => {
  const hasTable = await db.schema.hasTable("eleicaoUsers")
  if (!hasTable) {
    await db.schema.createTable("eleicaoUsers", (table) => {
      table.increments("id", { primaryKey: true });
      table.jsonb("data").notNullable();
      table.string("type", 12).notNullable();
      table.binary("image")
      table.string("password").notNullable();
      table.string("email", 250).notNullable();
    })
    return
  }

  const hasEmailColumn = await db.schema.hasColumn("eleicaoUsers", "email")
  if (!hasEmailColumn) {
    await db.schema.alterTable("eleicaoUsers", (table) => {
      table.string("email", 250).notNullable();
    })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    const requirements = [
      /[0-9]/,
      /[a-z]/,
      /[A-Z]/,
      /[$&+,:;=?@#|'<>.^*()%!\-_]/
    ];

    await checkTable()

    const found = (await db.table("eleicaoUsers").select("*").where({ email }))[0]

    if (!found) {
      return res.status(404).json({
        message: "Nenhuma conta encontrada."
      })
    }
    const isPasswordValid = await bcrypt.compare(password, found.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Senha incorreta." })
    }
    const refreshToken = tokenHelper.generateRefreshToken(found.id);

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        path: "/",
        httpOnly: true,
        secure: true, // true in production with HTTPS
        sameSite: "None", // Adjust as needed
      })
      .json({})
  } catch (error) {
    return res.status(500).json({ message: "Erro ao fazer login, status: 500" })
  }
}

async function registerCandidato(req, res) {
  const img = req.files?.img?.[0]
  const data = JSON.parse(req.body.data)
  const check = await checker.candidatoData(data)
  if (check.length) return res.status(400).json(check)
  await checkEleicaoUsersTable();
  data.cpf = data.cpf.replaceAll(/\D/g, "")
  if (data.cpf.length !== 11) return res.status(StatusCodes.CONFLICT).json({ message: "CPF inválido" })
  const password = data.password
  const email = data.email
  delete data.password
  delete data.email
  const hashedPassword = await bcrypt.hash(password, 13);

  const response = await db("eleicaoUsers").insert({
    data,
    type: "candidato",
    image: img?.buffer ?? null,
    password: hashedPassword,
    email
  }).returning("*")
  const refreshToken = tokenHelper.generateRefreshToken(response[0].id);

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      secure: true, // true in production with HTTPS
      sameSite: "None", // Adjust as needed
    })
    .json({})
}

async function registerContador(req, res) {
  try {
    const data = req.body
    const check = await checker.contadorData(data)
    console.log(check)
    if (check.length) return res.status(400).json(check)
    const { email, password } = data
    delete data.email
    delete data.password
    const hashedPassword = await bcrypt.hash(password, 13);
    // --
    const response = await db("eleicaoUsers").insert({
      data,
      type: "contador",
      image: null,
      password: hashedPassword,
      email
    }).returning("*")
    const refreshToken = tokenHelper.generateRefreshToken(response[0].id);

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        path: "/",
        httpOnly: true,
        secure: true, // true in production with HTTPS
        sameSite: "None", // Adjust as needed
      })
      .json({})
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." })
  }
}

async function getUser(req, res) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return res.status(StatusCodes.FORBIDDEN).json({ message: "Token expirado, faça login novamente." })
    return res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." })
  }
}

async function refreshToken(req, res) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return res.status(StatusCodes.FORBIDDEN).json({ message: "Token expirado, faça login novamente." })
    const refreshToken = tokenHelper.generateRefreshToken(user.id);
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        path: "/",
        httpOnly: true,
        secure: true, // true in production with HTTPS
        sameSite: "None", // Adjust as needed
      })
      .json()
  } catch (error) {
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." })
  }
}

async function logoutUser(req, res) {
  try {
    res.clearCookie("refreshToken", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({ message: "Logout realizado com sucesso." })
  } catch (error) {
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." })
  }
}

async function registerPessoa(req, res) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return res.status(404).json({ message: "Erro ao buscar usuário" })
    await checkPessoaTable()
    await db("eleicaoPessoa").insert({
      idAdded: user.id,
      data: req.body
    })
    return res.status(200).json({ message: "Ok" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." })
  }
}

async function getAllPessoas(req, res) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return res.status(404).json({ message: "Erro ao buscar usuário" })
    const response = await db("eleicaoPessoa").select("*")
    return res.status(200).json(response)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." })
  }
}

async function deletePessoa(req, res) {
  try {
    const user = await getUserFromReq(req)
    const { id } = req.params
    if (!user) return res.status(404).json({ message: "Erro ao buscar usuário" })
    await db("eleicaoPessoa").delete().where({ id })
    return res.status(200).json({ message: "Ok" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." })
  }
}

export default {
  login,
  registerCandidato,
  getUser,
  refreshToken,
  logoutUser,
  registerContador,
  registerPessoa,
  getAllPessoas,
  deletePessoa
}