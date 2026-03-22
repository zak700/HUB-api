import { db } from "../../database/postgres.js";
async function getAllLqd(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("lqd");

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
      "error from getAllLqd function from /controllers/controller.lqd.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const lqd = req.body;

    await db("lqd").insert(lqd);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.lqd.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirLqd(req, res) { 
  const { text, data } = req.body;
  const lqd = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          lqd.push({
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
              dtEmpenho: line.slice(54, 62).trim(),
              nrLiquidacao: line.slice(62, 68).trim(),
              dtLiquidacao: line.slice(68, 76).trim(),
              tpLiquidacao: line.slice(76, 77).trim(),
              vlLiquidado: line.slice(77, 90).trim(),
              respLiquidacao: line.slice(90, 140).trim(),
              cpfRespLiquidacao: line.slice(140, 151).trim(),
              especificacaoLiquidacao: line.slice(151, 351).trim(),
              nroSequencial: line.slice(351, 357).trim(),
              content: [],
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            lqd[dataHelper] &&
            lqd[dataHelper].content &&
            Array.isArray(lqd[dataHelper].content.content)
          ) {
            lqd[dataHelper].content.content.push({
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
              nroEmpenho: line.slice(48, 54).trim(), // chave
              dtEmpenho: line.slice(54, 62).trim(),
              nrLiquidacao: line.slice(62, 68).trim(), 
              dtLiquidacao: line.slice(68, 76).trim(),
              codFonteRecurso: line.slice(76, 82).trim(),
              vlDespesaFR: line.slice(82, 95).trim(),
              nroSequencial: line.slice(351, 357).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            lqd[dataHelper] &&
            lqd[dataHelper].content &&
            Array.isArray(lqd[dataHelper].content.content)
          ) {
            lqd[dataHelper].content.content.push({
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
              dtEmpenho: line.slice(54, 62).trim(),
              nrLiquidacao: line.slice(62, 68).trim(),
              dtLiquidacao: line.slice(68, 76).trim(),
              tipoDocFiscal: line.slice(76, 78).trim(),
              nroDocFiscal: line.slice(78, 88).trim(),
              serieDocFiscal: line.slice(88, 96).trim(),
              dtDocFiscal: line.slice(96, 104).trim(),
              chaveAcesso: line.slice(104, 148).trim(),
              vlDocValorTotal: line.slice(148, 161).trim(),
              vlDocAssociado: line.slice(161, 174).trim(),
              CNPJCPFCredor: line.slice(174, 188).trim(),
              tipoCredor: line.slice(188, 189).trim(),
              nrInscEstadual: line.slice(189, 204).trim(),
              nrInscMunicipal: line.slice(204, 219).trim(),
              CEPMunicipio: line.slice(219, 227).trim(),
              ufCredor: line.slice(227, 229).trim(),
              nomeCredor: line.slice(229, 279).trim(),
              nroSequencial: line.slice(351, 357).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("lqd", lqd, 75)

    return res.status(200).json({ message: "LQD inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirLqd function from /controllers/controller.lqd.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteLqd(req, res) {
  const { id } = req.params;
  try {
    await db("Lqd").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteLqd from /controllers/controller.lqd.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getLqdById(req, res) {
  const { id } = req.params;
  try {
    const lqd = await db("lqd").where({ id: id }).first();
    if (!lqd) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(lqd);
  } catch (error) {
    console.error(
      "error from getLqdById function from /controllers/controller.lqd.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateLqd(req, res) {
  const { id } = req.params;
  
  const lqdData = req.body;
  const body = lqdData.body;
  const index = lqdData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("lqd").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Lqd não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("lqd").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("lqd").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateLqd function from /controllers/controller.lqd.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirLqdManual(req, res) {
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
    await db("lqd").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirLqdManual function from /controllers/controller.lqd.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllLqd,
  Inserir,
  InserirLqd,
  deleteLqd,
  getLqdById,
  updateLqd,
  InserirLqdManual,
};
