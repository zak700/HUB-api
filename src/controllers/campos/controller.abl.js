import { db } from "../../database/postgres.js";

async function getAllAbl(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("abl");

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
      "error from getAllAbl function from /controllers/controller.abl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const abl = req.body;

    await db("abl").insert(abl);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.abl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAbl(req, res) {
  const { text, data } = req.body;
  const abl = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          abl.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              codModalidadeLicita: line.slice(22, 23).trim(),
              nroModalidade: line.slice(23, 33).trim(),
              naturezaProcedimento: line.slice(33, 34).trim(),
              dtAbertura: line.slice(34, 42).trim(),
              dtEditalConvite: line.slice(42, 50).trim(),
              dtPublicacaoEditalDO: line.slice(50, 58).trim(),
              dtRecebimentoDoc: line.slice(58, 66).trim(),
              tipoLicitacao: line.slice(66, 67).trim(),
              naturezaObjeto: line.slice(67, 68).trim(),
              Objeto: line.slice(68, 568).trim(),
              regimeExecucaoObras: line.slice(568, 569).trim(),
              nroConvidado: line.slice(569, 572).trim(),
              clausulaProrrogacao: line.slice(572, 822).trim(),
              unidadeMedidaPrazo: line.slice(822, 823).trim(),
              prazoExecucao: line.slice(823, 827).trim(),
              formaPagamento: line.slice(827, 927).trim(),
              criterioAceitabilidade: line.slice(927, 1027).trim(),
              descontoTabela: line.slice(1027, 1028).trim(),
              nroSequencial: line.slice(1028, 1034).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            abl[dataHelper] &&
            abl[dataHelper].content &&
            Array.isArray(abl[dataHelper].content.content)
          ) {
            abl[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              nroLote: line.slice(22, 26).trim(),
              nroItem: line.slice(26, 30).trim(),
              dtCotacao: line.slice(30, 38).trim(),
              dscItem: line.slice(38, 288).trim(),
              vlCotPrecosUnitario: line.slice(288, 301).trim(),
              quantidade: line.slice(301, 314).trim(),
              unidade: line.slice(314, 316).trim(),
              vlMinAlienBens: line.slice(316, 329).trim(),
              nroSequencial: line.slice(1028, 1034).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            abl[dataHelper] &&
            abl[dataHelper].content &&
            Array.isArray(abl[dataHelper].content.content)
          ) {
            abl[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              nroLote: line.slice(22, 26).trim(),
              nroItem: line.slice(26, 30).trim(),
              dscItem: line.slice(30, 280).trim(),
              vlItem: line.slice(280, 293).trim(),
              nroSequencial: line.slice(1028, 1034).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "13") {
          if (
            abl[dataHelper] &&
            abl[dataHelper].content &&
            Array.isArray(abl[dataHelper].content.content)
          ) {
            abl[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              codFuncao: line.slice(22, 24).trim(),
              codSubfuncao: line.slice(24, 27).trim(),
              codPrograma: line.slice(27, 31).trim(),
              naturezaAcao: line.slice(31, 32).trim(),
              nroProjAtiv: line.slice(32, 35).trim(),
              elementoDespesa: line.slice(35, 41).trim(),
              subElemento: line.slice(41, 43).trim(),
              codFonteRecurso: line.slice(43, 49).trim(),
              vlRecurso: line.slice(49, 62).trim(),
              nroSequencial: line.slice(1028, 1034).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("abl", abl, 75)

    return res.status(200).json({ message: "ABL inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAbl function from /controllers/controller.abl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteAbl(req, res) {
  const { id } = req.params;
  try {
    await db("abl").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteAbl from /controllers/controller.abl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getAblById(req, res) {
  const { id } = req.params;
  try {
    const abl = await db("abl").where({ id: id }).first();
    if (!abl) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(abl);
  } catch (error) {
    console.error(
      "error from getAblById function from /controllers/controller.abl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateAbl(req, res) {
  const { id } = req.params;
  const ablData = req.body;
  const body = ablData.body;
  const index = ablData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("abl").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "ABL não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("abl").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("abl").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateAbl function from /controllers/controller.abl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAblManual(req, res) {
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
    await db("abl").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAblManual function from /controllers/controller.abl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllAbl,
  Inserir,
  InserirAbl,
  deleteAbl,
  getAblById,
  updateAbl,
  InserirAblManual,
};

