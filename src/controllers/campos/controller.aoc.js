import { db } from "../../database/postgres.js";
async function getAllAoc(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("aoc");

    if (mes) {
      query = query.whereRaw("SUBSTRING(data, 1, 2) = ?", [
        mes.padStart(2, "0"),
      ]);
    }
    if (org) {
      query = query.whereRaw(`content ->> 'codOrgao' = '${String(org).padStart(2, "0")}'`)
    }
    if (ano) {
      query = query.whereRaw("SUBSTRING(data, 3, 2) = ?", [
        String(ano).substring(2, 4),
      ]);
    }

    const totalCount = await query.clone().count("* as count");
    const total = Math.ceil(totalCount[0]?.count / pageSize);

    if (Number(page) >= Number(total)) {
      page = Math.max(0, total - 1);
    }

    const response = await query
      .clone()
      .select("*")
      .orderBy("id", "asc")
      .offset(page * pageSize)
      .limit(pageSize);

    return res.status(200).json({ response, totalPages: total, currentPage: page });
  } catch (error) {
    console.error(
      "error from getAllAoc function from /controllers/controller.aoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const aoc = req.body;

    await db("aoc").insert(aoc);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.aoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAoc(req, res) { 
  const { text, data } = req.body;
  const aoc = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          aoc.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              vlSaldoAntOrcado: line.slice(19, 32).trim(),
              vlSaldoAtual: line.slice(32, 45).trim(),
              nroSequencial: line.slice(80, 86).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            aoc[dataHelper] &&
            aoc[dataHelper].content &&
            Array.isArray(aoc[dataHelper].content.content)
          ) {
            aoc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              codNaturezaDaDespesa: line.slice(19, 25).trim(),
              dataAlteracao: line.slice(25, 33).trim(),
              nrAlteracao: line.slice(33, 36).trim(),
              tipoAlteracao: line.slice(36, 38).trim(),
              vlAlteracao: line.slice(38, 51).trim(),
              vlSaldoAntDotacao: line.slice(51, 64).trim(),
              vlSaldoAtual: line.slice(64, 77).trim(),
              nroSequencial: line.slice(80, 86).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            aoc[dataHelper] &&
            aoc[dataHelper].content &&
            Array.isArray(aoc[dataHelper].content.content)
          ) {
            aoc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              codNaturezaDaDespesa: line.slice(19, 25).trim(),
              dataAlteracao: line.slice(25, 33).trim(),
              nrAlteracao: line.slice(33, 36).trim(),
              tipoAlteracao: line.slice(36, 38).trim(),
              codFontRecursos: line.slice(38, 41).trim(),
              vlAlteracaoFonte: line.slice(41, 54).trim(),
              vlSaldoAntFonte: line.slice(54, 67).trim(),
              vlSaldoAtualFonte: line.slice(67, 80).trim(),
              nroSequencial: line.slice(80, 86).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "90") {
          if (
            aoc[dataHelper] &&
            aoc[dataHelper].content &&
            Array.isArray(aoc[dataHelper].content.content)
          ) {
            aoc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              nrLeiSuplementacao: line.slice(2, 8).trim(),
              dataLeiSuplementacao: line.slice(8, 16).trim(),
              vlAutorizadoSuplementacao: line.slice(16, 29).trim(),
              nroSequencial: line.slice(80, 86).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "91") {
          if (
            aoc[dataHelper] &&
            aoc[dataHelper].content &&
            Array.isArray(aoc[dataHelper].content.content)
          ) {
            aoc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              nrLeiCreditoEsp: line.slice(2, 8).trim(),
              dataLeiCreditoEsp: line.slice(8, 16).trim(),
              vlAutorizadoCreditoEsp: line.slice(16, 29).trim(),
              nroSequencial: line.slice(80, 86).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "92") {
          if (
            aoc[dataHelper] &&
            aoc[dataHelper].content &&
            Array.isArray(aoc[dataHelper].content.content)
          ) {
            aoc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              nrLeiRealocRec: line.slice(2, 8).trim(),
              dataLeiRealocRec: line.slice(8, 16).trim(),
              vlAutorizadoRealocRec: line.slice(16, 29).trim(),
              nroSequencial: line.slice(80, 86).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "93") {
          if (
            aoc[dataHelper] &&
            aoc[dataHelper].content &&
            Array.isArray(aoc[dataHelper].content.content)
          ) {
            aoc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              nrLeiAltPPA: line.slice(2, 8).trim(),
              dataLeiAltPPA: line.slice(8, 16).trim(),
              nroSequencial: line.slice(80, 86).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "94") {
          if (
            aoc[dataHelper] &&
            aoc[dataHelper].content &&
            Array.isArray(aoc[dataHelper].content.content)
          ) {
            aoc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              nrDecreto: line.slice(2, 8).trim(),
              dataDecreto: line.slice(8, 16).trim(),
              vlDecreto: line.slice(16, 29).trim(),
              tipoCredito: line.slice(29, 30).trim(),
              nroSequencial: line.slice(80, 86).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("aoc", aoc, 75)

    return res.status(200).json({ message: "AOC inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAoc function from /controllers/controller.aoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteAoc(req, res) {
  const { id } = req.params;
  try {
    await db("aoc").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteAoc from /controllers/controller.aoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getAocById(req, res) {
  const { id } = req.params;
  try {
    const aoc = await db("aoc").where({ id: id }).first();
    if (!aoc) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(aoc);
  } catch (error) {
    console.error(
      "error from getAocById function from /controllers/controller.aoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateAoc(req, res) {
  const { id } = req.params;
  const aocData = req.body;
  const body = aocData.body;
  const index = aocData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("aoc").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Aoc não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("aoc").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("aoc").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateAoc function from /controllers/controller.aoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAocManual(req, res) {
  const { body } = req.body;
  const { data } = req.body;
  try {
    let dataHelper = null;
    let insert = {};
    for (const item of body) {
      if (item.type === "tipoRegistro") {
        dataHelper = item.value;
        insert[item.value] = {};
        continue;
      }
      insert[dataHelper][item.type] = item.value;
    }
    insert.data = data;
    await db("aoc").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAocManual function from /controllers/controller.aoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllAoc,
  Inserir,
  InserirAoc,
  deleteAoc,
  getAocById,
  updateAoc,
  InserirAocManual,
};

