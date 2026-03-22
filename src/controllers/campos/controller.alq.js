import { db } from "../../database/postgres.js";
async function getAllAlq(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("alq");

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
      "error from getAllAlq function from /controllers/controller.alq.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const alq = req.body;

    await db("alq").insert(alq);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.alq.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAlq(req, res) { 
  const { text, data } = req.body;
  const alq = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          alq.push({
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
              nrLiquidacaoANL: line.slice(76, 82).trim(),
              dtAnulacaoLiq: line.slice(82, 90).trim(),
              tpLiquidacao: line.slice(90, 91).trim(),
              vlLiquidado: line.slice(91, 104).trim(),
              vlAnulado: line.slice(104, 117).trim(),
              nroSequencial: line.slice(236, 242).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            alq[dataHelper] &&
            alq[dataHelper].content &&
            Array.isArray(alq[dataHelper].content.content)
          ) {
            alq[dataHelper].content.content.push({
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
              nrLiquidacaoANL: line.slice(76, 82).trim(),
              dtAnulacaoLiq: line.slice(82, 90).trim(),
              codFonteRecurso: line.slice(90, 96).trim(),
              vlLiquidadoFR: line.slice(96, 109).trim(),
              vlAnuladoFR: line.slice(109, 122).trim(),
              nroSequencial: line.slice(236, 242).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            alq[dataHelper] &&
            alq[dataHelper].content &&
            Array.isArray(alq[dataHelper].content.content)
          ) {
            alq[dataHelper].content.content.push({
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
              nrLiquidacaoANL: line.slice(76, 82).trim(),
              dtAnulacaoLiq: line.slice(82, 90).trim(),
              tipoDocFiscal: line.slice(90, 92).trim(),
              nroDocFiscal: line.slice(92, 102).trim(),
              serieDocFiscal: line.slice(102, 110).trim(),
              dtDocFiscal: line.slice(110, 118).trim(),
              vlAnulado: line.slice(118, 131).trim(),
              CNPJCPFCredor: line.slice(131, 145).trim(),
              tipoCredor: line.slice(145, 146).trim(),
              nrInscEstadual: line.slice(146, 161).trim(),
              nrInscMunicipal: line.slice(161, 176).trim(),
              CEPMunicipio: line.slice(176, 184).trim(),
              ufCredor: line.slice(184, 186).trim(),
              nomeCredor: line.slice(186, 236).trim(),
              nroSequencial: line.slice(236, 242).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "13") {
          if (
            alq[dataHelper] &&
            alq[dataHelper].content &&
            Array.isArray(alq[dataHelper].content.content)
          ) {
            alq[dataHelper].content.content.push({
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
              nrLiquidacaoANL: line.slice(76, 82).trim(),
              dtAnulacaoLiq: line.slice(82, 90).trim(),
              tipoDocFiscal: line.slice(90, 92).trim(),
              nroDocFiscal: line.slice(92, 102).trim(),
              serieDocFiscal: line.slice(102, 110).trim(),
              dtDocFiscal: line.slice(110, 118).trim(),
              vlCancelado: line.slice(118, 131).trim(),
              CNPJCPFCredor: line.slice(131, 145).trim(),
              tipoCredor: line.slice(145, 146).trim(),
              nrInscEstadual: line.slice(146, 161).trim(),
              nrInscMunicipal: line.slice(161, 176).trim(),
              CEPMunicipio: line.slice(176, 184).trim(),
              ufCredor: line.slice(184, 186).trim(),
              nomeCredor: line.slice(186, 236).trim(),
              nroSequencial: line.slice(236, 242).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("alq", alq, 75)

    return res.status(200).json({ message: "ALQ inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAlq function from /controllers/controller.alq.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteAlq(req, res) {
  const { id } = req.params;
  try {
    await db("alq").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteAlq from /controllers/controller.alq.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getAlqById(req, res) {
  const { id } = req.params;
  try {
    const alq = await db("alq").where({ id: id }).first();
    if (!alq) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(alq);
  } catch (error) {
    console.error(
      "error from getAlqById function from /controllers/controller.alq.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateAlq(req, res) {
  const { id } = req.params;
  const alqData = req.body;
  const body = alqData.body;
  const index = alqData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("alq").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Alq não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("alq").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("alq").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateAlq function from /controllers/controller.alq.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAlqManual(req, res) {
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
    await db("alq").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAlqManual function from /controllers/controller.alq.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllAlq,
  Inserir,
  InserirAlq,
  deleteAlq,
  getAlqById,
  updateAlq,
  InserirAlqManual,
};

