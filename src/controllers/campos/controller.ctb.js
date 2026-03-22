import { StatusCodes } from "http-status-codes";
import natureza from "../../helpers/natureza.js";
import { db } from "../../database/postgres.js";
async function getAllCtb(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  try {
    const totalCount = await db("ctb").count("* as count");
    if (totalCount[0].count == false) {
      return res.status(200).json({});
    }

    const total = Math.ceil(totalCount[0]?.count / pageSize);

    if (Number(page) >= Number(total)) {
      page = total - 1;
    }

    const response = await db("ctb")
      .select("*")
      .orderBy("id", "asc")
      .offset(page * pageSize)
      .limit(pageSize);

    if (response.length === 0) {
      return res.status(404).json({ message: "Nenhum registro encontrado." });
    }
    return res
      .status(200)
      .json({ response, totalPages: total, currentPage: page });
  } catch (error) {
    console.error(
      "error from getAllCtb function from /controllers/controller.ctb.js",
      error,
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const ctb = req.body;

    await db("ctb").insert(ctb);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.ctb.js",
      error,
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirCtb(req, res) {
  const { text, data } = req.body;
  const ctb = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          ctb.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              banco: line.slice(6, 9).trim(),
              agencia: line.slice(9, 13).trim(),
              contaCorrente: line.slice(13, 25).trim(),
              contaCorrenteDigVerif: line.slice(25, 26).trim(),
              tipoConta: line.slice(26, 28).trim(),
              saldoInicial: line.slice(28, 41).trim(),
              vlEntradas: line.slice(41, 54).trim(),
              vlSaidas: line.slice(54, 67).trim(),
              saldoFinal: line.slice(67, 80).trim(),
              nroSequencial: line.slice(90, 96).trim(),
              codFontRecursosMSC: "nan", // FR
              codAEO: "nan", // CO
              content: [],
              line,
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            ctb[dataHelper] &&
            ctb[dataHelper].content &&
            Array.isArray(ctb[dataHelper].content.content)
          ) {
            ctb[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              banco: line.slice(6, 9).trim(),
              agencia: line.slice(9, 13).trim(),
              contaCorrente: line.slice(13, 25).trim(),
              contaCorrenteDigVerif: line.slice(25, 26).trim(),
              tipoConta: line.slice(26, 28).trim(),
              codFonteRecurso: line.slice(28, 34).trim(),
              codFontRecursosMSC: "nan", // FR
              codAEO: "nan", // CO
              saldoInicial: line.slice(34, 47).trim(),
              vlEntradas: line.slice(47, 60).trim(),
              vlSaidas: line.slice(60, 73).trim(),
              saldoFinal: line.slice(73, 90).trim(),
              nroSequencial: line.slice(90, 96).trim(),
              line,
            });
          }
        } else if (line.substring(0, 2) === "90") {
          if (
            ctb[dataHelper] &&
            ctb[dataHelper].content &&
            Array.isArray(ctb[dataHelper].content.content)
          ) {
            ctb[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              vlSaldoExercAntCaixa: line.slice(6, 19).trim(),
              vlSaldoExercAntBanco: line.slice(19, 32).trim(),
              vlSaldoExercAntVinculado: line.slice(32, 45).trim(),
              contaCorrenteDigVerif: line.slice(45, 58).trim(),
              vlSaldoMesSegCaixa: line.slice(58, 71).trim(),
              vlSaldoMesSegBanco: line.slice(71, 84).trim(),
              vlSaldoMesSegVinculado: line.slice(84, 90).trim(),
              nroSequencial: line.slice(90, 96).trim(),
              line,
            });
          }
        } else if (line.substring(0, 2) === "91") {
          if (
            ctb[dataHelper] &&
            ctb[dataHelper].content &&
            Array.isArray(ctb[dataHelper].content.content)
          ) {
            ctb[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              codFonteRecurso: line.slice(6, 12).trim(),
              vlSaldoExercAntCaixa: line.slice(12, 25).trim(),
              vlSaldoExercAntBanco: line.slice(25, 38).trim(),
              vlSaldoExercAntVinculado: line.slice(38, 51).trim(),
              vlSaldoMesSegCaixa: line.slice(51, 64).trim(),
              vlSaldoMesSegBanco: line.slice(64, 77).trim(),
              vlSaldoMesSegVinculado: line.slice(77, 90).trim(),
              nroSequencial: line.slice(90, 96).trim(),
              line,
            });
          }
        }
      }
    }

    const allOrgaos = await db("orgao").select("*")
    const orgaoTypes = { ...Object.fromEntries(natureza.filterOrgaosByDate(allOrgaos.map((e) => e.content), data).map((e) => [e.codOrgao, e.tipoOrgao])) }

    ctb.forEach((ctbValue, ctbIndex) => {
      const tipo10 = ctbValue.content;

      if (orgaoTypes[tipo10.codOrgao]) {
        ctb[ctbIndex].content.tipoOrgao = orgaoTypes[tipo10.codOrgao];
      } else {
        return res.status(404).json({
          message:
            "É obrigatório que o orgão correspondente seja adicionado antes da Conta Bancária !",
        });
      }
    });

    await db.batchInsert("ctb", ctb, 75)

    return res.status(200).json({ message: "CTB inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirCtb function from /controllers/controller.ctb.js",
      error,
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteCtb(req, res) {
  const { id } = req.params;
  try {
    await db("ctb").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteCtb from /controllers/controller.ctb.js",
      error,
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getCtbById(req, res) {
  const { id } = req.params;
  try {
    const ctb = await db("ctb").where({ id: id }).first();
    if (!ctb) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(ctb);
  } catch (error) {
    console.error(
      "error from getCtbById function from /controllers/controller.ctb.js",
      error,
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateCtb(req, res) {
  const { id } = req.params;
  const ctbData = req.body;
  const body = ctbData.body;
  const index = ctbData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("ctb").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Ctb não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("ctb").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("ctb").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateCtb function from /controllers/controller.ctb.js",
      error,
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function contaUpdate(req, res) {
  try {
    const { conta } = req.body

    const ctb = await db("ctb").select("*").where({ id: conta.id }).first()

    if (!ctb) return res.status(StatusCodes.NOT_FOUND).json()

    ctb.content = { ...ctb.content, codFontRecursosMSC: conta.codFontRecursosMSC, codAEO: conta.codAEO, lastContaEdit: new Date().toLocaleString("pt-BR", { timeZone: "UTC" }) }

    ctb.content.content.forEach((e, i) => {
      if (e.tipoRegistro !== "11") return
      const conta11 = conta.contas11.find(conta11 => conta11.conta === e.line.substring(4, 34))
      delete conta11.conta
      ctb.content.content[i] = {...e, ...conta11}
    })

    await db("ctb").where({id: conta.id}).update({content: ctb.content})

    res.status(StatusCodes.OK).json()
  } catch (error) {
    console.error(
      "error from contaUpdate function from /controllers/controller.ctb.js",
      error,
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllCtb,
  Inserir,
  InserirCtb,
  deleteCtb,
  getCtbById,
  updateCtb,
  contaUpdate,
};
