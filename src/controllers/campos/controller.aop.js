import { db } from "../../database/postgres.js";
async function getAllAop(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("aop");

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
      "error from getAllAop function from /controllers/controller.aop.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const aop = req.body;

    await db("aop").insert(aop);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.aop.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAop(req, res) { 
  const { text, data } = req.body;
  const aop = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          aop.push({
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
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              dotOrigP2001: line.slice(27, 48).trim(),
              nroEmpenho: line.slice(48, 54).trim(),
              nroOP: line.slice(54, 60).trim(),
              dtAnulacao: line.slice(60, 68).trim(),
              nrAnulacaoOP: line.slice(68, 71).trim(),
              tipoOP: line.slice(71, 72).trim(),
              dtInscricao: line.slice(72, 80).trim(),
              dtEmissao: line.slice(80, 88).trim(),
              vlOP: line.slice(88, 101).trim(),
              vlAnuladoOP: line.slice(101, 114).trim(),
              nomeCredor: line.slice(114, 164).trim(),
              tipoCredor: line.slice(164, 165).trim(),
              cpfCnpj: line.slice(165, 179).trim(),
              especificacaoOP: line.slice(179, 379).trim(),
              nrExtraOrcamentaria: line.slice(379, 385).trim(),
              nroSequencial: line.slice(385, 391).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            aop[dataHelper] &&
            aop[dataHelper].content &&
            Array.isArray(aop[dataHelper].content.content)
          ) {
            aop[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              dotOrigP2001: line.slice(27, 48).trim(),
              nroEmpenho: line.slice(48, 54).trim(),
              nroOP: line.slice(54, 60).trim(),
              dtAnulacao: line.slice(60, 68).trim(),
              nrAnulacaoOP: line.slice(68, 71).trim(),
              nrLiquidacao: line.slice(71, 77).trim(),
              dtLiquidacao: line.slice(77, 85).trim(),
              vlAnulacao: line.slice(85, 98).trim(),
              nroSequencial: line.slice(385, 391).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            aop[dataHelper] &&
            aop[dataHelper].content &&
            Array.isArray(aop[dataHelper].content.content)
          ) {
            aop[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              dotOrigP2001: line.slice(27, 48).trim(),
              nroEmpenho: line.slice(48, 54).trim(),
              nroOP: line.slice(54, 60).trim(),
              dtAnulacao: line.slice(60, 68).trim(),
              nrAnulacaoOP: line.slice(68, 71).trim(),
              codUnidadeFinanceira: line.slice(71, 73).trim(),
              banco: line.slice(73, 76).trim(),
              agencia: line.slice(76, 80).trim(),
              contaCorrente: line.slice(80, 92).trim(),
              contaCorrenteDigVerif: line.slice(92, 93).trim(),
              tipoConta: line.slice(93, 95).trim(),
              nrDocumento: line.slice(95, 110).trim(),
              tipoDocumento: line.slice(110, 112).trim(),
              vlDocumento: line.slice(112, 125).trim(),
              dtEmissao: line.slice(125, 133).trim(),
              vlAnulacao: line.slice(133, 146).trim(),
              nroSequencial: line.slice(385, 391).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "13") {
          if (
            aop[dataHelper] &&
            aop[dataHelper].content &&
            Array.isArray(aop[dataHelper].content.content)
          ) {
            aop[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              dotOrigP2001: line.slice(27, 48).trim(),
              nroEmpenho: line.slice(48, 54).trim(),
              nroOP: line.slice(54, 60).trim(),
              dtAnulacao: line.slice(60, 68).trim(),
              nrAnulacaoOP: line.slice(68, 71).trim(),
              codUnidadeFinanceira: line.slice(71, 73).trim(),
              banco: line.slice(73, 76).trim(),
              agencia: line.slice(76, 80).trim(),
              contaCorrente: line.slice(80, 92).trim(),
              contaCorrenteDigVerif: line.slice(92, 93).trim(),
              tipoConta: line.slice(93, 95).trim(),
              nrDocumento: line.slice(95, 110).trim(),
              codFonteRecurso: line.slice(110, 116).trim(),
              vlAnulacaoFR: line.slice(116, 129).trim(),
              nroSequencial: line.slice(385, 391).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "14") {
          if (
            aop[dataHelper] &&
            aop[dataHelper].content &&
            Array.isArray(aop[dataHelper].content.content)
          ) {
            aop[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              dotOrigP2001: line.slice(27, 48).trim(),
              nroEmpenho: line.slice(48, 54).trim(),
              nroOP: line.slice(54, 60).trim(),
              dtAnulacao: line.slice(60, 68).trim(),
              nrAnulacaoOP: line.slice(68, 71).trim(),
              tipoRetencao: line.slice(71, 73).trim(),
              VlAnulacaoRetencao: line.slice(73, 86).trim(),
              nrExtraOrcamentaria: line.slice(86, 92).trim(),
              nroSequencial: line.slice(385, 391).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("aop", aop, 75)

    return res.status(200).json({ message: "Aop inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAop function from /controllers/controller.aop.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteAop(req, res) {
  const { id } = req.params;
  try {
    await db("aop").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteAop from /controllers/controller.aop.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getAopById(req, res) {
  const { id } = req.params;
  try {
    const aop = await db("aop").where({ id: id }).first();
    if (!aop) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(aop);
  } catch (error) {
    console.error(
      "error from getAopById function from /controllers/controller.aop.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateAop(req, res) {
  const { id } = req.params;
  const aopData = req.body;
  const body = aopData.body;
  const index = aopData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("aop").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Aop não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("aop").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("aop").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateAop function from /controllers/controller.aop.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAopManual(req, res) {
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
    await db("aop").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAopManual function from /controllers/controller.aop.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllAop,
  Inserir,
  InserirAop,
  deleteAop,
  getAopById,
  updateAop,
  InserirAopManual,
};

