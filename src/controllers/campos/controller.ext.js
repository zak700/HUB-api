import { db } from "../../database/postgres.js";
async function getAllExt(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("ext");

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
      "error from getAllExt function from /controllers/controller.ext.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const ext = req.body;

    await db("ext").insert(ext);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.ext.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirExt(req, res) { 
  const { text, data } = req.body;
  const ext = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          ext.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              Categoria: line.slice(6, 7).trim(),
              tipoLancamento: line.slice(7, 9).trim(),
              subTipo: line.slice(9, 12).trim(),
              desdobraSubTipo: line.slice(12, 15).trim(),
              nrExtraOrcamentaria: line.slice(15, 21).trim(),
              descExtraOrc: line.slice(21, 71).trim(),
              vlLancamento: line.slice(71, 84).trim(),
              nroSequencial: line.slice(84, 90).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            ext[dataHelper] &&
            ext[dataHelper].content &&
            Array.isArray(ext[dataHelper].content.content)
          ) {
            ext[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              Categoria: line.slice(6, 7).trim(),
              tipoLancamento: line.slice(7, 9).trim(),
              subTipo: line.slice(9, 12).trim(),
              desdobraSubTipo: line.slice(12, 15).trim(),
              nrExtraOrcamentaria: line.slice(15, 21).trim(),
              codUnidadeFinanceira: line.slice(21, 23).trim(),
              banco: line.slice(23, 26).trim(),
              agencia: line.slice(26, 30).trim(),
              contaCorrente: line.slice(30, 42).trim(),
              contaCorrenteDigVerif: line.slice(42, 43).trim(),
              tipoConta: line.slice(43, 45).trim(),
              vlMovimentacao: line.slice(45, 58).trim(),
              nroSequencial: line.slice(84, 90).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            ext[dataHelper] &&
            ext[dataHelper].content &&
            Array.isArray(ext[dataHelper].content.content)
          ) {
            ext[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              Categoria: line.slice(6, 7).trim(),
              tipoLancamento: line.slice(7, 9).trim(),
              subTipo: line.slice(9, 12).trim(),
              desdobraSubTipo: line.slice(12, 15).trim(),
              nrExtraOrcamentaria: line.slice(15, 21).trim(),
              codUnidadeFinanceira: line.slice(21, 23).trim(),
              banco: line.slice(23, 26).trim(),
              agencia: line.slice(26, 30).trim(),
              contaCorrente: line.slice(30, 42).trim(),
              contaCorrenteDigVerif: line.slice(42, 43).trim(),
              tipoConta: line.slice(43, 45).trim(),
              codFonteRecurso: line.slice(45, 51).trim(),
              vlFR: line.slice(51, 64).trim(),
              nroSequencial: line.slice(84, 90).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("ext", ext, 75)

    return res.status(200).json({ message: "EXT inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirExt function from /controllers/controller.ext.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteExt(req, res) {
  const { id } = req.params;
  try {
    await db("ext").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteExt from /controllers/controller.ext.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getExtById(req, res) {
  const { id } = req.params;
  try {
    const ext = await db("ext").where({ id: id }).first();
    if (!ext) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(ext);
  } catch (error) {
    console.error(
      "error from getExtById function from /controllers/controller.ext.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateExt(req, res) {
  const { id } = req.params;
  
  const extData = req.body;
  const body = extData.body;
  const index = extData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("ext").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Ext não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("ext").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("ext").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateExt function from /controllers/controller.ext.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirExtManual(req, res) {
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
    await db("ext").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirExtManual function from /controllers/controller.ext.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllExt,
  Inserir,
  InserirExt,
  deleteExt,
  getExtById,
  updateExt,
  InserirExtManual,
};

