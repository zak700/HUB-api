import { db } from "../../database/postgres.js";
async function getAllCon(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("con");

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
      "error from getAllCon function from /controllers/controller.con.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const con = req.body;

    await db("con").insert(con);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.con.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirCon(req, res) {
  const { text, data } = req.body; 
  const con = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          con.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroContrato: line.slice(6, 26).trim(),
              anoContrato: line.slice(26, 30).trim(),
              tipoAjuste: line.slice(30, 31).trim(),
              cpfCnpj: line.slice(31, 45).trim(),
              dataFirmaturaContrato: line.slice(45, 53).trim(),
              dataPublicacao: line.slice(53, 61).trim(),
              dataInicio: line.slice(61, 69).trim(),
              dataFinal: line.slice(69, 77).trim(),
              tipoContrato: line.slice(77, 78).trim(),
              objetoContrato: line.slice(78, 333).trim(),
              vlContrato: line.slice(333, 346).trim(),
              nomeCredor: line.slice(346, 396).trim(),
              tipoPessoa: line.slice(396, 397).trim(),
              cmodalidadeLicitacao: line.slice(397, 399).trim(),
              fundamentacaoLegal: line.slice(399, 401).trim(),
              justificativaDispensaInexibilidade: line.slice(401, 651).trim(),
              razaoEscolha: line.slice(651, 896).trim(),
              nroProcLicitacao: line.slice(896, 904).trim(),
              anoProcLicitacao: line.slice(904, 908).trim(),
              nroProcAdmCorrespondente: line.slice(908, 928).trim(),
              nroInstrumentoContrato: line.slice(928, 931).trim(),
              assunto: line.slice(931, 933).trim(),
              nroSequencial: line.slice(933, 939).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            con[dataHelper] &&
            con[dataHelper].content &&
            Array.isArray(con[dataHelper].content.content)
          ) {
            con[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroContrato: line.slice(6, 26).trim(),
              anoContrato: line.slice(26, 30).trim(),
              tipoAjuste: line.slice(30, 31).trim(),
              subAssunto: line.slice(31, 33).trim(),
              codObra: line.slice(33, 37).trim(),
              anoObra: line.slice(37, 41).trim(),
              detalhamentoSubAssunto: line.slice(41, 241).trim(),
              nroSequencial: line.slice(933, 939).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "21") {
          if (
            con[dataHelper] &&
            con[dataHelper].content &&
            Array.isArray(con[dataHelper].content.content)
          ) {
            con[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroContrato: line.slice(6, 26).trim(),
              anoContrato: line.slice(26, 30).trim(),
              tipoAjuste: line.slice(30, 31).trim(),
              nroTermo: line.slice(31, 35).trim(),
              dataFirmatura: line.slice(35, 43).trim(),
              prazo: line.slice(43, 47).trim(),
              nroSequencial: line.slice(933, 939).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "22") {
          if (
            con[dataHelper] &&
            con[dataHelper].content &&
            Array.isArray(con[dataHelper].content.content)
          ) {
            con[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroContrato: line.slice(6, 26).trim(),
              anoContrato: line.slice(26, 30).trim(),
              tipoAjuste: line.slice(30, 31).trim(),
              numeroTermo: line.slice(31, 35).trim(),
              dataLancamento: line.slice(35, 43).trim(),
              valorAcrescimo: line.slice(43, 56).trim(),
              valorDecrescimo: line.slice(56, 69).trim(),
              valorContratual: line.slice(69, 82).trim(),
              nroSequencial: line.slice(933, 939).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "23") {
          if (
            con[dataHelper] &&
            con[dataHelper].content &&
            Array.isArray(con[dataHelper].content.content)
          ) {
            con[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroContrato: line.slice(6, 26).trim(),
              anoContrato: line.slice(26, 30).trim(),
              tipoAjuste: line.slice(30, 31).trim(),
              nroTermo: line.slice(31, 35).trim(),
              dataRescisao: line.slice(35, 43).trim(),
              dataCancelamento: line.slice(43, 51).trim(),
              valorCancelamento: line.slice(51, 64).trim(),
              valorFinalContrato: line.slice(64, 77).trim(),
              nroSequencial: line.slice(933, 939).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("con", con, 75)

    return res.status(200).json({ message: "CON inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirCon function from /controllers/controller.con.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteCon(req, res) {
  const { id } = req.params;
  try {
    await db("con").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteCon from /controllers/controller.con.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getConById(req, res) {
  const { id } = req.params;
  try {
    const con = await db("con").where({ id: id }).first();
    if (!con) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(con);
  } catch (error) {
    console.error(
      "error from getEmpById function from /controllers/controller.con.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateCon(req, res) {
  const { id } = req.params;
  const conData = req.body;
  const body = conData.body;
  const index = conData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("con").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Con não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("con").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("con").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateCon function from /controllers/controller.con.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirConManual(req, res) {
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
    await db("con").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirConManual function from /controllers/controller.con.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllCon,
  Inserir,
  InserirCon,
  deleteCon,
  getConById,
  updateCon,
  InserirConManual,
};

