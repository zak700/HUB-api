import { db } from "../../database/postgres.js";
async function getAllAnl(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("anl");

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
      "error from getAllAnl function from /controllers/controller.anl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const anl = req.body;

    await db("anl").insert(anl);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.anl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAnl(req, res) { 
  const { text, data } = req.body;
  const anl = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          anl.push({
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
              nroEmpenho: line.slice(27, 33).trim(),
              dtAnulacao: line.slice(33, 41).trim(),
              nrAnulacao: line.slice(41, 44).trim(),
              dtEmpenho: line.slice(44, 52).trim(),
              vlOriginal: line.slice(52, 65).trim(),
              vlAnulacao: line.slice(65, 78).trim(),
              nomeCredor: line.slice(78, 128).trim(),
              tipoCredor: line.slice(128, 129).trim(),
              cpfCnpj: line.slice(129, 143).trim(),
              especificacaoEmpenho: line.slice(143, 343).trim(),
              nroSequencial: line.slice(343, 349).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            anl[dataHelper] &&
            anl[dataHelper].content &&
            Array.isArray(anl[dataHelper].content.content)
          ) {
            anl[dataHelper].content.content.push({
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
              nroEmpenho: line.slice(27, 33).trim(),
              dtAnulacao: line.slice(33, 41).trim(),
              nrAnulacao: line.slice(41, 44).trim(),
              codFontRecursos: line.slice(44, 50).trim(),
              vlEmpFonte: line.slice(50, 63).trim(),
              vlAnulacaoFonte: line.slice(63, 76).trim(),
              nroSequencial: line.slice(343, 349).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            anl[dataHelper] &&
            anl[dataHelper].content &&
            Array.isArray(anl[dataHelper].content.content)
          ) {
            anl[dataHelper].content.content.push({
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
              nroEmpenho: line.slice(27, 33).trim(),
              dtAnulacao: line.slice(33, 41).trim(),
              nrAnulacao: line.slice(41, 44).trim(),
              codUnidadeObra: line.slice(44, 46).trim(),
              codObra: line.slice(46, 50).trim(),
              anoObra: line.slice(50, 54).trim(),
              vlAnuladoObra: line.slice(54, 67).trim(),
              nroSequencial: line.slice(343, 349).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "13") {
          if (
            anl[dataHelper] &&
            anl[dataHelper].content &&
            Array.isArray(anl[dataHelper].content.content)
          ) {
            anl[dataHelper].content.content.push({
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
              nroEmpenho: line.slice(27, 33).trim(),
              dtAnulacao: line.slice(33, 41).trim(),
              nrAnulacao: line.slice(41, 44).trim(),
              codUnidadeContrato: line.slice(44, 46).trim(),
              nroContrato: line.slice(46, 66).trim(),
              anoContrato: line.slice(66, 70).trim(),
              tipoAjuste: line.slice(70, 71).trim(),
              vlAnuladoContrato: line.slice(71, 84).trim(),
              nroSequencial: line.slice(343, 349).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "14") {
          if (
            anl[dataHelper] &&
            anl[dataHelper].content &&
            Array.isArray(anl[dataHelper].content.content)
          ) {
            anl[dataHelper].content.content.push({
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
              nroEmpenho: line.slice(27, 33).trim(),
              dtAnulacao: line.slice(33, 41).trim(),
              nrAnulacao: line.slice(41, 44).trim(),
              cpfCnpjCredor: line.slice(44, 58).trim(),
              tipoCredor: line.slice(58, 59).trim(),
              nomeCredor: line.slice(59, 109).trim(),
              vlAnuladoCredor: line.slice(109, 122).trim(),
              nroSequencial: line.slice(343, 349).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("anl", anl, 75)

    return res.status(200).json({ message: "ANL inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAnl function from /controllers/controller.anl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteAnl(req, res) {
  const { id } = req.params;
  try {
    await db("anl").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteAnl from /controllers/controller.anl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getAnlById(req, res) {
  const { id } = req.params;
  try {
    const anl = await db("anl").where({ id: id }).first();
    if (!anl) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(anl);
  } catch (error) {
    console.error(
      "error from getAnlById function from /controllers/controller.anl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateAnl(req, res) {
  const { id } = req.params;
  const anlData = req.body;
  const body = anlData.body;
  const index = anlData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("anl").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Anl não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("anl").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("anl").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateAnl function from /controllers/controller.anl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAnlManual(req, res) {
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
    await db("anl").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAnlManual function from /controllers/controller.anl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllAnl,
  Inserir,
  InserirAnl,
  deleteAnl,
  getAnlById,
  updateAnl,
  InserirAnlManual,
};

